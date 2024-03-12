// 장바구니 조회, 추가, 제거, 초기화

import { Product } from "@/payload-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
    product: Product
};

type CartState = {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    clearCart: () => void
};

// create로 zustand 스토어 생성
export const useCart = create<CartState>()(
    // persist 미들웨어로 스토어의 상태를 로컬 스토리지에 지속적 저장 - 새로고침해도 장바구니 상태 유지
    persist(
        (set) => ({
            items: [],
            // 추가
            addItem: (product) => set((state) => {
                return { 
                    items: [ 
                        ...state.items,
                        { product }, 
                    ] 
                }
            }),
            // 삭제
            removeItem: (id) => set((state) => ({
                items: state.items.filter((item) => item.product.id !== id)
            })),
            // 전체 삭제
            clearCart: () => set({ items: [] })
        }),
        // 저장소 - 여기에 위 상태 (저장, 삭제..) 저장 
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)