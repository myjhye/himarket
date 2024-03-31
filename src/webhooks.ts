// stripe 웹훅 요청을 처리하는 서버의 엔드포인트 설정 - 결제 완료 이벤트에 대해 서버에서 취하는 작업 정의

import express from 'express'
import { WebhookRequest } from './server'
import { stripe } from './lib/stripe'
import type Stripe from 'stripe'
import { getPayloadClient } from './get-payload'
import { Product } from './payload-types'
import { Resend } from 'resend'
import { ReceiptEmailHtml } from './components/emails/ReceiptEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export const stripeWebhookHandler = async (
  req: express.Request,
  res: express.Response
) => {

  //------ stripe에서 온 요청을 검증 - 요청의 서명(signature)과 본문(body)을 사용해 이벤트 구성
  const webhookRequest = req as any as WebhookRequest
  const body = webhookRequest.rawBody
  const signature = req.headers['stripe-signature'] || ''

  let event
  try {
    // stripe 라이브러리 사용해 이벤트 유효성 검증
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    // 이벤트 유효성 검증 실패 시 오류 메세지로 응답
    return res
      .status(400)
      .send(
        `Webhook Error: ${
          err instanceof Error
            ? err.message
            : 'Unknown Error'
        }`
      )
  }

  // 이벤트에서 결제 세션 정보 추출
  const session = event
    .data
    .object as Stripe.Checkout.Session



  //--------- 결제 완료 이벤트 처리 - order에서 _isPaid 업데이트  
  if (
    !session?.metadata?.userId ||
    !session?.metadata?.orderId
  ) {
    return res
      .status(400)
      .send(`Webhook Error: No user present in metadata`)
  }

  // 결제 완료 이벤트 처리
  if (event.type === 'checkout.session.completed') {
    const payload = await getPayloadClient()

    // 사용자 정보 조회
    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        id: {
          equals: session.metadata.userId,
        },
      },
    })

    const [user] = users

    // 사용자 정보 없으면 에러
    if (!user)
      return res
        .status(404)
        .json({ error: 'No such user exists.' })


    // 주문 정보 조회
    const { docs: orders } = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })

    const [order] = orders

    // 주문 정보 없으면 에러
    if (!order)
      return res
        .status(404)
        .json({ error: 'No such order exists.' })


    // 주문 정보가 확인되면 주문 결제 상태 업데이트
    await payload.update({
      collection: 'orders',
      data: {
        _isPaid: true,
      },
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    })

    //------------- 결제 완료 후 사용자에게 order receipt 전송
    try {
      const data = await resend.emails.send({
        from: 'DigitalHippo <hello@joshtriedcoding.com>',
        to: [user.email],
        subject:
          'Thanks for your order! This is your receipt.',
        html: ReceiptEmailHtml({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products as Product[],
        }),
      })
      res.status(200).json({ data })

    // 이메일 전송 실패 시 에러
    } catch (error) {
      res.status(500).json({ error })
    }
  }

  // 모든 처리가 완료되면 성공 응답 반환
  return res.status(200).send()
}