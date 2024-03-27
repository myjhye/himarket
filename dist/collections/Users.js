"use strict";
// Users 데이터 스키마
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
exports.Users = {
    slug: 'users',
    auth: {
        verify: {
            // 이메일 인증 메세지
            generateEmailHTML: function (_a) {
                var token = _a.token;
                return ("<a href='".concat(process.env.NEXT_PUBLIC_SERVER_URL, "/verify-email?token=").concat(token, "'>\n                        verify account\n                    </a>"));
            },
        },
    },
    // 접근 권한
    access: {
        read: function () { return true; },
        create: function () { return true; },
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
};
