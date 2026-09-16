import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title must be 120 characters or less."),
  body: z.string().trim().min(1, "Announcement details are required.").max(1500, "Announcement details must be 1,500 characters or less."),
  startDate: z.string().date("Enter a valid start date."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid start time."),
  endDate: z.string().date("Enter a valid end date."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid end time."),
  audienceType: z.enum(["all", "individual", "team"]),
  audienceIds: z.array(z.coerce.number().int().positive()).max(100),
  isActive: z.boolean().optional(),
}).superRefine((value, ctx) => {
  if (value.audienceType === "all" && value.audienceIds.length) ctx.addIssue({ code: "custom", message: "All-workspace announcements cannot have recipients." });
  if (value.audienceType !== "all" && !value.audienceIds.length) ctx.addIssue({ code: "custom", message: "Select at least one recipient." });
  if (new Date(`${value.endDate}T${value.endTime}`) < new Date(`${value.startDate}T${value.startTime}`)) ctx.addIssue({ code: "custom", message: "End date and time must be after the start." });
});

export const announcementUpdateSchema = announcementSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const teamSchema = z.object({
  name: z.string().trim().min(2, "Team name must be at least 2 characters.").max(120),
  description: z.string().trim().max(500),
  memberIds: z.array(z.coerce.number().int().positive()).min(1, "Select at least one user."),
});

export const userSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  username: z.string().trim().min(3, "Username must be at least 3 characters.").max(80).regex(/^[a-zA-Z0-9._-]+$/, "Username may only contain letters, numbers, dots, underscores, and hyphens."),
  email: z.email("Enter a valid email address.").trim().max(255),
  password: z.string().min(8, "Temporary password must be at least 8 characters.").max(128),
  birthday: z.string().date("Enter a valid birthday."),
  designation: z.string().trim().min(2, "Designation is required.").max(120),
  role: z.enum(["member", "hr", "admin"]),
  isActive: z.boolean().optional(),
});

export const userUpdateSchema = userSchema.omit({ password: true }).extend({
  id: z.coerce.number().int().positive(),
  password: z.string().min(8, "Temporary password must be at least 8 characters.").max(128).optional().or(z.literal("")),
});

export const userDeleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const teamUpdateSchema = teamSchema.extend({
  id: z.coerce.number().int().positive(),
});
