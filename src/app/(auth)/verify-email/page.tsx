// 이메일 인증 요청 화면

import Image from "next/image"
import VerifyEmail from '@/components/VerifyEmail'

interface PageProps {
    searchParams: {
        [key: string]: string | string[] | undefined 
    }
}

export default function VerifyEmailPage({searchParams}: PageProps) {

    // 토큰 - 파람에서 추출
    const token = searchParams.token
    // 전송된 이메일 - 파람에서 추출
    const toEmail = searchParams.to

    return (
        <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                {/* 인증 결과 화면 - 토큰 유무에 따라 결정 */}
                {token && typeof token === "string" ? (
                    <div className="grid gap-6">
                        <VerifyEmail token={token} />
                    </div>
                ) : (
                    //-- 인증 요청 화면 --//
                    <div className="flex h-full flex-col items-center justify-center space-y-1">
                        <div className="relative mb-4 h-60 w-60 text-muted-foreground">
                            <Image 
                                src='/hippo-email-sent.png'
                                fill
                                alt='hippo-email-sent-image'
                            />
                        </div>
                        <h3 className="font-semibold text-2xl">Check your email</h3>
                        {toEmail ? (
                            <p className="text-muted-foreground text-center">
                                We&apos;ve sent a verification link to <span className="font-semibold">{toEmail}</span>
                            </p>
                        ) : (
                            <p className="text-muted-foreground text-center">
                                We&apos;ve sent a verification link to your email.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}