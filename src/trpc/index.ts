// trpc 기반으로 데이터베이스에서 데이터 조회
// trpc - 화면과 서버간에 데이터 타입이 서로 일치하는지 확인, 아니면 오류 발생

import { z } from 'zod'
import { authRouter } from './auth-router'
import { publicProcedure, router } from './trpc'
import { QueryValidator } from '../lib/validators/query-validator'
import { getPayloadClient } from '../get-payload'
import { paymentRouter } from './payment-router'

export const appRouter = router({
  
  auth: authRouter,
  payment: paymentRouter,

  getInfiniteProducts: publicProcedure
    // 클라이언트에서 받은 입력의 스키마 정의
    .input(z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().nullish(),
        query: QueryValidator,
      })
    )
    // 클라이언트에서 받은 입력을 기반으로 실제 데이터 조회 쿼리 실행하는 비동기 함수
    .query(async ({ input }) => {
      const { query, cursor } = input
      const { sort, limit, ...queryOpts } = query

      const payload = await getPayloadClient()

      const parsedQueryOpts: Record<
        string,
        { equals: string }
      > = {}

      Object.entries(queryOpts).forEach(([key, value]) => {
        parsedQueryOpts[key] = {
          equals: value,
        }
      })

      // 페이지 번호 / 클라이언트가 제공한 cursor 사용하고, 없으면 1 사용
      const page = cursor || 1

      const {
        docs: items,
        hasNextPage,
        nextPage,
      // 데이터 조회
      } = await payload.find({
        collection: 'products',
        where: {
          approvedForSale: {
            equals: 'pending',
          },
          ...parsedQueryOpts,
        },
        sort,
        depth: 1,
        limit,
        page,
      })

      return {
        items,
        nextPage: hasNextPage ? nextPage : null,
      }
    }),
})

export type AppRouter = typeof appRouter