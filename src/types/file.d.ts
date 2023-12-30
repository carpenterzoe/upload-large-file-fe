type fileInfo = {
  buffer: ArrayBuffer;
  HASH: string;
  suffix: string;
  filename: string;
}

type fileChunk = {
  file: Blob;
  filename: string;
}