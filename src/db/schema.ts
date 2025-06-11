import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  serial,
  integer,
  timestamp,
  primaryKey,
  jsonb,
  boolean,
}from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }),
  image: varchar("image", { length: 255 }),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  websiteUrl: varchar("website_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  poems: many(poems),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
}));


export const poems = pgTable("poems", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  coverImage: varchar("cover_image", { length: 255 }),
  tags: jsonb("tags").default([]),
  likes: integer("likes").default(0),
  recommends: integer("recommends").default(0),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const poemsRelations = relations(poems, ({ one }) => ({
  author: one(users, {
    fields: [poems.authorId],
    references: [users.id],
  }),
}));


export const follows = pgTable(
  "follows", 
  {
    followerId: varchar("follower_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    followingId: varchar("following_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
  })
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));


export const likes = pgTable(
  "likes",
  {
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    poemId: integer("poem_id").notNull().references(() => poems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.poemId] }),
  })
);


export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    poemId: integer("poem_id").notNull().references(() => poems.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  }
);


export const recommendations = pgTable(
  "recommendations",
  {
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    poemId: integer("poem_id").notNull().references(() => poems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.poemId] }),
  })
);

export const userSessions = pgTable(
  "user_sessions",
  {
    userId: varchar("user_id", { length: 255 }).notNull(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.sessionId] }),
  })
); 


export const savedPoems = pgTable(
  "saved_poems",
  {
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    poemId: integer("poem_id").notNull().references(() => poems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    isRead: boolean("is_read").default(false),
    isArchived: boolean("is_archived").default(false),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.poemId] }),
  })
);


export const collections = pgTable(
  "collections",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    coverImage: varchar("cover_image", { length: 255 }),
    isPrivate: boolean("is_private").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);


export const collectionItems = pgTable(
  "collection_items",
  {
    collectionId: integer("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
    poemId: integer("poem_id").notNull().references(() => poems.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow(),
    note: text("note"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.collectionId, t.poemId] }),
  })
);