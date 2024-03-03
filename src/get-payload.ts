// Payload CMS 생성

import dotenv from 'dotenv'
import path from 'path'
import type { InitOptions } from 'payload/config'
import payload, { Payload } from 'payload'
import nodemailer from 'nodemailer'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

//-- nodemailer 설정 --//
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
})


// cached: 페이로드 인스턴스 - 전역 사용(global)
let cached = (global as any).payload

// 페이로드 인스턴스 없으면 생성
if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  }
}

interface Args {
  initOptions?: Partial<InitOptions>
}


//-- 인증 이메일 전송 (전송만, 인증은 X) --//
export const getPayloadClient = async ({ initOptions }: Args = {}): Promise<Payload> => {
  
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing')
  }

  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      // 전송자 정보
      email: {
        transport: transporter,
        fromAddress: 'onboarding@resend.dev',
        fromName: 'hi-market',
      },
      secret: process.env.PAYLOAD_SECRET,
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    })
  }

  try {
    // 화면(cached.client)에 전송자 정보(cached.promise) 할당 
    cached.client = await cached.promise
  } catch (e: unknown) {
    cached.promise = null
    throw e
  }

  return cached.client
}