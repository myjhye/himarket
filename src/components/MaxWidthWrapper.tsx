// 자식요소(children)을 감싸 화면 최대 너비를 초과하지 않도록 제한

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MaxWidthWrapperProps {
    className?: string;
    children?: ReactNode;
}

export default function MaxWidthWrapper({ className, children }: MaxWidthWrapperProps) {
    return (
        <div className={cn("mx-auto w-full max-w-screen-xl px-2.5 md:px-20", className)}>
            {children}
        </div>
    )
}

