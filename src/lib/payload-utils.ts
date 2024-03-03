// 로그인한 사용자 정보 조회

import { User } from "../payload-types"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { NextRequest } from "next/server"

// ReadonlyRequestCookies: 요청에서 쿠키 읽기
export const getServerSideUser = async (cookies: NextRequest["cookies"] | ReadonlyRequestCookies) => {

    // 요청에서 'payload-token' 쿠키 읽기 - 사용자 토큰 가져오기
    const token = cookies.get("payload-token")?.value
    
    // 서버의 '/api/users/me' 엔드포인트에 요청 보내기 - 사용자 정보 가져오기
    const meRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
        // 요청 헤더에 인증 토큰 포함하기 - 사용자 인증 정보를 서버에 같이 전달
        headers: {
            Authorization: `JWT ${token}`,
        },
    })

    // 서버 응답 JSON으로 변환 - 사용자 정보 추출
    const { user } = (await meRes.json()) as {
        user: User | null
    }

    // 사용자 정보 반환 - 미로그인 상태면 user은 null
    return { user }
}