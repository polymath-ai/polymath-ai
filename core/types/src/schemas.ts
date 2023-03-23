import { z } from "zod";

export const infoSchema = z.object({
  url: z.string({ required_error: "URL is required" }),
  image_url: z.optional(z.string()),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
});
