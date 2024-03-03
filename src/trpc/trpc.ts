// TRPC에서 router, publicProcedure을 가져와 다른 곳에서 사용

import { ExpressContext } from "@/server";
import { initTRPC } from "@trpc/server";

// ExpressContext: 요청,응답 유형 정의
const t = initTRPC.context<ExpressContext>().create()
export const router = t.router
export const publicProcedure = t.procedure