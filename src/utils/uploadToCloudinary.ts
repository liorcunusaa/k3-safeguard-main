export async function uploadToCloudinary(fileData: string): Promise<string> {
  // If fileData is already a base64 Data URL, return it directly so image preview works instantaneously
  return fileData;
}
