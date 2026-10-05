import {sqliteTable,text,integer} from "drizzle-orm/sqlite-core";
export const content=sqliteTable("content",{id:text("id").primaryKey(),data:text("data").notNull(),revision:integer("revision").notNull().default(1)});
export const enquiries=sqliteTable("enquiries",{id:text("id").primaryKey(),name:text("name").notNull(),email:text("email").notNull(),message:text("message").notNull(),createdAt:text("created_at").notNull()});
