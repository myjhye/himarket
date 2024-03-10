// Next.js 설정

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 로컬 서버에 저장된 이미지를 사용 가능하게
    images: {
        remotePatterns: [
            {
                hostname: "localhost",
                pathname: "**",
                port: "3000",
                protocol: "http",
            },
        ],
    },
};

export default nextConfig;
