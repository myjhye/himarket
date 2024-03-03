// 서버 설정 및 API 라우팅 & Express, Next.js, Payload CMS의 통합 포인트 역할
/*
    Next.js: 관리자 페이지의 프론트 - Payload CMS의 API 사용해 화면 렌더링
    Express: 백엔드 로직 처리 - HTTP 요청 관리, 라우팅, 미들웨어 처리
    Payload CMS: Headless CMS로서 API 제공

    - Next.js 프론트에서 Payload CMS API로 데이터 가져와 화면 렌더링 & Express는 백엔드로서 Next.js와 Payload 사이의 통신 관리
*/

import express from 'express';
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import { inferAsyncReturnType } from '@trpc/server';

const app = express()
// 환경 변수에서 포트 번호를 가져오거나 기본 값으로 3000을 설정
const PORT = Number(process.env.PORT) || 3000

const createContext = ({req, res}: trpcExpress.CreateExpressContextOptions) => ({
    req,
    res,
})

// createContext의 반환(req, res) 타입 정의 - 전역 사용
export type ExpressContext = inferAsyncReturnType<typeof createContext>

const start = async () => {
    const payload = await getPayloadClient({
        // Payload CMS를 Express와 통합
        initOptions: {
            // Express 앱 인스턴스를 Payload CMS 초기화 옵션에 전달
            express: app,
            onInit: async (cms) => {
                // Payload CMS가 초기화되면 관리자 URL을 로깅
                cms.logger.info(`Admin URL ${cms.getAdminURL}`)
            },
        },
    })

    // Express에 API 라우팅 설정 - tRPC 미들웨어 사용
    app.use('/api/trpc', trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    }));


    // Express가 받는 HTTP 요청을 Next.js에 위임해 대신 처리하게 한다 - Next.js의 서버사이드렌더링을 위해서 (서버에서 데이터 처리를 한 후 프론트에 전달)
    app.use((req, res) => nextHandler(req, res))


    // Next.js 어플리케이션 준비. 준비 완료되면 서버 시작.
    nextApp.prepare().then(() => {

        // Next.js가 시작됨 로깅
        payload.logger.info('Next.js started')

        // Express 서버를 지정된 포트에서 리스닝하도록 시작
        app.listen(PORT, async () => {
            // 서버가 시작되면 Next.js 어플리케이션 URL을 로깅
            payload.logger.info(`Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`)
        })
    })
}

start()