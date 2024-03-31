// 백엔드 - 결제 

import { z } from 'zod'
import {
  privateProcedure,
  publicProcedure,
  router,
} from './trpc'
import { TRPCError } from '@trpc/server'
import { getPayloadClient } from '../get-payload'
import { stripe } from '../lib/stripe'
import type Stripe from 'stripe'

/*
  input: 입력 데이터 형태 정의 - productId
  mutation: 데이터 변경 - post, put, delete
*/

export const paymentRouter = router({

  //------- 결제 세션
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    // 입력 값(productIds)을 기반으로 데이터 변경
    .mutation(async ({ ctx, input }) => {

      // 사용자 정보
      const { user } = ctx
      let { productIds } = input

      if (productIds.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const payload = await getPayloadClient()

      // 제품 조회
      const { docs: products } = await payload.find({
        collection: 'products',
        where: {
          id: {
            in: productIds,
          },
        },
      })

      // priceId가 있는 제품만 필터링
      const filteredProducts = products.filter((prod) =>
        Boolean(prod.priceId)
      )

      // 주문 생성하고 저장
      const order = await payload.create({
        collection: 'orders',
        data: {
          // 결제 상태 미지불
          _isPaid: false,
          // 선택된 제품 ID 저장
          products: filteredProducts.map((prod) => prod.id),
          // 사용자 ID 저장
          user: user.id,
        },
      })

      // stripe에 전달할 매개변수
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

      filteredProducts.forEach((product) => {
        if (product.priceId) {
          line_items.push({
            price: product.priceId,
            quantity: 1,
          });
        }
      });
      
      // 결제 정보를 매개변수에 추가
      line_items.push({
        // $1
        price: 'price_1OxW3jBzDYAUqxDJY6WPWkfm',
        quantity: 1,
        adjustable_quantity: {
          // 수량 조절 비활성화
          enabled: false,
        },
      })

      // stripe 체크아웃 세션 - 결제 정보 stripe에 전달
      try {
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
            payment_method_types: ['card'],
            // 결제 모드
            mode: 'payment',
            metadata: {
              // 사용자 ID 메타데이터로 저장
              userId: user.id,
              // 주문 ID 메타데이터로 저장
              orderId: order.id,
            },
            // 결제 항목 - 사용자가 구매할 상품들의 목록 - price, quantity
            line_items,
          })

        // 생성된 세션 url 반환 - stripe가 생성한 결제 페이지
        return { url: stripeSession.url }

      } catch (err) {
        console.error(err)
        return { url: null }
      }
    }),


  //-------- 지불 상태가 true로 변경 되었는지 확인 - 주문 완료 페이지에서 사용자에게 결제 상태 보이기
  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      const { orderId } = input

      const payload = await getPayloadClient()

      // 주문 정보 조회
      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: {
          id: {
            equals: orderId,
          },
        },
      })

      // 주문 데이터 없으면 에러
      if (!orders.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const [order] = orders

      // 주문 지불 상태 반환
      return { isPaid: order._isPaid }
    }),
})