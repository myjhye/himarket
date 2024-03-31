/* 
    Express, Next.js, Payload CMS, trpc 통합 
    - api 라우팅, 미들웨어 처리, 컨텐츠 관리, 서버 사이드 렌더링
    - Next.js 프론트에서 Payload CMS API로 데이터 가져와 화면 렌더링 & Express는 백엔드로서 Next.js와 Payload 사이의 통신 관리
    - 백엔드와 프론트 연동, 중앙 통합 서버 역할
    - 어플리케이션의 모든 부분 총괄하는 매니저
*/
 /*
    Next.js: 관리자 페이지의 프론트 - Payload CMS의 API 사용해 화면 렌더링
    Express: 백엔드 로직 처리 - HTTP 요청 관리, 라우팅, 미들웨어 처리
    Payload CMS: Headless CMS로서 API 제공
*/

import express from 'express';
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import { inferAsyncReturnType } from '@trpc/server';
import bodyParser from 'body-parser';
import { IncomingMessage } from 'http';
import { stripeWebhookHandler } from './webhooks';
import nextBuild from "next/dist/build";

const app = express()
// 환경 변수에서 포트 번호를 가져오거나 기본 값으로 3000을 설정
const PORT = Number(process.env.PORT) || 3000

const createContext = ({req, res}: trpcExpress.CreateExpressContextOptions) => ({ req, res })

// createContext의 반환(req, res) 타입 정의 - 전역 사용
export type ExpressContext = inferAsyncReturnType<typeof createContext>
export type WebhookRequest = IncomingMessage & {rawBody: Buffer}

const start = async () => {

    // stripe 웹훅 요청의 json 형식을 -> 자바스크립트 객체로 변환
    const webhookMiddleware = bodyParser.json({
        verify: (req: WebhookRequest, _, buffer) => {
            req.rawBody = buffer
        }
    })

    // /api/webhooks/stripe 엔드포인트에 webhookMiddleware를 사용하여, 들어오는 JSON 형식의 요청 본문을 자바스크립트 객체로 변환해 적용
    app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebhookHandler)

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

 
    // NEXT_BUILD 환경 변수가 설정된 경우, Next.js를 프로덕션 빌드하고 프로세스 종료 - 배포 과정 자동화
    if (process.env.NEXT_BUILD) {
        app.listen(PORT, async () => {
            payload.logger.info("Next.js is building for production")
            // @ts-expect-error
            await nextBuild(path.join(__dirname, "../"))

            process.exit()
        })

        return 
    }

    

    // tRPC 미들웨어 사용해 Express에 API 라우팅 설정
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