import fs from "fs";
import path from "path";

export class Prompts {
  private root: string;

  constructor(root: string) {
    this.root = root;
  }

  get(name: string, params: Record<string, string> = {}) {
    const filename = path.resolve(this.root, `${name}.txt`);
    const template = fs.readFileSync(filename, "utf8");
    return Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(`\${${key}}`, value),
      template
    );
  }
}
