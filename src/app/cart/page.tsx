// 데이터 처리가 클라이언트 부분에서만 실행
"use client";

import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES } from "@/config";
import { useCart } from "@/hooks/use-cart";
import { cn, formatPrice } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Cart() {

    const { 
        items, // 장바구니 아이템
        removeItem // 삭제 기능
    } = useCart();

    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    });

    // 장바구니 내 가격 총 계산
    const cartTotal = items.reduce(
        (total, { product }) => total + product.price, 0
    );

    // 추가 요금
    const fee = 1000;

    return (
        <div className="bg-white">
            {/* 최대 너비 */}
            <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
                {/* 장바구니 제목 */}
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Shopping Cart
                </h1>
                {/* 장바구니 아이템 & 주문 요약 */}
                <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                    <div className={cn("lg:col-span-7", {
                        "rounded-lg border-2 border-dashed border-zinc-200 p-12" :
                        isMounted && items.length === 0, 
                    })}>
                        <h2 className="sr-only">
                            Items in your shopping cart
                        </h2>
                        {/* 장바구니가 비어 있을 경우 */}
                        {isMounted && items.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-1">
                                <div
                                    aria-hidden="true" 
                                    className="relative mb-4 h-40 w-40 text-muted-foreground"
                                >
                                    <Image  
                                        src='/hippo-empty-cart.png'
                                        alt='hippo for empty shopping cart'
                                        fill
                                    />
                                </div>
                                <h3 className="font-semibold text-2xl">
                                    Your cart is empty
                                </h3>
                                <p className="text-muted-foreground text-center">
                                    Whoops! Nothig to show here yet
                                </p>
                            </div>
                        ) : null}
                        {/* 장바구니 아이템 목록 */}
                        <ul className={cn({
                            "divide-y divide-gray-200 border-b border-t border-gray-200" :
                            isMounted && items.length > 0,
                        })}>
                            {isMounted && items.map(({product}) => {
                                const label = PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label
                                const {image} = product.images[0]
                                
                                return (
                                    <li 
                                        key={product.id}
                                        className="flex py-6 sm:py-10"
                                    >
                                        {/* 제품 이미지 */}
                                        <div className="flex-shrink-0">
                                            <div className="relative h-24 w-24">
                                                {typeof image !== "string" && image.url ? (
                                                    <Image 
                                                        fill
                                                        src={image.url}
                                                        alt="product image"
                                                        className="h-full w-full rounded-md object-cover object-center sm:h-48 sm:w-48"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                        {/* 제품 정보 & 삭제 버튼 */}
                                        <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6`">
                                            <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                <div>
                                                    {/* 제품 이름 */}
                                                    <div className="flex justify-between">
                                                        <h3 className="text-sm">
                                                            <Link
                                                                href={`/product/${product.id}`}
                                                                className="font-medium text-gray-700 hover:text-gray-800"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                    {/* 카테코리 */}
                                                    <div className="mt-1 flex text-sm">
                                                        <p className="text-muted-foreground">
                                                            Category: {label}
                                                        </p>
                                                    </div>
                                                    {/* 가격 */}
                                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                                        {formatPrice(product.price)}
                                                    </p>
                                                </div>
                                                {/* 삭제 버튼 */}
                                                <div className="mt-4 sm:mt-0 sm:pr-9 w-20">
                                                    <div className="absolute right-0 top-0">
                                                        <Button 
                                                            aria-label="remove product"
                                                            onClick={() => removeItem(product.id)}
                                                            variant="ghost"
                                                        >
                                                            <X 
                                                                className="h-5 w-5"
                                                                aria-hidden="true" 
                                                            />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* 배송 가능 여부 */}
                                            <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                                                <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                                                <span>
                                                    Eligible for instant delivery
                                                </span>
                                            </p>
                                        </div>
                                    </li>
                                )   
                            })}
                        </ul>
                    </div>

                    {/* 주문 요약 */}
                    <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                        <h2 className="text-lg font-medium text-gray-900">
                            Order Summary
                        </h2>
                        <div className="mt-6 space-y-4">
                            {/* 소계 */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Subtotal
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {isMounted ? (
                                        formatPrice(cartTotal)
                                    ) : (
                                        <span>
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </span>
                                    )}
                                </p>
                            </div>
                            {/* 추가 수수료 */}
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <span>
                                        Flat Transaction Fee
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {isMounted ? (
                                        formatPrice(fee)
                                    ) : (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            {/* 최종 합계 */}
                            <div className="flex items-center justify-between border-t border-gray-200">
                                <div  className="text-base font-medium text-gray-900 mt-3">
                                    Order Total
                                </div>
                                <div className="text-base font-medium text-gray-900 mt-3">
                                    {isMounted ? (
                                            formatPrice(cartTotal + fee)
                                    ) : (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 결제 버튼 */}
                        <div className="mt-6">
                            <Button 
                                className="w-full mt-2"
                                size='lg'
                            >
                                Checkout
                            </Button>
                        </div>
                    </section> 
                </div>
            </div> 
        </div>
    )
}