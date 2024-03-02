// 회원가입 백엔드 - 입력 값 유효성 검사, 중복 사용자 검사, 사용자 생성(데이터베이스 추가), 응답 반환

import { AuthCredentialsValidator } from '../lib/validators/account-credentials-validator'
import { publicProcedure, router } from './trpc'
import { getPayloadClient } from '../get-payload'
import { TRPCError } from '@trpc/server'

export const authRouter = router({
  /*
    1. createPayloadUser: 회원가입 처리
    2. publicProcedure: 권한 없는 사용자(미로그인)도 요청 가능
    - 미로그인 사용자 회원가입 가능
  */
  createPayloadUser: publicProcedure
    // 사용자 입력 값 유효성 검사
    .input(AuthCredentialsValidator)
    // 사용자 입력 값 기반으로 새 사용자 생성(회원가입)
    .mutation(async ({ input }) => {
      // 회원가입 입력 값
      const { email, password } = input
      // payload 인스턴스
      const payload = await getPayloadClient()

      // 중복 사용자 데이터베이스에서 검사 - 이메일 
      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
      })

      // 같은 이메일 가진 사용자 있으면 에러
      if (users.length !== 0)
        throw new TRPCError({ code: 'CONFLICT' })

      // 새 사용자 생성
      await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'user',
        },
      })

      // 사용자 생성 성공 - 응답
      return { 
        success: true, 
        sentToEmail: email 
      }
    }),
})