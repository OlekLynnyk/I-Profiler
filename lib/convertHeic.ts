export async function convertHeicToPng(file: File): Promise<File> {
  if (typeof window === "undefined") {
    throw new Error("HEIC conversion is only supported in the browser.");
  }

  const heic2any = (await import("heic2any")).default;

  const result = await heic2any({
    blob: file,
    toType: "image/png",
  });

  let blob: Blob;
  if (Array.isArray(result)) {
    blob = result[0];
  } else {
    blob = result as Blob;
  }

  return new File([blob], file.name.replace(/\.heic$/i, ".png"), {
    type: "image/png",
  });
}
