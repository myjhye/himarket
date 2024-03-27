"use strict";
// Payload CMS 세팅 - 서버 url, 데이터베이스 연결, 컬렉션 정의, 사용자 인증 설정
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bundler_webpack_1 = require("@payloadcms/bundler-webpack");
var db_mongodb_1 = require("@payloadcms/db-mongodb");
var richtext_slate_1 = require("@payloadcms/richtext-slate");
var path_1 = __importDefault(require("path"));
var config_1 = require("payload/config");
var Users_1 = require("./collections/Users");
var dotenv_1 = __importDefault(require("dotenv"));
var Products_1 = require("./collections/Products/Products");
var Media_1 = require("./collections/Media");
var ProductFile_1 = require("./collections/ProductFile");
var Orders_1 = require("./collections/Orders");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../.env'),
});
exports.default = (0, config_1.buildConfig)({
    // 서버 url - localhost:3000
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
    // CMS 컨텐츠
    collections: [
        Users_1.Users,
        Products_1.Products,
        Media_1.Media,
        ProductFile_1.ProductFile,
        Orders_1.Orders,
    ],
    // 관리자 페이지를 /sell 경로로 접근
    routes: {
        admin: '/sell'
    },
    // 관리자 페이지 구성 설정
    admin: {
        user: "users",
        bundler: (0, bundler_webpack_1.webpackBundler)(),
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
    editor: (0, richtext_slate_1.slateEditor)({}),
    // 데이터베이스 - mongodb
    db: (0, db_mongodb_1.mongooseAdapter)({
        url: process.env.MONGODB_URL,
    }),
    // 현재 디렉토리 (__dirname)에 payload-types.ts 라는 이름으로 타입스크립트 정의 파일을 생성하고 저장 - 타입 안정성 목적
    typescript: {
        outputFile: path_1.default.resolve(__dirname, "payload-types.ts"),
    },
});
