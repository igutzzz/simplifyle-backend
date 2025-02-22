import { FileData } from "../types/types";

const processFiles = async (
  files: { name: string; data: Buffer }[]
): Promise<FileData[]> => {
  const processedFiles = files.map((file) => ({
    data: file.data.buffer, // Convertendo Buffer para ArrayBuffer
    name: file.name,
  }));

  return processedFiles;
};

export { processFiles };
