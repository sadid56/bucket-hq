import { getAuthUserFromRequest, getOrSyncUser, type UserWithTeamAccess } from "@/server/lib/auth";

export type { UserWithTeamAccess };

export interface ORPCContext {
  req: Request;
  user: UserWithTeamAccess | null;
  orgId: string | null;
}

export async function createORPCContext(req: Request): Promise<ORPCContext> {
  const orgHeader = req.headers.get("x-organization-id");

  let user: UserWithTeamAccess | null = null;
  const authUser = await getAuthUserFromRequest(req);

  if (authUser) {
    try {
      user = await getOrSyncUser(authUser);
    } catch {}
  }

  return {
    req,
    user,
    orgId: orgHeader || null,
  };
}
