"use strict";
// 서버 설정 및 API 라우팅 & Express, Next.js, Payload CMS의 통합 포인트 역할
/*
    Next.js: 관리자 페이지의 프론트 - Payload CMS의 API 사용해 화면 렌더링
    Express: 백엔드 로직 처리 - HTTP 요청 관리, 라우팅, 미들웨어 처리
    Payload CMS: Headless CMS로서 API 제공

    - Next.js 프론트에서 Payload CMS API로 데이터 가져와 화면 렌더링 & Express는 백엔드로서 Next.js와 Payload 사이의 통신 관리
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var get_payload_1 = require("./get-payload");
var next_utils_1 = require("./next-utils");
var trpcExpress = __importStar(require("@trpc/server/adapters/express"));
var trpc_1 = require("./trpc");
var body_parser_1 = __importDefault(require("body-parser"));
var webhooks_1 = require("./webhooks");
var build_1 = __importDefault(require("next/dist/build"));
var app = (0, express_1.default)();
// 환경 변수에서 포트 번호를 가져오거나 기본 값으로 3000을 설정
var PORT = Number(process.env.PORT) || 3000;
var createContext = function (_a) {
    var req = _a.req, res = _a.res;
    return ({
        req: req,
        res: res,
    });
};
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var webhookMiddleware, payload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                webhookMiddleware = body_parser_1.default.json({
                    verify: function (req, _, buffer) {
                        req.rawBody = buffer;
                    }
                });
                app.post("/api/webhooks/stripe", webhookMiddleware, webhooks_1.stripeWebhookHandler);
                return [4 /*yield*/, (0, get_payload_1.getPayloadClient)({
                        // Payload CMS를 Express와 통합
                        initOptions: {
                            // Express 앱 인스턴스를 Payload CMS 초기화 옵션에 전달
                            express: app,
                            onInit: function (cms) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // Payload CMS가 초기화되면 관리자 URL을 로깅
                                    cms.logger.info("Admin URL ".concat(cms.getAdminURL));
                                    return [2 /*return*/];
                                });
                            }); },
                        },
                    })];
            case 1:
                payload = _a.sent();
                if (process.env.NEXT_BUILD) {
                    app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    payload.logger.info("Next.js is building for production");
                                    // @ts-expect-error
                                    return [4 /*yield*/, (0, build_1.default)(path.join(__dirname, "../"))];
                                case 1:
                                    // @ts-expect-error
                                    _a.sent();
                                    process.exit();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                }
                // Express에 API 라우팅 설정 - tRPC 미들웨어 사용
                app.use('/api/trpc', trpcExpress.createExpressMiddleware({
                    router: trpc_1.appRouter,
                    createContext: createContext,
                }));
                // Express가 받는 HTTP 요청을 Next.js에 위임해 대신 처리하게 한다 - Next.js의 서버사이드렌더링을 위해서 (서버에서 데이터 처리를 한 후 프론트에 전달)
                app.use(function (req, res) { return (0, next_utils_1.nextHandler)(req, res); });
                // Next.js 어플리케이션 준비. 준비 완료되면 서버 시작.
                next_utils_1.nextApp.prepare().then(function () {
                    // Next.js가 시작됨 로깅
                    payload.logger.info('Next.js started');
                    // Express 서버를 지정된 포트에서 리스닝하도록 시작
                    app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // 서버가 시작되면 Next.js 어플리케이션 URL을 로깅
                            payload.logger.info("Next.js App URL: ".concat(process.env.NEXT_PUBLIC_SERVER_URL));
                            return [2 /*return*/];
                        });
                    }); });
                });
                return [2 /*return*/];
        }
    });
}); };
start();
