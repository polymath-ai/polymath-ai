import { Logging, Log as Logger } from "@google-cloud/logging";

export class Log {
  private logger: Logger;

  constructor({ projectId }: { projectId: string }) {
    const logging = new Logging({ projectId });
    this.logger = logging.log("seeds/discord");
  }

  async info(message: string, data: unknown = null) {
    const entry = this.logger.entry(
      { severity: "INFO" },
      {
        message,
        data,
      }
    );
    await this.logger.write(entry);
  }
}
