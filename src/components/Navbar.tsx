import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import NavItems from "./NavItems";
import { buttonVariants } from "./ui/button";
import Cart from "./Cart";
import { getServerSideUser } from "@/lib/payload-utils";
import { cookies } from "next/headers";
import UserAccountNav from "./UserAccountNav";

export default async function Navbar() {
    
    const nextCookies = cookies();
    const { user } = await getServerSideUser(nextCookies);
    
    return (
        <div className="bg-white sticky z-59 top-0 inset-x-0 h-16">
            <header className="relative bg-white">
                {/* MaxWidthWrapper : 네비게이션 내용(로고이미지, 드랍다운)의 레이아웃 조정 */}
                <MaxWidthWrapper>
                    <div className="border-b border-gray-200">
                        <div className="flex h-16 items-center">
                            {/* 로고 이미지 */}
                            <div className="ml-4 flex lg:ml-0">
                                <Link href='/'>
                                    <Icons.logo className="h-10 w-10" />
                                </Link>
                            </div>
                            {/* 드랍다운 메뉴 */}
                            <div className="hidden z-50 lg:ml-8 lg:block lg:self-stretch">
                                <NavItems />
                            </div>
                            <div className="ml-auto flex items-center">
                                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                                    {/*  로그인 전 - 로그인 버튼 */}
                                    {user ? null : (
                                        <Link 
                                            href='/sign-in'
                                            className={buttonVariants({variant: "ghost"})}
                                        >
                                            Sign in
                                        </Link>
                                    )}
                                    {/* 로그인 전 - 회색 선 */}
                                    {user ? null : (
                                        <span 
                                            className="h-6 w-px bg-gray-200" 
                                            aria-hidden="true"
                                        />
                                    )}
                                    
                                    {/* 로그인 전 - 회원가입 버튼 / 로그인 후 - 계정 정보 */}
                                    {user ? (
                                        <UserAccountNav user={user} />
                                    ) : (
                                        <Link 
                                            href='/sign-up'
                                            className={buttonVariants({variant: "ghost"})}
                                        >
                                            Create Account
                                        </Link>
                                    )}
                                    {/* 로그인 전 - 회색 선 */}
                                    {user ? null : (
                                        <div className="flex lg:ml-6">
                                            <span 
                                                className="h-6 w-px bg-gray-200"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    )}
                                    {/* 로그인 후 - 회색 선 */}
                                    {user ? (
                                        <span 
                                            className="h-6 w-px bg-gray-200" 
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                    {/* 로그인 전/후 - 카트 */}
                                    <div className="ml-4 flex-root lg:ml-6">
                                        <Cart />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </MaxWidthWrapper>
            </header>
        </div>
    )
}