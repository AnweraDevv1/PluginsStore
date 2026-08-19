import { pgTable, serial, smallint, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("plugin"), // plugin, mod, datapack, library, tool
  version: text("version").notNull().default("1.0.0"),
  minecraftVersion: text("minecraft_version").notNull().default("1.20+"),
  downloadUrl: text("download_url").notNull(),
  githubUrl: text("github_url"),
  modrinthUrl: text("modrinth_url"),
  curseforgeUrl: text("curseforge_url"),
  banner: text("banner"),
  videoUrl: text("video_url"),
  screenshots: jsonb("screenshots").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  features: jsonb("features").$type<string[]>().default([]),
  downloads: integer("downloads").default(0).notNull(),
  fileSize: text("file_size").default("~2.5 MB"),
  featured: boolean("featured").default(false).notNull(),
  status: text("status").default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settings = pgTable("site_settings", {
  id: smallint("id").primaryKey(),
  codeAnimation: boolean("code_animation").notNull().default(true),
  data: jsonb("data").$type<Record<string, unknown>>().default({}),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type SiteSettings = typeof settings.$inferSelect;
