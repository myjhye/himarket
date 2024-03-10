// api 쿼리 파라미터의 데이터 유형 정의
// api 쿼리 파라미터: url에서 '?' 이후에 나오는 키-값 쌍
//  https://example.com/api/products?category=books&limit=10에서 'category=books'와 'limit=10'

import { z } from 'zod'

export const QueryValidator = z.object({
  category: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  limit: z.number().optional(),
})

export type TQueryValidator = z.infer<typeof QueryValidator>