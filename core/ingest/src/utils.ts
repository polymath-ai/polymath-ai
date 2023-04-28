import { uint8ArrayToBase64, base64ToUint8Array } from './base64/core.js';

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
  return uint8ArrayToBase64(new Uint8Array(new Float32Array(data)), 'base64', false, null).result;
}

export function decodeEmbedding(data : string) : number[] {
  return Array.from(new Float32Array(base64ToUint8Array(data, 'base64', false, null).result.buffer));
}