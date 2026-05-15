/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  AI: Ai;
  SUPPORT_PHONE?: string;
  MONGODB_URI: string;
  MONGODB_DB?: string;
  JWT_SECRET?: string;
}

declare module "@tanstack/react-start/server" {
  interface ServerContext {
    env: Env;
    request: Request;
  }
}
