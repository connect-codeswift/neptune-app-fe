export type PixelCrop = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Failed to load image")),
    );
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize = 512,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  canvas.width = outputSize;
  canvas.height = outputSize;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to crop image."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

export async function getCroppedAvatarFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
): Promise<File> {
  const blob = await getCroppedBlob(imageSrc, pixelCrop);
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}
