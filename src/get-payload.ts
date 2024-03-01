// Payload CMS 생성

import dotenv from "dotenv";
import path from "path";
import payload, { Payload } from "payload";
import { InitOptions } from "payload/config";

// .env 파일에서 환경 변수 로드. 파일은 상위 디렉토리에 위치.
dotenv.config({
    path: path.resolve(__dirname, "../.env")
})

// payload 인스턴스를 생성하고 글로벌 객체에 캐싱 - 재사용 목적
let cached = (global as any).payload

// payload 인스턴스 없으면 새 payload 인스턴스를 생성하고 초기화
if (!cached) {
    cached = (global as any).payload = {
        client: null,
        promise: null,
    }
}

// getPayloadClient 함수의 인자 타입 정의
// initOptions: payload를 초기화하는 설정 옵션들 - secret, local, mongodb, express
interface Args {
    initOptions?: Partial<InitOptions>
}

export const getPayloadClient = async ({ initOptions }: Args = {}): Promise<Payload> => {

    // PAYLOAD_SECRET 환경 변수가 없으면 에러 발생 시키기
    if (!process.env.PAYLOAD_SECRET) {
        throw new Error('PAYLOAD_SECRET is missing')
    }

    // 캐시된 클라이언트가 있으면 반환
    if (cached.client) {
        return cached.client
    }

    // 클라이언트 초기화된 게 없으면 새로 생성
    if (!cached.promise) {
        cached.promise = payload.init({
            // payload와 통신하는 비밀 키
            secret: process.env.PAYLOAD_SECRET,
            // payload와 express와 통합 되었을 시 local을 false로 설정 - 운영 환경에서 실행
            local: initOptions?.express ? false : true,
            // 추가 옵션을 받아 기존 옵션에 병합
            ...(initOptions || {}),
        })
    }
    
    // Payload 클라이언트 초기화
    try {
        cached.client = await cached.promise
    } catch (e: unknown) {
        // 초기화 실패 시 캐시된 프로미스를 null로 리셋하고 에러 던지기
        cached.promise = null
        throw e
    }
    
    // 초기화된 Payload 클라이언트 반환
    return cached.client;
}