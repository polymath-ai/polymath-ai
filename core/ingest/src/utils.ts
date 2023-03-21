export function cleanFilePath(path: string): string {
  return path.replace(/[.\/\:\?]/g, "-");
}

/*
  Removes urls and emojis from a string

  Equivalent to python's clean-text pip package.
*/
export function cleanText(input: string): string {
  return input
    .replace(/(https?:\/\/[^\s]+)/g, "") // Remove urls
  //.replace(/[^\u{1F600}-\u{1F6FF}\s]/ug, ""); // Remove emojis (https://stackoverflow.com/questions/24672834/how-do-i-remove-emoji-from-string)
}

export function encodeEmbedding(data : number[]) : string {
  return Buffer.from(new Float32Array(data).buffer).toString("base64");
}

export function decodeEmbedding(data : string) : number[] {
  return Array.from(
    new Float32Array(new Uint8Array(Buffer.from(data, "base64")).buffer)
  );
}