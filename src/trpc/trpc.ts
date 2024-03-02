// TRPC에서 router, publicProcedure을 가져와 다른 곳에서 사용

import { initTRPC } from "@trpc/server";

const t = initTRPC.context().create()
export const router = t.router
export const publicProcedure = t.procedure