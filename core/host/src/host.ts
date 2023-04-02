import { AskOptions, LibraryData } from "@polymath-ai/types";

export abstract class PolymathHost {
  abstract ask(args: AskOptions): Promise<LibraryData>;
}
