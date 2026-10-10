import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { v4 as uuid } from "uuid";
import { PROCESSED_DIR } from "../constants.js";

// CRF: lower = better quality / bigger file
const PRESET_CRF = {
  small: 32,
  balanced: 27,
  high: 22,
};

const compressVideo = (
  inputPath,
  { preset = "balanced", resolution = "original", mute = false, onProgress } = {}
) => {
  return new Promise((resolve, reject) => {
    const outputName = `${uuid()}.mp4`;
    const outputPath = path.join(PROCESSED_DIR, outputName);

    const command = ffmpeg(inputPath)
      .videoCodec("libx264")
      .outputOptions([
        `-crf ${PRESET_CRF[preset] ?? PRESET_CRF.balanced}`,
        "-preset medium",
        "-pix_fmt yuv420p",
        // Move the moov atom to the front so the file can start playing before fully downloaded
        "-movflags +faststart",
      ]);

    if (resolution !== "original") {
      // -2 keeps the aspect ratio with an even width; min() avoids upscaling
      command.videoFilters(`scale=-2:'min(${Number(resolution)},ih)'`);
    }

    if (mute) {
      command.noAudio();
    } else {
      command.audioCodec("aac").audioBitrate("128k");
    }

    command
      .output(outputPath)
      .on("progress", (progress) => {
        if (onProgress && Number.isFinite(progress.percent)) {
          onProgress(Math.min(99, Math.max(0, Math.round(progress.percent))));
        }
      })
      .on("end", () => {
        resolve({
          outputName,
          outputPath,
        });
      })
      .on("error", (err) => {
        reject(Object.assign(err, { outputPath }));
      })
      .run();
  });
};

export { compressVideo };
