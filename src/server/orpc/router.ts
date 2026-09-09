import { userRouter } from "./routers/user";
import { organizationRouter } from "./routers/organization";
import { connectionRouter } from "./routers/connection";
import { signingRouter } from "./routers/signing";
import { objectRouter } from "./routers/object";
import { teamRouter } from "./routers/team";
import { auditRouter } from "./routers/audit";

export const appRouter = {
  user: userRouter,
  organization: organizationRouter,
  connection: connectionRouter,
  signing: signingRouter,
  object: objectRouter,
  team: teamRouter,
  audit: auditRouter,
};

export type AppRouter = typeof appRouter;
