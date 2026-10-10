import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { User } from "../models/user.model.js";
import { MediaFile } from "../models/mediaFile.model.js";
import jwt from "jsonwebtoken";


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const isBlank = (value) => typeof value !== "string" || value.trim() === "";

const validateUsername = (username) => {
  if (!USERNAME_REGEX.test(username)) {
    throw new ApiError(
      400,
      "Username must be 3-30 characters: lowercase letters, numbers, '_' or '.'"
    );
  }
};


const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // Validation (also catches missing fields, not just empty strings)
  if ([fullName, username, email, password].some(isBlank)) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new ApiError(400, "Please enter a valid email address");
  }

  validateUsername(normalizedUsername);

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  // Check existing user
  const existedUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      existedUser.email === normalizedEmail
        ? "An account with this email already exists"
        : "This username is already taken"
    );
  }

  // Create user
  const user = await User.create({
    fullName: fullName.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
  });

  // Remove sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (isBlank(email) || isBlank(password)) {
    throw new ApiError(400, "Email and password are required");
  }

  // The "email" field also accepts a username
  const identifier = email.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  // Same response for unknown user and wrong password, to avoid account enumeration
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
  .status(200)
  .cookie("accessToken", accessToken, cookieOptions)
  .cookie("refreshToken", refreshToken, cookieOptions)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged in successfully"
    )
  );
});


const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);

  if (!user || incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});


const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new ApiResponse(200, {}, "User logged out successfully")
    );
});


const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username } = req.body;
  const updates = {};

  if (fullName !== undefined) {
    if (isBlank(fullName)) {
      throw new ApiError(400, "Full name cannot be empty");
    }
    updates.fullName = fullName.trim();
  }

  if (username !== undefined) {
    if (isBlank(username)) {
      throw new ApiError(400, "Username cannot be empty");
    }

    const normalizedUsername = username.trim().toLowerCase();
    validateUsername(normalizedUsername);

    const taken = await User.exists({
      username: normalizedUsername,
      _id: { $ne: req.user._id },
    });

    if (taken) {
      throw new ApiError(409, "This username is already taken");
    }

    updates.username = normalizedUsername;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (isBlank(oldPassword) || isBlank(newPassword)) {
    throw new ApiError(400, "Current and new password are required");
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const user = await User.findById(req.user._id);

  if (!(await user.isPasswordCorrect(oldPassword))) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


// Removes the account along with every uploaded and compressed file
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body || {};

  if (isBlank(password)) {
    throw new ApiError(400, "Password is required to delete your account");
  }

  const user = await User.findById(req.user._id);

  if (!(await user.isPasswordCorrect(password))) {
    throw new ApiError(400, "Password is incorrect");
  }

  const mediaFiles = await MediaFile.find({ user: user._id });

  mediaFiles.forEach((file) => {
    deleteFile(file.originalPath);
    if (file.compressedPath) deleteFile(file.compressedPath);
  });

  await MediaFile.deleteMany({ user: user._id });
  await User.findByIdAndDelete(user._id);

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

export {
    registerUser,
    loginUser,
    getCurrentUser,
    refreshAccessToken,
    logoutUser,
    updateAccountDetails,
    changeCurrentPassword,
    deleteAccount
};
