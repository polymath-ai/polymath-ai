import fs from "fs";

export class Logger {
  private filename: string;
  private lines: string[] = [];

  constructor(filename: string) {
    this.filename = filename;
  }

  log(message: string) {
    this.lines.push(message);
  }

  async save() {
    await new Promise<void>((resolve) => {
      fs.appendFile(this.filename, this.lines.join("\n"), (err) => {
        if (err) throw err;
        resolve();
      });
    });
  }
}
