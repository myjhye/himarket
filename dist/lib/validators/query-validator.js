"use strict";
// api 쿼리 파라미터의 데이터 유형 정의
// api 쿼리 파라미터: url에서 '?' 이후에 나오는 키-값 쌍
//  https://example.com/api/products?category=books&limit=10에서 'category=books'와 'limit=10'
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryValidator = void 0;
var zod_1 = require("zod");
exports.QueryValidator = zod_1.z.object({
    category: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['asc', 'desc']).optional(),
    limit: zod_1.z.number().optional(),
});
