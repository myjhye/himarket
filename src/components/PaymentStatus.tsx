// 결제 상태

"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PaymentStatusProps {
    orderEmail: string
    orderId: string
    isPaid: boolean
};

export default function PaymentStatus({ orderEmail, orderId, isPaid }: PaymentStatusProps) {

    const router = useRouter();

    // 주문 상태 폴링(동기화) - 결제가 완료되지 않았으면 주기적으로 상태 확인
    const { data } = trpc.payment.pollOrderStatus.useQuery({ orderId }, {
            // 결제가 완료되지 않았을 때만 폴링 활성화 
            enabled: isPaid === false,
            // 지불 상태에 따라 폴링 간격 조절
            refetchInterval: (data) => (data?.isPaid ? false : 1000)
        }
    )

    // 결제 상태가 변경 되었을 때, 결제 되었으면 페이지 새로고침
    useEffect(() => {
        if (data?.isPaid) {
            router.refresh();
        }
    }, [data?.isPaid, router])

    return (
        <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
            <div>
                <p className="font-medium text-gray-900">
                    Shipping To
                </p>
                <p>
                    {orderEmail}
                </p>
            </div>

            <div>
                <p className="font-medium text-gray-900">
                    Order Status
                </p>
                <p>
                    {isPaid  
                        ? "Payment successful" 
                        : "Pending payment"
                    }
                </p>
            </div>
        </div>
    )
}