import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

declare global {
  interface ProcessEnv {
    JWT_SECRET: string;
  }
}

export {};
