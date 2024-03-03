// 회원가입 백엔드 - 회원가입 처리, 이메일 인증

import { AuthCredentialsValidator } from '../lib/validators/account-credentials-validator'
import { publicProcedure, router } from './trpc'
import { getPayloadClient } from '../get-payload'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const authRouter = router({

  /*
    publicProcedure: 권한 없는 사용자(미로그인)도 요청 가능
    - 미로그인 사용자 회원가입 가능
  */
  //-- 1. 회원가입 처리 --//
  createPayloadUser: publicProcedure
    // 사용자 입력 값 유효성 검사
    .input(AuthCredentialsValidator)
    // 사용자 입력 값 기반으로 새 사용자 생성(회원가입)
    .mutation(async ({ input }) => {
      // 회원가입 입력 값
      const { email, password } = input
      // payload 인스턴스
      const payload = await getPayloadClient()

      // 중복 사용자 데이터베이스에서 검사 - 이메일 기반
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

      //** 새 사용자 생성
      await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          role: 'user',
        },
      })

      // 결과 반환 - 성공 여부, 전송한 이메일
      return { 
        success: true, 
        sentToEmail: email 
      }
    }),

    //-- 2. 이메일 인증 --//
    verifyEmail: publicProcedure
      
      // .input: 입력 값 유효성 검사
      .input(z.object({ 
        token: z.string() 
      }))
      
      /* 
        1. mutation 대신 query 사용 - 데이터를 변경하는 것이 아니라서
        2. .query: 화면에서 서버로 전달된 로직 처리
      */
      .query (async ({ input }) => {

        // 토큰 받기
        const { token } = input

        // payload: 페이로드 전체 인스턴스
        const payload = await getPayloadClient()

        //** 토큰으로 이메일 검증 - users 테이블에 토큰 전달
        const isVerified = await payload.verifyEmail({
          collection: "users",
          token: token,
        })

        // 인증 실패 - UNAUTHORIZED 에러
        if (!isVerified) {
          throw new TRPCError({ code: 'UNAUTHORIZED'})
        }

        // 인증 성공 시 isVerified를 true로
        return { success: true }
    }),
})