import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Env } from "@/env";

export const getImage = createServerFn({ method: "GET" })
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const req = getRequest();
    const env = (req as unknown as { env: Env }).env;
    const obj = await env.R2.get(key);
    if (!obj) throw new Error("Image not found");
    const buffer = await obj.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });
