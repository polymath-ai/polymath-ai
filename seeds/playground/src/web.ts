import express from "express";

export class Web {
  private port: number;
  constructor(port = 3000) {
    this.port = port;
  }
  async serve(): Promise<void> {
    const app = express();
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });
    const server = app.listen(this.port);
    return new Promise((resolve) => {
      process.on("SIGINT", () => {
        server.close();
      });
      server.on("close", resolve);
    });
  }
}
