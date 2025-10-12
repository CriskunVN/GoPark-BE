declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string; // e.g. "15m"
    JWT_REFRESH_EXPIRES_IN: string; // e.g. "7d"
  }
}
