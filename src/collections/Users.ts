// Users 데이터 스키마

import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
    slug: 'users',
    auth: {
        verify: {
            // 이메일 인증 메세지
            generateEmailHTML: ({ token }) => {
                return (
                    `<a href='${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}'>
                        verify account
                    </a>`
                )
            },
        },
    },
    // 접근 권한
    access: {
        read: () => true,
        create: () => true,
    },
    fields: [
        {
            // 필드 이름
            name: 'role',
            // 기본 값
            defaultValue: 'user',
            // 필수 여부
            required: true,
            // 필드 타입
            type: 'select',
            // 선택 옵션
            options: [
                {
                    label: "Admin",
                    value: "admin",
                },
                {
                    label: "User",
                    value: "user",
                },
            ]

        }
    ]
}