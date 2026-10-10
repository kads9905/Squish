// Must be the first import: ES imports are hoisted, so a dotenv.config() call
// would run after app.js (and its process.env reads) had already loaded
import "dotenv/config";
import fs from "fs";
import connectDB from "./config/db.js";
import app from "./app.js";
import { UPLOAD_DIR, PROCESSED_DIR } from "./constants.js";
import { MediaFile } from "./models/mediaFile.model.js";

// uploads/* is gitignored, so make sure the folders exist on a fresh clone
[UPLOAD_DIR, PROCESSED_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

connectDB()
  .then(async () => {
    // Jobs that were mid-flight when the server stopped will never finish
    const { modifiedCount } = await MediaFile.updateMany(
      { status: "processing" },
      { $set: { status: "failed", errorMessage: "Server restarted during processing", progress: 0 } }
    );

    if (modifiedCount) {
      console.log(`Marked ${modifiedCount} interrupted job(s) as failed`);
    }

    // Start Express only after MongoDB is connected
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Server failed to start", err);
  });
