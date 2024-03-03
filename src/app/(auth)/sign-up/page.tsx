// 회원가입 페이지

"use client";

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCredentialsValidator, TAuthCredentialsValidator } from "@/lib/validators/account-credentials-validator";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ZodError } from "zod";
import { useRouter } from "next/navigation";

export default function SignUp(){

    const router = useRouter();

    /*
        useForm
        1. register: 입력 폼 데이터 받기
        2. handleSubmit: 입력 받은 폼 데이터 처리
        3. formState: 입력 폼 에러 상태

        4. TAuthCredentialsValidator: 입력 폼 유효성 기준
        5. AuthCredentialsValidator: 입력 폼 유효성 기준을 기반으로 유효성 검사
    */
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<TAuthCredentialsValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
      })


    /*
      1. createPayloadUser: 새로운 사용자 데이터를 서버에 전달하고 데이터베이스에 저장
      2. mutate: createPayloadUser을 실행
    */

    //-- 회원가입 실행 --//
    const { 
        mutate, 
        isLoading, 
    } = trpc.auth.createPayloadUser.useMutation({
        
        // 에러
        onError: (err) => {
            // 이메일 중복
            if (err.data?.code === "CONFLICT") {
                toast.error("This email is already in use. Sign in instead?");
                return
            }
            // 기타 에러
            if (err instanceof ZodError) {
                toast.error(err.issues[0].message);
                return
            }
            toast.error('Something went wrong. Plase try again.')
        },

        // 성공
        onSuccess: ({sentToEmail}) => {
            // 전송됨 팝업
            toast.success(`Verification email sent to ${sentToEmail}.`);
            // 인증 요청 화면 이동
            router.push('/verify-email?to=' + sentToEmail);
        }
    })

    //-- 회원가입 실행 --//
    // 사용자가 입력한 email, password를 받아 mutate에 전달 - createPayloadUser 뮤테이션 실행 - TAuthCredentialsValidator로 입력 데이터의 타입 지정
    const onSubmit = ({
        email,
        password,
    }: TAuthCredentialsValidator) => {
        mutate({ email, password })
    }

    return (
        <>
            <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <Icons.logo className="h-20 w-20" />
                        <h1 className="text-2xl font-bold">
                            Create an account
                        </h1>
                        <Link 
                            href="/sign-in"
                            className={buttonVariants({
                                variant: 'link',
                                className: "gap-1.5"
                            })}
                        >
                            Already have an account? Sign-in
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid gap-2">
                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                    {...register("email")} 
                                        className={cn({
                                            "focus-visible:ring-blue-500": 
                                            errors.email,
                                        })}
                                        placeholder="aaa@example.com" 
                                    />
                                </div>
                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="password">
                                        Password
                                    </Label>
                                    <Input
                                    {...register("password")} 
                                        className={cn({
                                            "focus-visible:ring-blue-500": true
                                        })}
                                        type='password'
                                    />
                                    {/* 에러 - 8자 입력 미만 */}
                                    {errors?.password && (
                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>
                                <Button type="submit">
                                    Sign up
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}