// TRPC를 사용해 API 요청 정의하고, 이를 특정 HTTP 메소드에 할당해 사용

import { appRouter } from '@/trpc'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const handler = (req: Request) => {
  return fetchRequestHandler({
    // 화면과 서버 간의 통신 경로 (모든 요청이 이 경로를 거친다) - 이 경로를 통해 서버의 TRPC 라우터와 연결되고, appRouter에 정의된 로직에 따라 요청 처리
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    // @ts-expect-error / createContext가 이미 다른 미들웨어에서 처리되었음
    createContext: () => ({}),
  })
}

// 화면에서 GET이나 POST 메소드로 요청 보낼 때 이 핸들러를 통해 요청 처리
export { 
    handler as GET, 
    handler as POST 
}