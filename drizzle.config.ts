import "./envConfig"; // If envConfig.ts is in the same directory as drizzle.config.ts
// Or use the correct relative path if it's in a different location

import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

export default defineConfig({
  schema: 'lib/db/schema.ts',
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL || "",
  },
});
