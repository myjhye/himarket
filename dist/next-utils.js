"use strict";
// (다른 곳에서) express와 통합해 http 요청을 처리하는 Next.js 핸들러 생성 - 외부 사용
// 구조: Express 서버가 HTTP 요청을 받고, Next.js 요청 핸들러(nextHandler)를 사용해 해당 요청을 Next.js로 라우팅(화면에 전달)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextHandler = exports.nextApp = void 0;
var next_1 = __importDefault(require("next"));
// 환경 변수에서 PORT 값을 읽어오거나, 기본 값으로 3000 사용
var PORT = Number(process.env.PORT) || 3000;
// Next.js 인스턴스
exports.nextApp = (0, next_1.default)({
    // NODE_ENV 값이 'production'이 아닐 경우, 개발 모드로 설정
    dev: process.env.NODE_ENV !== "production",
    port: PORT
});
// 모든 HTTP 요청을 처리하는 Next.js의 요청 핸들러 생성
exports.nextHandler = exports.nextApp.getRequestHandler();
