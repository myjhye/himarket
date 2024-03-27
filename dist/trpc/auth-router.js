"use strict";
// 회원가입 백엔드 - 회원가입, 이메일 인증, 로그인
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
var account_credentials_validator_1 = require("../lib/validators/account-credentials-validator");
var trpc_1 = require("./trpc");
var get_payload_1 = require("../get-payload");
var server_1 = require("@trpc/server");
var zod_1 = require("zod");
exports.authRouter = (0, trpc_1.router)({
    /*
      publicProcedure: 권한 없는 사용자(미로그인)도 요청 가능
      - 미로그인 사용자 회원가입 가능
    */
    //-- 1. 회원가입 --//
    createPayloadUser: trpc_1.publicProcedure
        // .input: 입력 값 유효성 검사
        .input(account_credentials_validator_1.AuthCredentialsValidator)
        // 사용자 입력 값 기반으로 새 사용자 생성(회원가입)
        .mutation(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var email, password, payload, users;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        email = input.email, password = input.password;
                        return [4 /*yield*/, (0, get_payload_1.getPayloadClient)()
                            // 중복 사용자 데이터베이스에서 검사 - 이메일 기반
                        ];
                    case 1:
                        payload = _b.sent();
                        return [4 /*yield*/, payload.find({
                                collection: 'users',
                                where: {
                                    email: {
                                        equals: email,
                                    },
                                },
                            })
                            // 같은 이메일 가진 사용자 있으면 에러
                        ];
                    case 2:
                        users = (_b.sent()).docs;
                        // 같은 이메일 가진 사용자 있으면 에러
                        if (users.length !== 0)
                            throw new server_1.TRPCError({ code: 'CONFLICT' });
                        //** 새 사용자 생성
                        return [4 /*yield*/, payload.create({
                                collection: 'users',
                                data: {
                                    email: email,
                                    password: password,
                                    role: 'user',
                                },
                            })
                            // 결과 반환 - 성공 여부, 전송한 이메일
                        ];
                    case 3:
                        //** 새 사용자 생성
                        _b.sent();
                        // 결과 반환 - 성공 여부, 전송한 이메일
                        return [2 /*return*/, {
                                success: true,
                                sentToEmail: email
                            }];
                }
            });
        });
    }),
    //-- 2. 이메일 인증 --//
    verifyEmail: trpc_1.publicProcedure
        // .input: 입력 값 유효성 검사
        .input(zod_1.z.object({
        token: zod_1.z.string()
    }))
        /*
          1. mutation 대신 query 사용 - 데이터를 변경하는 것이 아니라서
          2. .query: 화면에서 서버로 전달된 로직 처리
        */
        .query(function (_a) {
        var input = _a.input;
        return __awaiter(void 0, void 0, void 0, function () {
            var token, payload, isVerified;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = input.token;
                        return [4 /*yield*/, (0, get_payload_1.getPayloadClient)()
                            //** 토큰으로 이메일 검증 - users 테이블에 토큰 전달
                        ];
                    case 1:
                        payload = _b.sent();
                        return [4 /*yield*/, payload.verifyEmail({
                                collection: "users",
                                token: token,
                            })
                            // 인증 실패 - UNAUTHORIZED 에러
                        ];
                    case 2:
                        isVerified = _b.sent();
                        // 인증 실패 - UNAUTHORIZED 에러
                        if (!isVerified) {
                            throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
                        }
                        // 인증 성공 시 isVerified를 true로
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    }),
    //-- 3. 로그인 --//
    signIn: trpc_1.publicProcedure
        .input(account_credentials_validator_1.AuthCredentialsValidator)
        .mutation(function (_a) {
        var input = _a.input, ctx = _a.ctx;
        return __awaiter(void 0, void 0, void 0, function () {
            var email, password, payload, res, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        email = input.email, password = input.password;
                        return [4 /*yield*/, (0, get_payload_1.getPayloadClient)()];
                    case 1:
                        payload = _b.sent();
                        res = ctx.res;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, payload.login({
                                collection: "users",
                                data: {
                                    email: email,
                                    password: password,
                                },
                                // 응답을 login 메소드에 전달 - 로그인 상태 유지
                                res: res,
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_1 = _b.sent();
                        throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
                    case 5: return [2 /*return*/];
                }
            });
        });
    })
});
