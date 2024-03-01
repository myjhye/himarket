// Payload CMS 세팅 - 서버 url, 데이터베이스 연결, 컬렉션 정의, 사용자 인증 설정

import { webpackBundler } from "@payloadcms/bundler-webpack";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import path from "path";
import { buildConfig } from "payload/config";
import { Users } from "./collections/Users";
import dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
})

export default buildConfig({

    // 서버 url - localhost:3000
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
    
    // CMS 컨텐츠 구조
    collections: [Users],

    // 관리자 페이지를 /sell 경로로 접근
    routes: {
        admin: '/sell'
    },

    // 관리자 페이지 구성 설정
    admin: {
        user: "users",
        bundler: webpackBundler(),
        meta: {
            titleSuffix: "- HiMarket",
            favicon: '/favicon.ico',
            ogImage: '/thumnail.jpg',
        },
    },

    // payload cms 서버가 최대로 받을 수 있는 요청 수 - 2000번
    rateLimit: {
        max: 2000,
    },

    // 텍스트 에디터
    editor: slateEditor({}),
    
    // 데이터베이스 - mongodb
    db: mongooseAdapter({
        url: process.env.MONGODB_URL!,
    }),

    // 현재 디렉토리 (__dirname)에 payload-types.ts 라는 이름으로 타입스크립트 정의 파일을 생성하고 저장 - 타입 안정성 목적
    typescript: {
        outputFile: path.resolve(__dirname, "payload-types.ts"),
    },
})