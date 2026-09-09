import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "@/server/orpc/router";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "/api/rpc";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/rpc`;
  return `http://localhost:${process.env.PORT || 3000}/api/rpc`;
};

const link = new RPCLink<any>({
  url: getBaseUrl(),
  headers: () => {
    const headers: Record<string, string> = {};

    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if ((parts[0] === "dashboard" || parts[0] === "admin") && parts[1]) {
        headers["X-Organization-ID"] = parts[1];
      }
    }

    return headers;
  },
  fetch: (request, init) => {
    return fetch(request, {
      ...init,
      credentials: "include",
    });
  },
});

export const client: RouterClient<AppRouter> = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
