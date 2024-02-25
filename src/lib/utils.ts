import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "BDT" | "KRW",
    notation?: Intl.NumberFormatOptions["notation"]
  } = {}
) {

  // 기본으로 'USD', 'compact' 사용
  const { 
    currency = "KRW",  
    notation = "standard" 
  } = options

  // price가 문자열이면 숫자로 변환
  const numericPrice = typeof price === "string" ? parseFloat(price) : price

  // 제공된 옵션에 따라 숫자 가격 형식화 - Intl.NumberFormat 사용
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: currency,
    notation: notation,
    maximumFractionDigits: 0,
  }).format(numericPrice)
}