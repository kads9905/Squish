import sharp from "sharp";
import path from "path";
import { v4 as uuid } from "uuid";
import { PROCESSED_DIR } from "../constants.js";

const compressImage = async (
  inputPath,
  quality = 80,
  format = "webp",
  maxWidth = null
) => {
  const outputName = `${uuid()}.${format}`;
  const outputPath = path.join(PROCESSED_DIR, outputName);

  // rotate() bakes EXIF orientation in, since metadata is stripped on output
  let transformer = sharp(inputPath).rotate();

  if (maxWidth) {
    transformer = transformer.resize({ width: maxWidth, withoutEnlargement: true });
  }

  switch (format) {
    case "jpeg":
      transformer = transformer.jpeg({ quality, mozjpeg: true });
      break;

    case "png":
      // PNG quality only applies when quantising to a palette
      transformer = transformer.png({ quality, palette: true, compressionLevel: 9 });
      break;

    case "avif":
      transformer = transformer.avif({ quality, effort: 4 });
      break;

    default:
      transformer = transformer.webp({ quality, effort: 5 });
  }

  const info = await transformer.toFile(outputPath);

  return {
    outputPath,
    outputName,
    width: info.width,
    height: info.height,
  };
};

const getImageDimensions = async (inputPath) => {
  try {
    const { width, height } = await sharp(inputPath).metadata();
    return { width, height };
  } catch {
    return { width: null, height: null };
  }
};

export { compressImage, getImageDimensions };
