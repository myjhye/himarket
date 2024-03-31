// 미들웨어 - 로그인 여부

import { User } from '@/payload-types'
import { ExpressContext } from '@/server'
import { TRPCError, initTRPC } from '@trpc/server'
import { PayloadRequest } from 'payload/types'

// trpc 인스턴스 - trpc의 메서드와 미들웨어 가져와서 사용
const t = initTRPC.context<ExpressContext>().create()
const middleware = t.middleware

// isAuth: 로그인 여부
const isAuth = middleware(async ({ ctx, next }) => {
  
  // 요청을 PayloadRequest 타입으로 변환 - 타입 안정성
  const req = ctx.req as PayloadRequest

  // 요청에서 사용자 정보 추출 - 보통 사용자 정보는 로그인 후 req.user에 저장됨
  const { user } = req as { user: User | null }

  // 로그인 안 되어 있으면 에러
  if (!user || !user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // 로그인 여부 반환 - 이걸 가지고 데이터 접근 권한을 얻어 데이터 조회
  return next({
    ctx: {
      user,
    },
  })
})

// 엔드포인트 정의
export const router = t.router
// 공개 api 엔드포인트
export const publicProcedure = t.procedure
// 로그인 한 사용자만 요청하는 api 엔드포인트 - isAuth 사용
export const privateProcedure = t.procedure.use(isAuth)