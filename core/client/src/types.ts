import { BitInfo, PackedBit } from "@polymath-ai/types";
import { ChatCompletionResponse, CompletionResponse } from "./openai/types.js";

export type CompletionResult = {
  bits: PackedBit[];
  infos: BitInfo[];
  completion?: string;
  stream?:
    | AsyncIterable<CompletionResponse>
    | AsyncIterable<ChatCompletionResponse>;
};
