// stripe 인스턴스 - 여기에 결제 정보를 주입해 stripe api(서버)에 전달

import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? '',
  {
    apiVersion: '2023-10-16',
    typescript: true,
  }
)