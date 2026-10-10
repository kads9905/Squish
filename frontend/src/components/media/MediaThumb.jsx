import { useState } from "react";
import { ImageIcon, Play } from "lucide-react";
import { mediaUrl } from "../../lib/api";
import { cn } from "../../lib/cn";

// Thumbnail for a media record; falls back to a tile for videos or broken previews
export default function MediaThumb({ file, className }) {
  const [broken, setBroken] = useState(false);
  const isImage = file.fileType === "image";
  const variant = file.status === "completed" ? "compressed" : "original";

  return (
    <div className={cn("bg-checker relative grid place-items-center overflow-hidden", className)}>
      {isImage && !broken ? (
        <img
          src={mediaUrl(file._id, variant, file.updatedAt)}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      ) : (
        <div className="grid size-full place-items-center bg-soft">
          <span className="grid size-11 place-items-center rounded-2xl bg-chip text-on-chip">
            {isImage ? <ImageIcon className="size-5" /> : <Play className="size-4 fill-current" />}
          </span>
        </div>
      )}
    </div>
  );
}
