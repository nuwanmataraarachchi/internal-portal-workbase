import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title must be 120 characters or less."),
  body: z.string().trim().min(1, "Announcement details are required.").max(1500, "Announcement details must be 1,500 characters or less."),
});
