// 개별 라우터 한 곳에서 관리 (메인 라우터)

import { authRouter } from "./auth-router";
import { router } from "./trpc";

export const appRouter = router({
    // 회원가입, 이메일 인증, 로그인
    auth: authRouter,
})

export type AppRouter = typeof appRouter