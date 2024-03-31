// Products 테이블(컬렉션)

import {
    AfterChangeHook,
    BeforeChangeHook,
  } from 'payload/dist/collections/config/types'
  import { PRODUCT_CATEGORIES } from '../../config'
  import { Access, CollectionConfig } from 'payload/types'
  import { Product, User } from '../../payload-types'
  import { stripe } from '../../lib/stripe'
  
  // 제품 테이블에 사용자 정보 추가 - 데이터 변경 전 훅 
  const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
    
    const user = req.user
    
    return { 
      ...data, 
      user: user.id 
    }
  }
  
  //----- 사용자 제품 목록 동기화(최신 상태 유지) - 데이터 변경 후 훅
  const syncUser: AfterChangeHook<Product> = async ({ req, doc }) => {
    
    // 요청한 사용자의 전체 정보를 데이터베이스에서 조회
    const fullUser = await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
    })
  
    // 사용자 정보가 존재하고 객체 타입인 경우 로직 실행
    if (fullUser && typeof fullUser === 'object') {

      // 사용자에게 할당된 제품 id 목록 추출
      const { products } = fullUser
  
      // 기존 제품 목록에서 중복을 제거하고, 현재 문서의 id 추가
      const allIDs = [
        ...(products?.map((product) =>
          typeof product === 'object' 
            ? product.id 
            : product
        ) || []),
      ]
  
      // allIDs 배열에서 중복 값 제거
      const createdProductIDs = allIDs.filter(
        (id, index) => allIDs.indexOf(id) === index
      )
  
      // 데이터베이스에 최종 저장될 제품 id 목록 생성
      const dataToUpdate = [
        ...createdProductIDs, 
        doc.id
      ]
  
      // 사용자의 제품 목록을 최신 상태로 업데이트
      await req.payload.update({
        collection: 'users',
        id: fullUser.id,
        data: {
          products: dataToUpdate,
        },
      })
    }
  }
  
  //---- 관리자 권한이 있는 지 확인
  const isAdminOrHasAccess =
    (): Access =>
    ({ req: { user: _user } }) => {
      
      // 요청한 사용자를 User 타입으로 캐스팅
      const user = _user as User | undefined
  
      if (!user) {
        return false
      }

      // 모든 데이터 조회 가능 - 관리자인 경우
      if (user.role === 'admin') {
        return true
      }
  
      // 조회할 수 있는 제품 ID 목록 생성 - 일반 사용자인 경우
      const userProductIDs = (user.products || []).reduce<Array<string>>((acc, product) => {

        // 제품 정보가 없으면 현재 누적 값 반환
        if (!product) {
          return acc
        }

        // 제품 ID를 누적 값에 추가
        if (typeof product === 'string') {
          acc.push(product)
        } 
        else {
          acc.push(product.id)
        }
  
        return acc

      }, [])
  
      // 사용자의 제품 접근 권한 정보 반환
      return {
        id: {
          in: userProductIDs,
        },
      }
    }
  

  
  export const Products: CollectionConfig = {
    slug: 'products',

    //------- 관리 인터페이스 설정: 관리자 UI에서 사용할 설정 정의
    admin: {
      // 제품 이름을 제목으로 사용
      useAsTitle: 'name',
    },

    //-------- 접근 권한 설정
    access: {
      read: isAdminOrHasAccess(),
      update: isAdminOrHasAccess(),
      delete: isAdminOrHasAccess(),
    },

    //-------- 훅을 이용한 데이터 처리 - 제품 데이터 변경 전후(beforeChange, afterChange)에 실행될 로직을 훅으로 정의
    hooks: {

      // 데이터베이스 저장 후에 실행 - 제품 데이터 동기화
      afterChange: [syncUser],

      // 데이터베이스에 저장 전에 실행
      beforeChange: [

        // 1. 요청을 보낸 사용자의 id 저장 - 누가 제품을 생성하거나 수정했는지 확인
        addUser,

        // 2. stripe을 통해 생성된 제품에 대한 가격 정보 추가 - 제품에 대한 stipe 상품 id, 가격 id 설정
        async (args) => {
          
          // 제품 생성 시
          if (args.operation === 'create') {

            // 제품 데이터에서 제품 정보 추출
            const productData = args.data as Product;

            // stripe api를 사용해 제품을 생성하고, stripe 상품 id를 제품에 저장
            const stripeProduct = await stripe.products.create({
              name: productData.name,
            });

            // 생성된 stripe 상품의 가격 객체 생성하고, 그 가격 id를 제품에 저장
            const stripePrice = await stripe.prices.create({
              product: stripeProduct.id,
              unit_amount: Math.round(productData.price * 100),
              currency: 'usd',
            });

            // 제품 데이터에 stripe 상품 id와 가격 id를 추가해 반환
            return {
              ...productData,
              stripeId: stripeProduct.id,
              priceId: stripePrice.id,
            };
          }


          // 제품 수정 시
          else if (args.operation === 'update') {
            
            // 수정할 제품 데이터 추출
            const data = args.data as Product
  
            // stripe api 사용해 제품 정보 수정하고, 결과 받기
            const updatedProduct = await stripe.products.update(data.stripeId!, {
                name: data.name,
                // 기본 가격 id 수정
                default_price: data.priceId!,
              })
  
            // 수정한 제품 정보에 stripe 상품 id와 가격 id를 추가해 반환 
            const updated: Product = {
              ...data,
              stripeId: updatedProduct.id,
              priceId: updatedProduct.default_price as string,
            }
  
            return updated
          }
        },
      ],
    },


    //-------- 데이터 모델 정의 - 테이블 구조 정의
    fields: [
      {
        name: 'user',
        type: 'relationship',
        relationTo: 'users',
        required: true,
        hasMany: false,
        admin: {
          condition: () => false,
        },
      },
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Product details',
      },
      {
        name: 'price',
        label: 'Price in USD',
        min: 0,
        max: 1000,
        type: 'number',
        required: true,
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: PRODUCT_CATEGORIES.map(
          ({ label, value }) => ({ label, value })
        ),
        required: true,
      },
      {
        name: 'product_files',
        label: 'Product file(s)',
        type: 'relationship',
        required: true,
        relationTo: 'product_files',
        hasMany: false,
      },
      {
        name: 'approvedForSale',
        label: 'Product Status',
        type: 'select',
        defaultValue: 'pending',
        access: {
          create: ({ req }) => req.user.role === 'admin',
          read: ({ req }) => req.user.role === 'admin',
          update: ({ req }) => req.user.role === 'admin',
        },
        options: [
          {
            label: 'Pending verification',
            value: 'pending',
          },
          {
            label: 'Approved',
            value: 'approved',
          },
          {
            label: 'Denied',
            value: 'denied',
          },
        ],
      },
      {
        name: 'priceId',
        access: {
          create: () => false,
          read: () => false,
          update: () => false,
        },
        type: 'text',
        admin: {
          hidden: true,
        },
      },
      {
        name: 'stripeId',
        access: {
          create: () => false,
          read: () => false,
          update: () => false,
        },
        type: 'text',
        admin: {
          hidden: true,
        },
      },
      {
        name: 'images',
        type: 'array',
        label: 'Product images',
        minRows: 1,
        maxRows: 4,
        required: true,
        labels: {
          singular: 'Image',
          plural: 'Images',
        },
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
        ],
      },
    ],
  }