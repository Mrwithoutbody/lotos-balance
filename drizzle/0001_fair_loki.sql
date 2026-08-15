CREATE TABLE `creators` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`user_id` text NOT NULL,
	`creator_slug` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `creator_slug`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_slug`) REFERENCES `creators`(`slug`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`creator_slug` text NOT NULL,
	`card_id` text NOT NULL,
	`date` text NOT NULL,
	`before` integer,
	`after` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creator_slug`) REFERENCES `creators`(`slug`) ON UPDATE no action ON DELETE cascade
);
