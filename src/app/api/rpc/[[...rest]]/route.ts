import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "@/server/orpc/router";
import { createORPCContext } from "@/server/orpc/context";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]", error);
    }),
  ],
});

async function handleRequest(request: Request) {
  console.log("[oRPC Request]", request.method, request.url);
  console.log("[oRPC Cookie header]", request.headers.get("cookie") ? "Cookie exists" : "NO COOKIE");
  console.log("[oRPC Auth header]", request.headers.get("authorization") ? "Auth header exists" : "NO AUTH HEADER");
  const context = await createORPCContext(request);
  console.log("[oRPC Context User]", context.user?.email || "NO USER", "orgId:", context.orgId);
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context,
  });
  console.log("[oRPC Response status]", response?.status);

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
