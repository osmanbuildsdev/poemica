CREATE TABLE "collection_items" (
	"collection_id" integer NOT NULL,
	"poem_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"note" text,
	CONSTRAINT "collection_items_collection_id_poem_id_pk" PRIMARY KEY("collection_id","poem_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"cover_image" varchar(255),
	"is_private" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"poem_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" varchar(255) NOT NULL,
	"following_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" varchar(255) NOT NULL,
	"poem_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "likes_user_id_poem_id_pk" PRIMARY KEY("user_id","poem_id")
);
--> statement-breakpoint
CREATE TABLE "poems" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"cover_image" varchar(255),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"likes" integer DEFAULT 0,
	"recommends" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"user_id" varchar(255) NOT NULL,
	"poem_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "recommendations_user_id_poem_id_pk" PRIMARY KEY("user_id","poem_id")
);
--> statement-breakpoint
CREATE TABLE "saved_poems" (
	"user_id" varchar(255) NOT NULL,
	"poem_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"is_read" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	CONSTRAINT "saved_poems_user_id_poem_id_pk" PRIMARY KEY("user_id","poem_id")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"user_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "user_sessions_user_id_session_id_pk" PRIMARY KEY("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password" varchar(255),
	"image" varchar(255),
	"bio" text,
	"location" varchar(255),
	"website_url" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_poem_id_poems_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_poem_id_poems_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_poem_id_poems_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poems" ADD CONSTRAINT "poems_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_poem_id_poems_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_poems" ADD CONSTRAINT "saved_poems_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_poems" ADD CONSTRAINT "saved_poems_poem_id_poems_id_fk" FOREIGN KEY ("poem_id") REFERENCES "public"."poems"("id") ON DELETE cascade ON UPDATE no action;