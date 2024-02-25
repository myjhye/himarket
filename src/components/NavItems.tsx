"use client";

import { PRODUCT_CATEGORIES } from "@/config";
import { useEffect, useRef, useState } from "react";
import NavItem from "./NavItem";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

export default function NavItems() {
    
    const [activeIndex, setActiveIndex] = useState<null | number>(null);

    // 마우스 외부 클릭 외에도 'escape 키보드 클릭' 이벤트 추가 등록
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key == "Escape") {
                setActiveIndex(null)
            }
        }

        // "keydown" 이벤트에 handler 등록
        document.addEventListener("keydown", (e) => handler(e))

        // 컴포넌트 해제 시 등록된 이벤트 제거
        return () => {
            document.removeEventListener('keydown', handler)
        }
    }, []);

    // 어떤 아이템이 활성화 되어 있는지 여부
    const isAnyOpen = activeIndex !== null;

    // div 참조
    const navRef = useRef<HTMLDivElement | null>(null);

    // navbar 외부 클릭 시 모든 아이템 비활성화
    useOnClickOutside(navRef, () => setActiveIndex(null));

    return (
        
        <div 
            className="flex gap-4 h-full" 
            ref={navRef}
        >
            {PRODUCT_CATEGORIES.map((category, index) => {
                const handleOpen = () => {
                    // 클릭된 아이템 (index)이 현재 활성화된 아이템 (activeIndex)과 같다면 비활성화 - 열려있는 아이템 다시 클릭 해 닫기
                    if (activeIndex === index) {
                        setActiveIndex(null)
                    }
                    // 클릭된 아이템 (index) 활성화 - 닫혀있는 아이템 클릭 해 열기
                    else {
                        setActiveIndex(index)
                    };
                };

                // 이 아이템이 현재 열려있는지 여부
                const isOpen = index === activeIndex

                return (
                    <NavItem 
                        category={category}
                        handleOpen={handleOpen}
                        isOpen={isOpen}
                        key={category.value}
                        isAnyOpen={isAnyOpen}
                    />
                )
            })}
        </div>
    )
}