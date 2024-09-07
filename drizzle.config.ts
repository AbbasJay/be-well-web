import "./envConfig"; // If envConfig.ts is in the same directory as drizzle.config.ts
// Or use the correct relative path if it's in a different location

import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

export default defineConfig({
  schema: resolve("./lib/db/schema.ts"), // Adjust this path
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL || "",
  },
});
