import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "@/server/orpc/router";
import { createORPCContext } from "@/server/orpc/context";

const handler = new RPCHandler(appRouter);

async function handleRequest(request: Request) {
  const context = await createORPCContext(request);
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context,
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
