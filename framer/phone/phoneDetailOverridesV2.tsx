import type { ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { createClient } from "@supabase/supabase-js"
import React, { useEffect, useState, useMemo, useRef } from "react"
// @ts-ignore
import { Override, useRouter } from "framer"

// iphone16e
const TARGET_POPUP_PATH = "/phone/aip16e-128"

// 대상 모델 목록 정의 0227
const S26_MODLE = [
    "sm-s942nk",
    "sm-s942nk512",
    "sm-s947nk",
    "sm-s947nk512",
    "sm-s948nk",
    "sm-s948nk512",
]

const Iphone17e_MODEL = ["aip17e-256", "aip17e-512"]

const preorderModel = [
    "aip17-256",
    "aip17-512",

    "aipa-256",
    "aipa-512",
    "aipa-1t",

    "aip17p-256",
    "aip17p-512",
    "aip17p-1t",

    "aip17pm-256",
    "aip17pm-512",
    "aip17pm-1t",
    "aip17pm-2t",
]
// 아이폰17e
const DELAYED_MODELS = ["aip17e-256", "aip17e-512"]

// 12-04
const SPECIAL_PRICES: Record<string, { mnp: number; chg: number }> = {
    // iPhone 13
    "aip13-128": { mnp: 0, chg: 0 },

    // iPhone 15 시리즈
    "aip15-512": { mnp: 0, chg: 0 },
    "aip15p-512": { mnp: 0, chg: 0 },
    "aip15pm-256": { mnp: 0, chg: 0 },
    "aip15pm-512": { mnp: 0, chg: 0 },
    "aip15ps-128": { mnp: 0, chg: 0 },
    "aip15ps-256": { mnp: 0, chg: 0 },
    "aip15ps-512": { mnp: 0, chg: 0 },

    // iPhone 16 시리즈
    "aip16-128": { mnp: 0, chg: 0 },
    "aip16-256": { mnp: 0, chg: 0 },
    "aip16-512": { mnp: 0, chg: 0 },
    "aip16e-128": { mnp: 0, chg: 0 },
    "aip16e-256": { mnp: 0, chg: 0 },
    "aip16p-128": { mnp: 0, chg: 0 },
    "aip16p-256": { mnp: 0, chg: 0 },
    "aip16p-512": { mnp: 0, chg: 0 },
    "aip16pm-256": { mnp: 0, chg: 0 },
    "aip16pm-512": { mnp: 0, chg: 0 },
    "aip16ps-128": { mnp: 0, chg: 0 },
    "aip16ps-256": { mnp: 0, chg: 0 },
    "aip16ps-512": { mnp: 0, chg: 0 },

    // 🔥 iPhone 17 시리즈 (사전예약) - 번호이동만 70,000원
    "aip17-256": { mnp: 0, chg: 0 },
    "aip17-512": { mnp: 0, chg: 0 },
    "aip17p-1t": { mnp: 0, chg: 0 },
    "aip17p-256": { mnp: 0, chg: 0 },
    "aip17p-512": { mnp: 0, chg: 0 },
    "aip17pm-1t": { mnp: 0, chg: 0 },
    "aip17pm-256": { mnp: 0, chg: 0 },
    "aip17pm-2t": { mnp: 0, chg: 0 },
    "aip17pm-512": { mnp: 0, chg: 0 },
    "aipa-1t": { mnp: 0, chg: 0 },
    "aipa-256": { mnp: 0, chg: 0 },
    "aipa-512": { mnp: 0, chg: 0 },

    // Samsung A 시리즈
    "sm-a165nk": { mnp: 0, chg: 0 },
    "sm-a165nk-kpgn": { mnp: 0, chg: 0 },
    "sm-a175nk": { mnp: 0, chg: 0 },
    "sm-a366nk": { mnp: 0, chg: 0 },

    // Samsung Z Flip 시리즈
    "sm-f741nk": { mnp: 0, chg: 0 },
    "sm-f761nk": { mnp: 0, chg: 0 },
    "sm-f766nk": { mnp: 0, chg: 0 },
    "sm-f766nk512": { mnp: 0, chg: 0 },
    "sm-f946nk": { mnp: 0, chg: 0 },
    "sm-f956nk": { mnp: 0, chg: 0 },
    "sm-f956nk512": { mnp: 0, chg: 0 },
    "sm-f966nk": { mnp: 0, chg: 0 },
    "sm-f966nk512": { mnp: 0, chg: 0 },

    // Samsung M 시리즈
    "sm-m366k": { mnp: 0, chg: 0 },

    // Samsung S 시리즈
    "sm-s721nk": { mnp: 0, chg: 0 },
    "sm-s731nk": { mnp: 0, chg: 0 },
    "sm-s928nk": { mnp: 0, chg: 0 },
    "sm-s931nk": { mnp: 0, chg: 0 },
    "sm-s931nk512": { mnp: 0, chg: 0 },
    "sm-s936nk": { mnp: 0, chg: 0 },
    "sm-s936nk512": { mnp: 0, chg: 0 },
    "sm-s937nk": { mnp: 0, chg: 0 },
    "sm-s937nk512": { mnp: 0, chg: 0 },
    "sm-s938nk": { mnp: 0, chg: 0 },
    "sm-s938nk512": { mnp: 0, chg: 0 },

    // Motorola
    "xt2363-3k": { mnp: 0, chg: 0 },
    "xt2429-2k": { mnp: 0, chg: 0 },

    // 기타
    z2339k: { mnp: 0, chg: 0 },
}

interface Phone {
    category: string // 카테고리 ID 또는 코드
    model: string // 모델 ID 또는 코드
    petName: string // 모델의 사용자 친화적인 이름
    colorsKr: string[] // 색상 (한국어)
    colorsEn: string[] // 색상 (영어)
    colorsCode: string[] // 색상 컬러
    capacities: string[] // 저장 용량 옵션
    paths: string[] // 경로 또는 SKU 정보
}

interface KTmarketSubsidy {
    model: string // 모델 ID
    network: string // 통신망 (예: LTE, 5G 등)
    company: string // 통신사 (예: KT, SKT 등)

    // 요금제 할인 (신규가입/번호이동/기기변경) - 요금제 구간 기준
    plan_discount_new_gte_110000: number
    plan_discount_mnp_gte_110000: number
    plan_discount_chg_gte_110000: number

    plan_discount_new_gte_100000: number
    plan_discount_mnp_gte_100000: number
    plan_discount_chg_gte_100000: number

    plan_discount_new_gte_61000: number
    plan_discount_mnp_gte_61000: number
    plan_discount_chg_gte_61000: number

    plan_discount_new_gte_37000: number
    plan_discount_mnp_gte_37000: number
    plan_discount_chg_gte_37000: number

    plan_discount_new_lt_37000: number
    plan_discount_mnp_lt_37000: number
    plan_discount_chg_lt_37000: number

    // 단말기 할인 (신규가입/번호이동/기기변경) - 요금제 구간 기준
    device_discount_new_gte_110000: number
    device_discount_mnp_gte_110000: number
    device_discount_chg_gte_110000: number

    device_discount_new_gte_100000: number
    device_discount_mnp_gte_100000: number
    device_discount_chg_gte_100000: number

    device_discount_new_gte_61000: number
    device_discount_mnp_gte_61000: number
    device_discount_chg_gte_61000: number

    device_discount_new_gte_37000: number
    device_discount_mnp_gte_37000: number
    device_discount_chg_gte_37000: number

    device_discount_new_lt_37000: number
    device_discount_mnp_lt_37000: number
    device_discount_chg_lt_37000: number
}

interface Plan {
    planId: string
    modelPrice?: number
    name?: string
    disclosureSubsidy?: number
    migrationSubsidy?: number
    price?: number
}

interface PlanInfo {
    pid: string
    title: string
    price: number
    description: string
    data: string
    tethering: string
    roaming: string
    voiceText: string
    isBenefit: boolean
}

const defaultPlanInfo: PlanInfo = {
    pid: "ppllistobj_0865",
    title: "디바이스 초이스 베이직",
    price: 90000,
    description:
        "디바이스 할부금 할인 / 멤버쉽VIP / 만 34세이하 Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB",
    data: "완전 무제한",
    tethering: "40GB",
    roaming: "무제한 (최대100Kbps 속도제어)",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
    // pid: "ppllistobj_0937",
    // title: "(유튜브 프리미엄) 초이스 베이직",
    // price: 90000,
    // description:
    //     "유튜브 프리미엄 제공 / 멤버쉽VIP /  만 34세이하 Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB",
    // data: "완전 무제한",
    // tethering: "40GB",
    // roaming: "무제한 (최대100Kbps 속도제어)",
    // voiceText: "집/이동전화 무제한/기본제공",
    // isBenefit: true,
    // pid: "ppllistobj_0808",
    // title: "5G 심플 110GB",
    // price: 69000,
    // description:
    //     "나의 데이터 사용량에 맞춤 실속형 요금제 / 만 34세이하 Y덤 혜택 기본데이터 2배 220GB",
    // data: "110GB+다 쓰면 최대 5Mbps",
    // tethering: "40GB",
    // roaming: "",
    // voiceText: "집/이동전화 무제한/기본제공",
    // isBenefit: true,
}

const appliancePlanInfo: PlanInfo = {
    pid: "ppllistobj_0993",
    title: "가전구독 초이스 스페셜",
    price: 110000,
    description: "KT 가전구독상품 월 할부금 할인",
    data: "완전 무제한",
    tethering: "70GB",
    roaming: "100Kbps 무제한",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const deviceChoicePlanInfo: PlanInfo = {
    pid: "ppllistobj_0864",
    title: "디바이스 초이스 스페셜",
    price: 110000,
    description:
        "디바이스 할부금 할인 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP, 단말보험할인 / 만 34세이하 Y덤 혜택) 공유데이터 2배 140GB",
    data: "완전 무제한",
    tethering: "70GB",
    roaming: "무제한 (최대100Kbps 속도제어)",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const samsungChoicePlanInfo: PlanInfo = {
    pid: "ppllistobj_0851",
    title: "삼성 초이스 스페셜",
    price: 110000,
    description:
        "삼성초이스 디바이스 할부금 할인 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP, 단말보험할인 / 만 34세이하 Y덤 혜택) 공유데이터 2배 140GB",
    data: "완전 무제한",
    tethering: "70GB",
    roaming: "무제한 (최대100Kbps 속도제어)",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const iPhone13DefaultPlanInfo: PlanInfo = {
    pid: "ppllistobj_0844",
    title: "5G 주니어",
    price: 38000,
    description:
        "만 12세 이하를 위한 요금제,KT안심박스(워치 조회 및 유해물 차단 등 안드로이드 한정) 무료 제공",
    data: "5GB+무제한(1Mbps)",
    tethering: "",
    roaming: "",
    voiceText: "무제한/기본 제공",
    isBenefit: true,
}

const A17defaultPlanInfo: PlanInfo = {
    pid: "ppllistobj_0745",
    title: "LTE 베이직",
    price: 33000,
    description: "데이터 1.4GB에 집/이동전화,문자 기본제공 가성비 좋은 요금제",
    data: "1.4GB",
    tethering: "",
    roaming: "",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const Iphone16ePlanInfo: PlanInfo = {
    pid: "ppllistobj_0941",
    title: "티빙/지니/밀리 초이스 스페셜",
    price: 110000,
    description:
        "티빙·지니 스마트 음악감상·밀리의 서재·블라이스 기본제공 / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP, 단말보험할인 / 만 34세이하 Y덤 혜택) 공유데이터 2배 140GB",
    data: "완전 무제한",
    tethering: "70GB",
    roaming: "무제한 (최대100Kbps 속도제어)",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const deviceJuniorSlimPlanInfo: PlanInfo = {
    pid: "ppllistobj_0845",
    title: "5G 주니어 슬림",
    price: 28000,
    description:
        "만 12세 이하를 위한 요금제, 느린속도 데이터 무제한 제공, 통화 무제한, KT안심박스 무료 제공",
    data: "3GB+다 쓰면 최대 400Kbps",
    tethering: "기본 제공량 내 이용 가능",
    roaming: "",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: false,
}

const samsungChoiceBasicPlanInfo: PlanInfo = {
    pid: "ppllistobj_0850",
    title: "삼성 초이스 베이직",
    price: 90000,
    description:
        "삼성초이스 디바이스 할부금 할인 / 멤버쉽VIP / 만 34세이하 Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB",
    data: "완전 무제한",
    tethering: "40GB",
    roaming: "무제한 (최대100Kbps 속도제어)",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const deviceChoiceBasicPlanInfo: PlanInfo = {
    pid: "ppllistobj_0865",
    title: "디바이스 초이스 베이직",
    price: 90000,
    description:
        "디바이스 할부금 할인 / 멤버쉽VIP / 만 34세이하 Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB",
    data: "완전 무제한",
    tethering: "40GB",
    roaming: "무제한 (최대100Kbps 속도제어)",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const applianceChoiceBasicPlanInfo: PlanInfo = {
    pid: "ppllistobj_0992",
    title: "가전구독 초이스 베이직",
    price: 90000,
    description: "KT 가전구독상품 월 할부금 할인",
    data: "완전 무제한",
    tethering: "40GB",
    roaming: "100Kbps 무제한",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
}

const simple30GBPlanInfo: PlanInfo = {
    pid: "ppllistobj_0926",
    title: "5G 심플 30GB",
    price: 61000,
    description:
        "나의 데이터 사용량에 맞춤 실속형 요금제 / 만 34세이하 Y덤 혜택) 기본데이터 2배 60GB",
    data: "30GB+다 쓰면 최대 1Mbps",
    tethering: "30GB",
    roaming: "",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: false,
}

const plans = [
    defaultPlanInfo,
    A17defaultPlanInfo,
    Iphone16ePlanInfo,
    deviceJuniorSlimPlanInfo,
    samsungChoiceBasicPlanInfo,
    applianceChoiceBasicPlanInfo,
    simple30GBPlanInfo,
    deviceChoiceBasicPlanInfo,
    samsungChoicePlanInfo,
    deviceChoicePlanInfo,
    appliancePlanInfo,
]

const mapToPlanInfo = (data: any): PlanInfo => {
    const isBenefit =
        data.price >= 61000 ||
        ["ppllistobj_0778", "ppllistobj_0844", "ppllistobj_0893"].includes(
            data.pid
        )
    return {
        pid: data.pid || "",
        title: data.title || "",
        price: data.price || 0,
        description: data.description || "",
        data: data.data || "",
        tethering: data.tethering || "",
        roaming: data.roaming || "",
        voiceText: data.voiceText || "",
        isBenefit: isBenefit,
    }
}

const getPlanInfoByPid = (pid: string): PlanInfo => {
    const matchedPlan = plans.find((plan) => plan.pid === pid)
    return matchedPlan ?? defaultPlanInfo
}

// 12-04
const pickSpecialPriceByRegister = (register: string, props: any) => {
    const mnp =
        Number(props.special_price_mnp ?? props.specialPriceMnp ?? 0) || 0
    const chg =
        Number(props.special_price_chn ?? props.specialPriceChn ?? 0) || 0

    if (register === "번호이동") return { selected: mnp, mnp, chg }
    if (register === "기기변경") return { selected: chg, mnp, chg }
    if (register === "신규가입") return { selected: mnp, mnp, chg } // 01-16
    return { selected: 0, mnp, chg }
}

interface DeviceData {
    category: string
    model: string
    pet_name: string
    colors_code: string[]
    colors_kr: string[]
    colors_en: string[]
    capacities: string[]
    paths: string[]
}

interface Device {
    category: string
    model: string
    petName: string
    colors: Color[]
    capacities: Capacity[]
}

interface Color {
    kr: string
    en: string
    code: string
    isSoldOut: boolean
    urls: []
}

interface Capacity {
    capacity: string
    path: string
}


const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const useStore = createStore({
    capacity: null,
    currentModelId: null as string | null,
    isLoading: true,
    device: null,
    colors: [],
    // pid: "ppllistobj_0808",
    color: null,
    register: "기기변경",
    plan: null,
    // planInfo: defaultPlanInfo,
    planInfo: null,
    selectedPlan: null,
    selectedPlanInfo: null,
    // benefit: "KT마켓 단독혜택",
    benefit: "KT마켓 단독혜택",
    installment: 24,
    discount: "공통지원금",
    freebie: null,
    freebieSecond: null,
    isExpanded: false,
    ktmarketSubsidy: 0,
    ktmarketSubsidies: null,
    isGuaranteedReturn: false,
    installmentPrincipal: 0,
})


// OrderSummaryCard 전용 override
// finalPrice 카운트 애니메이션 + 월 할부 팝업 + 스켈레톤 통합 + 최종 주문서 모달 props
export function withPriceCard(Component): ComponentType {
    return (props) => {
        const [store] = useStore()

        // ── 헬퍼 함수 (withOrderSheet와 동일 로직) ──────────────────
        function calcInstallment(principal: number, months: number) {
            if (months === 0) return principal
            const r = 5.9 / 100 / 12
            const n = months
            return Math.floor(
                (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
            )
        }

        function getGuaranteedReturnPrice(model: string, price: number, isGR: boolean) {
            if (!isGR) return 0
            const grModels = [
                "sm-f966nk512", "sm-f966nk", "sm-f766nk512", "sm-f766nk",
                "aip17-256", "aip17-512", "aipa-256", "aipa-512", "aipa-1t",
                "aip17p-256", "aip17p-512", "aip17p-1t",
                "aip17pm-256", "aip17pm-512", "aip17pm-1t", "aip17pm-2t",
            ]
            return grModels.includes(model) ? price / 2 : 0
        }

        function calculateDiscounts(planId: string) {
            const promo100000Plans = [
                "ppllistobj_0994", "ppllistobj_0993", "ppllistobj_0992",
                "ppllistobj_0863", "ppllistobj_0864", "ppllistobj_0865",
                "ppllistobj_0850", "ppllistobj_0851", "ppllistobj_0852",
            ]
            return { promo: promo100000Plans.includes(planId) ? 80000 : 0 }
        }

        // ── 계산 ────────────────────────────────────────────────────
        const { register, discount, selectedPlan, device, benefit } = store

        const planPrice = selectedPlan?.price ?? 0
        const planId = selectedPlan?.plan_id ?? ""
        const devicePrice = selectedPlan?.model_price ?? 0
        const isMnp = register === "번호이동" && discount === "공통지원금"
        const migrationSubsidy = isMnp ? (selectedPlan?.migration_subsidy ?? 0) : 0

        const ktmarketSubsidy = store.benefit === "KT마켓 단독혜택" ? store.ktmarketSubsidy : 0
        const { promo: promotionDiscount } = calculateDiscounts(planId)

        const isGuaranteedReturn = store.isGuaranteedReturn ?? false
        const guaranteedReturnPrice = getGuaranteedReturnPrice(
            device?.model ?? "", devicePrice, isGuaranteedReturn
        )

        const modelPrices = SPECIAL_PRICES[device?.model ?? ""] || { mnp: 0, chg: 0 }
        const specialPrice =
            register === "번호이동" || register === "신규가입"
                ? modelPrices.mnp
                : register === "기기변경"
                    ? modelPrices.chg
                    : 0

        let disclosureSubsidy = 0
        if (discount === "공통지원금") {
            disclosureSubsidy = selectedPlan?.disclosure_subsidy ?? 0
        }

        // 더블스토리지
        const doubleStorageModels = ["sm-s942nk512", "sm-s947nk512", "sm-s948nk512"]
        const exceptionPlansForDoubleStorage = [
            "ppllistobj_0845", "ppllistobj_0535", "ppllistobj_0765", "ppllistobj_0775",
        ]
        let doubleStorageDiscount = 0
        if (
            doubleStorageModels.includes(device?.model ?? "") &&
            register === "기기변경" &&
            store.installment < 36 &&
            (planPrice >= 37000 || exceptionPlansForDoubleStorage.includes(planId))
        ) {
            doubleStorageDiscount = 0
        }

        const totalDeviceDiscountAmount =
            ktmarketSubsidy + disclosureSubsidy + migrationSubsidy +
            promotionDiscount + guaranteedReturnPrice + specialPrice + doubleStorageDiscount

        const installment = store.installment ?? 24
        const originPrice = device?.price ?? 0

        const isFreePhone = devicePrice - totalDeviceDiscountAmount <= 0
        const installmentPrincipal = isFreePhone ? 0 : devicePrice - totalDeviceDiscountAmount
        const installmentPaymentNum = isFreePhone
            ? 0
            : calcInstallment(installmentPrincipal, installment,)
        const installmentPayment = `${installmentPaymentNum.toLocaleString()}원`

        const planDiscountAmount = discount === "공통지원금" ? 0 : Math.round(planPrice * 0.25)
        const totalMonthPlanPrice = planPrice - planDiscountAmount
        const totalMonthPayment =
            installment === 0
                ? totalMonthPlanPrice
                : installmentPaymentNum + totalMonthPlanPrice

        const monthlyPayment = calcInstallment(installmentPrincipal, installment)

        const discountRate = (() => {
            if (originPrice <= 0) return 0
            const rate = ((originPrice - installmentPrincipal) / originPrice) * 100
            return Math.round(Math.min(Math.max(rate, 0), 100))
        })()

        const installmentPaymentTitle = isGuaranteedReturn
            ? "월 할부금"
            : installment > 0
                ? `월 할부금 (${installment}개월)`
                : "결제 금액"
        const installmentPaymentDescription =
            installment > 0 ? "분할 상환 수수료 5.9% 포함" : "카드 또는 현금결제"

        return (
            <Component
                {...props}
                finalPrice={installmentPrincipal}
                originPrice={originPrice}
                discountRate={discountRate}
                monthlyPayment={monthlyPayment}
                installment={installment}
                planPrice={planPrice}
                planDiscountAmount={planDiscountAmount}
                discount={discount ?? "공통지원금"}
                isLoading={store.isLoading ?? false}
                formLink={device?.form_link ?? ""}
                // OrderSheet 모달용 props
                installmentPaymentTitle={installmentPaymentTitle}
                installmentPaymentDescription={installmentPaymentDescription}
                installmentPrincipal={installmentPrincipal}
                installmentPayment={installmentPayment}
                devicePrice={devicePrice}
                disclosureSubsidy={disclosureSubsidy}
                ktmarketSubsidy={ktmarketSubsidy}
                promotionDiscount={promotionDiscount}
                migrationSubsidy={migrationSubsidy}
                guaranteedReturnPrice={guaranteedReturnPrice}
                specialPrice={specialPrice}
                doubleStorageDiscount={doubleStorageDiscount}
                plan={selectedPlan?.name ?? ""}
                totalMonthPlanPrice={totalMonthPlanPrice}
                totalMonthPayment={Math.round(totalMonthPayment)}
            />
        )
    }
}


// 최종
export function withOrderSheet(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const { navigate, routes } = useRouter()
        const [formLink, setFormLink] = useState(props.formLink)
        const [hydrated, setHydrated] = useState(false)

        // 12-04
        const [specialPriceMnp, setSpecialPriceMnp] = useState(0)
        const [specialPriceChg, setSpecialPriceChg] = useState(0)

        const [installmentPayment, setInstallmentPayment] = useState("")
        const [installmentPaymentNoInterest, setInstallmentPaymentNoInterest] = useState(0)
        const [totalMonthPaymentNoInterest, setTotalMonthPaymentNoInterest] = useState(0)
        const [planName, setPlanName] = useState("")
        const [benefit, setBenefit] = useState("")
        const [discount, setDiscount] = useState("")
        const [devicePrice, setDevicePrice] = useState(0)
        const [ktmarketSubsidy, setKtmarketSubsidy] = useState(0)
        const [disclosureSubsidy, setDisclosureSubsidy] = useState(0)
        // 추가할인 합계 (KT마켓지원금 + 프로모션 + 디바이스 추가지원금 + 미리보상 등)
        const [additionalSubsidy, setAdditionalSubsidy] = useState(0)
        const [migrationSubsidy, setMigrationSubsidy] = useState(0)
        const [totalDeviceDiscountAmount, setTotalDeviceDiscountAmount] =
            useState(0)
        const [installmentPrincipal, setInstallmentPrincipal] = useState(0)
        const [planPrice, setPlanPrice] = useState(0)
        const [planDiscountAmount, setPlanDiscountAmount] = useState(0)
        const [totalPlanDiscountAmount, setTotalPlanDiscountAmount] =
            useState(0)
        const [totalMonthPlanPrice, setTotalMonthPlanPrice] = useState(0)
        const [totalMonthPayment, setTotalMonthPayment] = useState(0)
        const [isGuaranteedReturn, setIsGuaranteedReturn] = useState(false)
        const [guaranteedReturnPrice, setGuaranteedReturnPrice] = useState(0)
        const [preorderDiscount, setPreorderDiscount] = useState(0)
        const [promotionDiscount, setPromotionDiscount] = useState(0)
        const [freebie, setFreebie] = useState("")
        const [monthlyPriceFreebie, setMonthlyPriceFreebie] = useState(0)
        const [doubleStorageDiscount, setDoubleStorageDiscount] = useState(0)

        const getGuaranteedReturnPrice = (
            model: string,
            price: number,
            isGuaranteedReturn: boolean
        ) => {
            const guaranteedReturnModels = [
                "sm-f966nk512",
                "sm-f966nk",
                "sm-f766nk512",
                "sm-f766nk",
                "aip17-256",
                "aip17-512",
                "aipa-256",
                "aipa-512",
                "aipa-1t",
                "aip17p-256",
                "aip17p-512",
                "aip17p-1t",
                "aip17pm-256",
                "aip17pm-512",
                "aip17pm-1t",
                "aip17pm-2t",
            ]
            if (!isGuaranteedReturn) return 0

            if (guaranteedReturnModels.includes(model)) {
                return price / 2
            } else {
                return 0
            }
        }

        useEffect(() => {
            setHydrated(true)
        }, [])

        // 💡 초이스 요금제 프로모션 할인 로직 (S26 예외처리 삭제됨)
        function calculateDiscounts(planId: string) {
            const promo100000Plans = [
                "ppllistobj_0994",
                "ppllistobj_0993",
                "ppllistobj_0992",
                "ppllistobj_0863",
                "ppllistobj_0864",
                "ppllistobj_0865",
                "ppllistobj_0850",
                "ppllistobj_0851",
                "ppllistobj_0852",
            ]

            let promo = 0

            if (promo100000Plans.includes(planId)) {
                promo = 80000
            }

            return { promo }
        }

        function calculateInstallment(principal, months, annualInterestRate) {
            if (months === 0) return principal
            const r = annualInterestRate / 100 / 12
            const n = months
            return Math.floor(
                (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
            )
        }

        function getPreorderDiscount(model: string) {
            if (model == "sm-f966nk512") {
                return 0
            } else if (model == "sm-f766nk512") {
                return 0
            } else {
                return 0
            }
        }

        function calculateOrderSheet(store, props) {
            const { register, discount, selectedPlan, device, benefit } = store

            const planPrice = selectedPlan?.price ?? 0
            const planId = selectedPlan?.plan_id ?? ""
            const devicePrice = selectedPlan?.model_price ?? 0
            const isMnp = register === "번호이동" && discount === "공통지원금"

            const migrationSubsidy = isMnp
                ? (selectedPlan?.migration_subsidy ?? 0)
                : 0

            const ktmarketSubsidy =
                store.benefit == "KT마켓 단독혜택" ? store.ktmarketSubsidy : 0
            const preorderDiscount = getPreorderDiscount(device?.model)

            // 💡 프로모션 할인 금액 받아오기
            const { promo: promotionDiscount } = calculateDiscounts(
                selectedPlan?.plan_id
            )

            const isGuaranteedReturn = store.isGuaranteedReturn
            const guaranteedReturnPrice = getGuaranteedReturnPrice(
                device?.model,
                devicePrice,
                isGuaranteedReturn
            )

            // 12-04
            const modelPrices = SPECIAL_PRICES[device?.model] || {
                mnp: 0,
                chg: 0,
            }
            const specialPriceMnp = modelPrices.mnp
            const specialPriceChg = modelPrices.chg

            const selected =
                register === "번호이동" || register === "신규가입"
                    ? specialPriceMnp
                    : register === "기기변경"
                        ? specialPriceChg
                        : 0

            let disclosureSubsidy = 0

            if (discount === "공통지원금") {
                if (register === "신규가입") {
                    disclosureSubsidy = selectedPlan?.disclosure_subsidy ?? 0
                } else {
                    disclosureSubsidy = selectedPlan?.disclosure_subsidy ?? 0
                }
            }

            // 더블스토리지(용량 업그레이드) 지원금 계산 로직
            const doubleStorageModels = [
                "sm-s942nk512",
                "sm-s947nk512",
                "sm-s948nk512",
            ]
            let doubleStorageDiscountValue = 0

            // 37,000원 미만이어도 할인 적용되는 예외 요금제 목록
            const exceptionPlansForDoubleStorage = [
                "ppllistobj_0845", // 5G 주니어 슬림
                "ppllistobj_0535", // 순 골든20
                "ppllistobj_0765", // Y틴 ON
                "ppllistobj_0775", // 시니어 베이직
            ]

            // ✨ "기기변경" 이고 "36개월 미만" 일 때 (할인유형 공시/선약 무관하게 적용)
            if (
                doubleStorageModels.includes(device?.model) &&
                register === "기기변경" &&
                store.installment < 36
            ) {
                // 요금제가 37,000원 이상이거나, 예외 요금제 리스트에 속해있을 경우 적용
                if (
                    planPrice >= 37000 ||
                    exceptionPlansForDoubleStorage.includes(planId)
                ) {
                    doubleStorageDiscountValue = 0
                }
            }

            // 💡 총 단말기 할인 금액
            const totalDeviceDiscountAmount =
                ktmarketSubsidy +
                disclosureSubsidy +
                migrationSubsidy +
                promotionDiscount +
                preorderDiscount +
                guaranteedReturnPrice +
                selected +
                doubleStorageDiscountValue

            const isFreePhone = devicePrice - totalDeviceDiscountAmount <= 0
            const installmentPrincipal = isFreePhone
                ? 0
                : devicePrice - totalDeviceDiscountAmount
            const installmentPayment = isFreePhone
                ? 0
                : calculateInstallment(
                    installmentPrincipal,
                    store.installment,
                    5.9
                )

            const planDiscountAmount =
                discount === "공통지원금" ? 0 : planPrice * 0.25
            const totalPlanDiscountAmount = planDiscountAmount * 24
            const totalMonthPlanPrice = planPrice - planDiscountAmount
            const totalMonthPayment =
                store.installment === 0
                    ? totalMonthPlanPrice
                    : installmentPayment + totalMonthPlanPrice

            const freebie = store.freebie?.title ?? ""
            const monthlyPriceFreebie = store.freebie?.monthly_price ?? 0

            // 추가할인 합계: KT마켓지원금 + 프로모션 + 디바이스 추가지원금 + 미리보상 + 더블스토리지
            const additionalSubsidy =
                ktmarketSubsidy +
                promotionDiscount +
                selected +
                guaranteedReturnPrice +
                preorderDiscount +
                doubleStorageDiscountValue

            return {
                planName: selectedPlan?.name ?? "",
                benefit,
                discount,
                devicePrice,
                installmentPrincipal,
                installmentPayment,
                planPrice,
                totalMonthPlanPrice,
                totalMonthPayment,
                planDiscountAmount,
                totalPlanDiscountAmount,
                ktmarketSubsidy,
                disclosureSubsidy,
                migrationSubsidy,
                additionalSubsidy,
                totalDeviceDiscountAmount,
                promotionDiscount,
                freebie,
                monthlyPriceFreebie,
                preorderDiscount,
                isGuaranteedReturn,
                guaranteedReturnPrice,
                special_price: selected,
                special_price_mnp: specialPriceMnp,
                special_price_chg: specialPriceChg,
                doubleStorageDiscount: doubleStorageDiscountValue,
            }
        }

        const getInstallmentPaymentTitle = (store) => {
            if (store.isGuaranteedReturn) {
                return `월 할부금`
            } else {
                return store.installment > 0
                    ? `월 할부금 (${store.installment}개월)`
                    : "결제 금액"
            }
        }

        useEffect(() => {
            if (!store || !store.plan || !store.device) return

            const result = calculateOrderSheet(store, props)

            setPlanName(result.planName)
            setBenefit(result.benefit)
            setDiscount(result.discount)
            setDevicePrice(result.devicePrice)
            setInstallmentPrincipal(result.installmentPrincipal)
            setInstallmentPayment(
                `${result.installmentPayment.toLocaleString()}원`
            )
            setPlanPrice(result.planPrice)
            setPlanDiscountAmount(result.planDiscountAmount)
            setTotalPlanDiscountAmount(result.totalPlanDiscountAmount)
            setTotalMonthPlanPrice(result.totalMonthPlanPrice)
            setTotalMonthPayment(result.totalMonthPayment)
            setKtmarketSubsidy(result.ktmarketSubsidy)
            setDisclosureSubsidy(result.disclosureSubsidy)
            setMigrationSubsidy(result.migrationSubsidy)
            setAdditionalSubsidy(result.additionalSubsidy)
            setTotalDeviceDiscountAmount(result.totalDeviceDiscountAmount)
            setGuaranteedReturnPrice(result.guaranteedReturnPrice)
            setPreorderDiscount(result.preorderDiscount)
            setPromotionDiscount(result.promotionDiscount)

            setFreebie(result.freebie)
            setMonthlyPriceFreebie(result.monthlyPriceFreebie)
            setIsGuaranteedReturn(result.isGuaranteedReturn)

            setSpecialPriceMnp(result.special_price_mnp)
            setSpecialPriceChg(result.special_price_chg)
            setDoubleStorageDiscount(result.doubleStorageDiscount)

            const noInterestMonthly = result.installmentPrincipal > 0 && store.installment > 0
                ? Math.round(result.installmentPrincipal / store.installment)
                : result.installmentPrincipal
            setInstallmentPaymentNoInterest(noInterestMonthly)
            setTotalMonthPaymentNoInterest(Math.round(noInterestMonthly + (result.totalMonthPlanPrice ?? 0)))

            const data = {
                ...result,
                installmentPayment: `${result.installmentPayment.toLocaleString()}원`,
                formLink,
                installment: store.installment,
                installmentPaymentTitle: getInstallmentPaymentTitle(store),
                installmentPaymentDescription:
                    store.installment > 0
                        ? "분할 상환 수수료 5.9% 포함"
                        : "카드 또는 현금결제",
            }

            sessionStorage.setItem("sheet", JSON.stringify(data))
            localStorage.setItem("kt_sheet", JSON.stringify(data))
        }, [store])

        useEffect(() => {
            if (!store || !store.plan || !store.device) return
            if (store.installmentPrincipal !== installmentPrincipal) {
                setStore({ installmentPrincipal })
            }
        }, [installmentPrincipal])

        // /phone/user-info 라우트 ID 조회
        const getUserInfoRouteId = () => {
            for (const [key, value] of Object.entries(routes)) {
                if ((value as any)?.path === "/phone/user-info") return key
            }
            return null
        }

        // 이동 전 세션 데이터 저장 (sessionStorage + localStorage 이중 저장)
        // sheet도 여기서 강제 저장 — store.plan이 null이어서 useEffect가 스킵된 경우 방어
        const saveOrderSession = () => {
            const storeJson = JSON.stringify(store)
            sessionStorage.setItem("data", storeJson)
            localStorage.setItem("kt_data", storeJson)

            const currentSheet = sessionStorage.getItem("sheet")
            if (currentSheet) {
                localStorage.setItem("kt_sheet", currentSheet)
            }
        }

        // 카카오 간편주문: 세션 저장 후 user-info 페이지로 이동
        const handleKakaoOrder = () => {
            saveOrderSession()
            const routeId = getUserInfoRouteId()
            if (routeId) {
                navigate(routeId, "")
            } else {
                window.location.href = "/phone/user-info"
            }
        }

        if (!hydrated) return null
        return (
            <Component
                {...props}
                plan={planName}
                installment={store.installment}
                installmentPaymentTitle={getInstallmentPaymentTitle(store)}
                installmentPaymentDescription={
                    store.installment > 0
                        ? "분할 상환 수수료 5.9% 포함"
                        : "카드 또는 현금결제"
                }
                benefit={benefit}
                discount={discount}
                preorderDiscount={preorderDiscount}
                devicePrice={devicePrice}
                totalDeviceDiscountAmount={totalDeviceDiscountAmount}
                ktmarketSubsidy={ktmarketSubsidy}
                disclosureSubsidy={disclosureSubsidy}
                additionalSubsidy={additionalSubsidy}
                migrationSubsidy={migrationSubsidy}
                installmentPrincipal={installmentPrincipal}
                installmentPayment={installmentPayment}
                installmentPaymentNoInterest={installmentPaymentNoInterest}
                totalMonthPaymentNoInterest={totalMonthPaymentNoInterest}
                planPrice={planPrice}
                totalPlanDiscountAmount={totalPlanDiscountAmount}
                planDiscountAmount={planDiscountAmount}
                totalMonthPlanPrice={totalMonthPlanPrice}
                totalMonthPayment={Math.round(totalMonthPayment)}
                promotionDiscount={promotionDiscount}
                freebie={freebie}
                monthlyPriceFreebie={monthlyPriceFreebie}
                guaranteedReturnPrice={guaranteedReturnPrice}
                isGuaranteedReturn={isGuaranteedReturn}
                specialPrice={
                    specialPriceMnp > 0 || specialPriceChg > 0
                        ? store.register === "번호이동"
                            ? specialPriceMnp
                            : specialPriceChg
                        : 0
                }
                specialPriceMnp={specialPriceMnp}
                specialPriceChg={specialPriceChg}
                doubleStorageDiscount={doubleStorageDiscount}
                devicePetName={store.device?.pet_name ?? ""}
                deviceImage={store.color?.urls?.[0] ?? store.device?.thumbnail ?? ""}
                deviceColor={store.color?.kr ?? ""}
                deviceCapacity={store.device?.capacity ?? ""}
                formLink={formLink}
                onKakaoOrderClick={handleKakaoOrder}
                onSaveOrderSession={saveOrderSession}
            />
        )
    }
}

// ProductImageCarousel 전용: 이미지 + 색상 선택 + 스켈레톤 통합
export function withCarousel(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [urls, setUrls] = useState([])
        const [colors, setColors] = useState([])

        // 색상 변경 시 이미지 업데이트
        useEffect(() => {
            if (store.color) {
                setUrls(store.color.urls)
            }
        }, [store.color])

        // store.colors 초기화 및 첫 번째 색상 선택
        useEffect(() => {
            if (store.colors && store.colors.length > 0) {
                setColors(store.colors)
            }
        }, [store.colors])

        const handleColorChange = (color) => {
            setStore({ color })
        }

        return (
            <Component
                {...props}
                urls={urls}
                colors={colors}
                activeColor={store.color}
                isLoading={store.isLoading}
                onColorChange={handleColorChange}
            />
        )
    }
}


// ─── withColorCapacity ────────────────────────────────────────────────
// ColorCapacitySelector.tsx 전용 통합 override
// withColor + withCapacity 기능 합산
export function withColorCapacity(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [capacities, setCapacities] = useState([])
        const [colors, setColors] = useState([])

        // 용량 목록 동기화
        useEffect(() => {
            if (store.device && Array.isArray(store.device.capacities)) {
                const formatted = store.device.capacities.map((item, index) => ({
                    capacity: item || "",
                    path: store.device.paths[index] || "",
                }))
                setCapacities(formatted)
            }
        }, [store.device])

        // 색상 목록 동기화 + 첫 색상 자동 선택
        useEffect(() => {
            if (!Array.isArray(store.colors)) return
            setColors(store.colors)
            if (store.colors.length > 0 && !store.color) {
                handleColorChange(store.colors[0])
            }
        }, [store.colors])

        const handleColorChange = (color) => {
            setStore({ color })
            if (store.stocks) {
                const selectedStock = store.stocks?.find(
                    (stock) => stock.colorEn === color.en
                )
                const quantity = selectedStock?.quantity ?? 0
                if (quantity <= 0) {
                    alert("해당 색상은 현재 재고가 없습니다. 입고 알림을 신청해주세요.")
                }
            }
        }

        const handleCapacitySelect = (path: string) => {
            window.history.pushState({}, "", `/phone/${path}`)
            setStore({ currentModelId: path })
        }

        return (
            <Component
                {...props}
                colors={colors}
                capacities={capacities}
                currentModelId={store.currentModelId}
                selectedColor={store.color}
                onColorChange={handleColorChange}
                onCapacitySelect={handleCapacitySelect}
                isLoading={store.isLoading ?? false}
            />
        )
    }
}

// 해당 코드는 초기 통신사의 로직
export function withRegister(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const hasInitializedRef = useRef(false)

        // 신규가입이 가능한 특정 단말기 모델들
        const NEW_SUBSCRIPTION_MODELS = [
            "aip16e-128",
            "aip16e-256",
            "sm-a175nk-kp",
        ]

        // 번호이동을 기본값으로 설정할 기기 모델들
        const numberPortingModels = [
            "aip16-128",
            "aip16-256",
            "aip16-512",
            "aip17-256",
            "aip17-512",
            "aip17p-1t",
            "aip17p-256",
            "aip17p-512",
            "aip17pm-1t",
            "aip17pm-256",
            "aip17pm-2t",
            "aip17pm-512",
            "aipa-1t",
            "aipa-256",
            "aipa-512",
        ]

        // 활성화된 통신사 추론
        const getActiveCarrier = () => {
            if (store.carrier) return store.carrier // DB용 최우선 확인
            if (store.currentCarrier) return store.currentCarrier
            if (store.register === "기기변경") return "KT"
            if (store.register === "번호이동") return "SKT"
            if (store.register === "신규가입") return "신규가입"
            return "KT"
        }

        // 초기 세팅 (최초 1회만 동작)
        useEffect(() => {
            if (store.device && !hasInitializedRef.current) {
                const deviceModel = store.device.model
                let initialRegister = store.register
                let initialCarrier = store.carrier || store.currentCarrier

                if (numberPortingModels.includes(deviceModel)) {
                    initialRegister = "번호이동"
                    initialCarrier = "SKT"
                } else if (deviceModel === "sm-a175nk-kp") {
                    initialRegister = "신규가입"
                    initialCarrier = "신규가입"
                } else if (!initialCarrier && store.register) {
                    initialCarrier = getActiveCarrier()
                }

                // 초기 지원금 계산
                let initialSubsidy = store.ktmarketSubsidy
                if (
                    typeof calcKTmarketSubsidy === "function" &&
                    store.ktmarketSubsidies
                ) {
                    initialSubsidy = calcKTmarketSubsidy({
                        ...store,
                        register: initialRegister,
                    })
                }

                // 💡 DB 저장을 위해 store에 'carrier' 속성 명시적 추가
                setStore({
                    register: initialRegister,
                    currentCarrier: initialCarrier, // UI 상태용
                    carrier: initialCarrier, // DB 저장용
                    ktmarketSubsidy: initialSubsidy,
                })

                hasInitializedRef.current = true
            }
        }, [store.device, store.ktmarketSubsidies])

        // 사용자 클릭 이벤트 핸들러 (최적화: 단일 업데이트)
        const handleValueChange = (carrierId: string) => {
            let nextRegister = store.register

            if (carrierId === "KT") {
                nextRegister = "기기변경"
            } else if (["SKT", "LG U+", "알뜰폰"].includes(carrierId)) {
                nextRegister = "번호이동"
            } else if (carrierId === "신규가입") {
                nextRegister = "신규가입"
            }

            // 변경될 예정인 상태를 기반으로 즉시 지원금 재계산
            let nextSubsidy = store.ktmarketSubsidy
            if (typeof calcKTmarketSubsidy === "function") {
                nextSubsidy = calcKTmarketSubsidy({
                    ...store,
                    register: nextRegister,
                })
            }

            // 💡 스토어 일괄 업데이트 ('carrier' 포함)
            setStore({
                currentCarrier: carrierId,
                carrier: carrierId,
                register: nextRegister,
                ktmarketSubsidy: nextSubsidy,
            })
        }

        // 신규가입 노출 여부 제어
        const currentModel = store.device?.model
        const showNewSub = currentModel
            ? NEW_SUBSCRIPTION_MODELS.includes(currentModel)
            : false

        return (
            <Component
                {...props}
                defaultCarrier={getActiveCarrier()}
                onValueChange={handleValueChange}
                showNewSubscription={showNewSub}
                isLoading={store.isLoading ?? false}
            />
        )
    }
}

export function withInstallmentSection(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        if (store.isGuaranteedReturn) return null
        return (
            <Component
                {...props}
                installment={store.installment}
                isGuaranteedReturn={store.isGuaranteedReturn}
                onInstallmentChange={(v: number) => setStore({ installment: v })}
                isLoading={store.isLoading}
            />
        )
    }
}



// ─── withPlanGrid ─────────────────────────────────────────────────────
// PlanBenefitSelector 전용 Override
// store의 planInfo / selectedPlanInfo 연동 + 카드별 할인 금액 계산
// ──────────────────────────────────────────────────────────────────────
export function withPlanGrid(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        const handlePlanSelect = (plan: { pid: string; title: string; price: number; description?: string; data?: string; tethering?: string; roaming?: string; voiceText?: string }) => {
            const isBenefit =
                plan.price >= 61000 ||
                ["ppllistobj_0778", "ppllistobj_0844", "ppllistobj_0893"].includes(plan.pid)

            const planInfo: PlanInfo = {
                pid: plan.pid,
                title: plan.title,
                price: plan.price,
                description: plan.description ?? "",
                data: plan.data ?? "",
                tethering: plan.tethering ?? "",
                roaming: plan.roaming ?? "",
                voiceText: plan.voiceText ?? "",
                isBenefit,
            }

            setStore({ planInfo, selectedPlanInfo: planInfo })
        }

        // 고정 3개 + 커스텀 요금제에 대해 예상 할인 금액 계산
        // 공통지원금은 DB에서 가져와야 하므로 KT마켓지원금만 계산
        const calcDiscountForPrice = (planPrice: number, pid: string): number => {
            if (!store.ktmarketSubsidies) return 0
            const discount = store.discount === "선택약정할인" ? "plan" : "device"
            const register = store.register === "번호이동" ? "mnp" : store.register === "신규가입" ? "new" : "chg"

            const forceTierByPlanId: Record<string, number> = {
                ppllistobj_0893: 61000, ppllistobj_0778: 61000, ppllistobj_0844: 61000,
                ppllistobj_0845: 37000, ppllistobj_0535: 37000, ppllistobj_0765: 37000, ppllistobj_0775: 37000,
            }
            const forcedTier = forceTierByPlanId[pid]
            const priceTiers = [110000, 100000, 90000, 61000, 37000]

            let key = ""
            if (forcedTier) {
                key = `${discount}_discount_${register}_gte_${forcedTier}`
            } else {
                for (const tier of priceTiers) {
                    if (planPrice >= tier) { key = `${discount}_discount_${register}_gte_${tier}`; break }
                }
                if (!key) key = `${discount}_discount_${register}_lt_37000`
            }
            return store.ktmarketSubsidies[key] ?? 0
        }

        // 고정 3개 PID + 선택된 요금제에 대한 할인 금액 맵
        const GRID_PIDS = ["ppllistobj_0942", "ppllistobj_0808", "ppllistobj_0925"]
        const planPriceMap: Record<string, number> = {
            "ppllistobj_0942": 90000, "ppllistobj_0808": 69000, "ppllistobj_0925": 37000,
        }
        const discountAmounts: Record<string, number> = {}
        for (const pid of GRID_PIDS) {
            discountAmounts[pid] = calcDiscountForPrice(planPriceMap[pid], pid)
        }
        // 현재 선택된 요금제 할인 금액도 포함
        if (store.selectedPlanInfo?.pid && !discountAmounts[store.selectedPlanInfo.pid]) {
            discountAmounts[store.selectedPlanInfo.pid] =
                calcDiscountForPrice(store.selectedPlanInfo.price, store.selectedPlanInfo.pid)
        }

        const handleTabChange = (tab: "기기 할인" | "요금할인") => {
            const discount = tab === "요금할인" ? "선택약정할인" : "공통지원금"
            setStore({ discount })
        }

        return (
            <Component
                {...props}
                isLoading={store.isLoading ?? false}
                selectedPlanPid={store.selectedPlanInfo?.pid ?? ""}
                discountAmounts={discountAmounts}
                onPlanSelect={handlePlanSelect}
                onTabChange={handleTabChange}
                store={store}
                setStore={setStore}
            />
        )
    }
}
