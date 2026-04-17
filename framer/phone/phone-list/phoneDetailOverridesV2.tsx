import type { ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { createClient } from "@supabase/supabase-js"
import React, { useEffect, useState, useMemo, useRef } from "react"
// @ts-ignore
import { Override, useRouter } from "framer"
import {
    calcInstallment,
    getGuaranteedReturnPrice as calcGuaranteedReturnPrice,
    calculatePromotionDiscount,
    getSpecialPrice,
    getInstallmentPaymentTitle as calcInstallmentPaymentTitle,
    getInstallmentPaymentDescription as calcInstallmentPaymentDescription,
} from "https://framer.com/m/priceCalculation-xPMQRv.js@w0xceNaZictgsUnldF5r"

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

// 번호이동을 기본값으로 설정할 기기 모델들
const NUMBER_PORTING_MODELS = [
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
    pid: "ppllistobj_0937",
    title: "(유튜브 프리미엄) 초이스 베이직",
    price: 90000,
    description:
        "유튜브 프리미엄 제공 / 멤버쉽VIP / 만 34세이하 Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB",
    data: "완전 무제한",
    tethering: "40GB",
    roaming: "무제한 (최대100Kbps 속도제어)",
    voiceText: "집/이동전화 무제한/기본제공",
    isBenefit: true,
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

function convertToNumber(priceStr) {
    const noWon = priceStr.replace("원", "")
    const noComma = noWon.replace(/,/g, "")
    return parseInt(noComma, 10)
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
    stocks: [],
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

export function withTempBanner(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        // console.log(store)
        const title = props.model.startsWith("sm-s937nk")
            ? "사전예약기간동안은 512기가만 진행됩니다\n256GB가격으로 512GB를 드려요"
            : "평일 16시 이전 주문 시 당일 택배 출발 ＊무료배송\n오늘 주문하면 케이스+충전기+필름 배송 시 증정"
        return <Component {...props} title={title} />
    }
}

export function withDeviceInfo(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        return (
            <Component
                {...props}
                image={store.color?.urls[0] ?? ""}
                petName={store.device?.pet_name ?? ""}
                color={store.color?.kr ?? ""}
                capacity={store.device?.capacity ?? ""}
                plan={store.selectedPlanInfo?.title ?? ""}
            />
        )
    }
}

export function withMainInfo(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [quantity, setQuantity] = useState(0)

        useEffect(() => {
            if (store.color && store.stocks) {
                const matched = store.stocks.find(
                    (item) => item.colorEn === store.color.en
                )
                const qty = matched ? matched.quantity : 0
                setQuantity(qty)
            }
        }, [store.color, store.stocks])

        // 재고 상태를 boolean으로 계산
        const isSoldOut = quantity <= 0

        return (
            <Component
                {...props}
                quantity={quantity}
                isSoldOut={isSoldOut} // 디자인 컴포넌트에서 Variant 등을 변경할 때 활용 가능
            />
        )
    }
}

export function withPriceComponent(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [installmentPrincipal, setInstallmentPrincipal] = useState(0)
        const discountRate = () => {
            const originPrice = store.device?.price ?? 0
            const finalPrice = store.installmentPrincipal ?? 0

            let discountRate = 0

            if (originPrice > 0) {
                discountRate = ((originPrice - finalPrice) / originPrice) * 100
                if (discountRate > 100) discountRate = 100
                if (discountRate < 0) discountRate = 0 // 역할인 방지
            }

            return Math.round(discountRate)
        }

        return (
            <Component
                {...props}
                discountRate={discountRate()}
                originPrice={store.device?.price ?? 0}
                finalPrice={store.installmentPrincipal}
            />
        )
    }
}

// OrderSummaryCard 전용 override
// finalPrice 카운트 애니메이션 + 월 할부 팝업 + 스켈레톤 통합 + 최종 주문서 모달 props
export function withPriceCard(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const { navigate, routes } = useRouter()

        // ── 계산 (공유 함수 사용) ────────────────────────────────────
        const { register, discount, selectedPlan, device, benefit } = store

        const planPrice = selectedPlan?.price ?? 0
        const planId = selectedPlan?.plan_id ?? ""
        const devicePrice = selectedPlan?.model_price ?? 0
        const isMnp = register === "번호이동" && discount === "공통지원금"
        const migrationSubsidy = isMnp ? (selectedPlan?.migration_subsidy ?? 0) : 0

        const ktmarketSubsidy = store.benefit === "KT마켓 단독혜택" ? store.ktmarketSubsidy : 0
        const promotionDiscount = calculatePromotionDiscount(planId)

        const isGuaranteedReturn = store.isGuaranteedReturn ?? false
        const guaranteedReturnPrice = calcGuaranteedReturnPrice(
            device?.model ?? "", devicePrice, isGuaranteedReturn
        )

        const specialPrice = getSpecialPrice(device?.model ?? "", register, SPECIAL_PRICES)

        let disclosureSubsidy = 0
        if (discount === "공통지원금") {
            disclosureSubsidy = selectedPlan?.disclosure_subsidy ?? 0
        }

        const doubleStorageDiscount = 0
        const preorderDiscount = 0

        const totalDeviceDiscountAmount =
            ktmarketSubsidy + disclosureSubsidy + migrationSubsidy +
            promotionDiscount + preorderDiscount + guaranteedReturnPrice + specialPrice + doubleStorageDiscount

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

        const installmentPaymentNoInterest = installment > 0 ? Math.round(installmentPrincipal / installment) : 0
        const totalMonthPaymentNoInterest = Math.round(installmentPaymentNoInterest + totalMonthPlanPrice)

        const discountRate = (() => {
            if (originPrice <= 0) return 0
            const rate = ((originPrice - installmentPrincipal) / originPrice) * 100
            return Math.round(Math.min(Math.max(rate, 0), 100))
        })()

        const installmentPaymentTitle = calcInstallmentPaymentTitle(isGuaranteedReturn, installment)
        const installmentPaymentDescription = calcInstallmentPaymentDescription(installment)

        const releasedModels = [
            "sm-s942nk",
            "sm-s942nk512",
            "sm-s947nk",
            "sm-s947nk512",
            "sm-s948nk",
            "sm-s948nk512",
        ]

        const getQuantity = () => {
            const colorEn = store.color?.en
            const match = store.stocks?.find((item) => item.colorEn === colorEn)
            return match?.quantity ?? null
        }

        const quantity = getQuantity()
        const hasStockData =
            Array.isArray(store.stocks) &&
            store.stocks.length > 0 &&
            !!store.color?.en
        const isSoldOut = hasStockData && quantity !== null ? quantity <= 0 : false

        const isSamsungExternalPreorder = (model) => {
            if (releasedModels.includes(model)) return false
            return typeof S26_MODLE !== "undefined" && S26_MODLE.includes(model)
        }

        const getCtaTitle = () => {
            if (isSoldOut) return "입고 알림"

            const currentModel = store.device?.model

            if (isSamsungExternalPreorder(currentModel)) return "신청하기"
            if (
                typeof Iphone17e_MODEL !== "undefined" &&
                Iphone17e_MODEL.includes(currentModel)
            )
                return "신청하기"
            if (preorderModel.includes(currentModel)) return "신청하기"

            return "신청하기"
        }

        const getRouteId = (allRoutes, path) => {
            for (const [key, value] of Object.entries(allRoutes)) {
                if ((value as any)?.path === path) return key
            }
            for (const [key, value] of Object.entries(allRoutes)) {
                if ((value as any)?.path === "/") return key
            }
            return ""
        }

        const handleApplyClick = () => {
            const storeJson = JSON.stringify(store)
            sessionStorage.removeItem("data")
            sessionStorage.setItem("data", storeJson)
            localStorage.setItem("kt_data", storeJson)

            const path = isSoldOut
                ? "/phone/device-notification"
                : "/phone/user-info"
            const routeId = getRouteId(routes, path)

            navigate(routeId, "")
        }

        return (
            <Component
                {...props}
                finalPrice={installmentPrincipal}
                originPrice={originPrice}
                totalDeviceDiscountAmount={totalDeviceDiscountAmount}
                discountRate={discountRate}
                monthlyPayment={monthlyPayment}
                installment={installment}
                planPrice={planPrice}
                planDiscountAmount={planDiscountAmount}
                discount={discount ?? "공통지원금"}
                isLoading={store.isLoading ?? false}
                formLink={device?.form_link ?? ""}
                devicePetName={device?.pet_name ?? ""}
                ctaTitle={getCtaTitle()}
                onApplyClick={handleApplyClick}
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
                installmentPaymentNoInterest={installmentPaymentNoInterest}
                totalMonthPaymentNoInterest={totalMonthPaymentNoInterest}
            />
        )
    }
}

export function withConfirmDeviceInfo(Component): ComponentType {
    return (props) => {
        const [data, setData] = useState(null)

        useEffect(() => {
            const storedData = sessionStorage.getItem("data") ?? null
            const parsedData = storedData ? JSON.parse(storedData) : null
            setData(parsedData)
        }, [])

        return (
            <Component
                {...props}
                image={data?.color?.urls[0] ?? ""}
                petName={data?.device?.pet_name ?? ""}
                color={data?.color?.kr ?? ""}
                capacity={""}
                plan={data?.selectedPlan?.name ?? ""}
            />
        )
    }
}

// 0313 금
export function withConfirmOrderSheet(Component): ComponentType {
    return (props) => {
        const [data, setData] = useState(null)
        useEffect(() => {
            const storedData = sessionStorage.getItem("sheet") ?? null
            const parsedData = storedData ? JSON.parse(storedData) : null
            setData(parsedData)
        }, [])

        return (
            <Component
                {...props}
                plan={data?.planName}
                installmentPaymentTitle={data?.installmentPaymentTitle}
                installmentPaymentDescription={
                    data?.installmentPaymentDescription
                }
                installment={data?.installment}
                benefit={data?.benefit}
                discount={data?.discount}
                devicePrice={data?.devicePrice}
                totalDeviceDiscountAmount={data?.totalDeviceDiscountAmount}
                ktmarketSubsidy={data?.ktmarketSubsidy}
                disclosureSubsidy={data?.disclosureSubsidy}
                additionalSubsidy={data?.additionalSubsidy}
                migrationSubsidy={data?.migrationSubsidy}
                installmentPrincipal={data?.installmentPrincipal}
                installmentPayment={data?.installmentPayment}
                installmentPaymentNoInterest={data?.installmentPaymentNoInterest}
                totalMonthPaymentNoInterest={data?.totalMonthPaymentNoInterest}
                planPrice={data?.planPrice}
                totalPlanDiscountAmount={data?.totalPlanDiscountAmount}
                planDiscountAmount={data?.planDiscountAmount}
                totalMonthPlanPrice={data?.totalMonthPlanPrice}
                totalMonthPayment={data?.totalMonthPayment}
                promotionDiscount={data?.promotionDiscount}
                freebie={data?.freebie}
                monthlyPriceFreebie={data?.monthlyPriceFreebie}
                isGuaranteedReturn={data?.isGuaranteedReturn}
                guaranteedReturnPrice={data?.guaranteedReturnPrice}
                // 12-04 수정
                specialPrice={data?.special_price}
                specialPriceMnp={data?.special_price_mnp}
                specialPriceChg={data?.special_price_chg}
                doubleStorageDiscount={data?.doubleStorageDiscount}
            />
        )
    }
}

export function withConfirmTotalPaymentOrderSheet(Component): ComponentType {
    return (props) => {
        const [data, setData] = useState(null)
        useEffect(() => {
            const storedData = sessionStorage.getItem("sheet") ?? null
            // console.log(storedData)
            const parsedData = storedData ? JSON.parse(storedData) : null
            // console.log(parsedData)
            setData(parsedData)
        }, [])

        return (
            <Component
                {...props}
                totalPayment={data?.totalMonthPayment}
                planPayment={data?.totalMonthPlanPrice}
                devicePayment={
                    data?.totalMonthPayment - data?.totalMonthPlanPrice
                }
            />
        )
    }
}

export function withOrderSheetFreebie(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [data, setData] = useState(null)

        const sections = [
            "ppllistobj_0865",
            "ppllistobj_0864",
            "ppllistobj_0863",
            "ppllistobj_0850",
            "ppllistobj_0851",
            "ppllistobj_0852",
            "ppllistobj_0994",
            "ppllistobj_0993",
            "ppllistobj_0992",
        ]

        const pid = store.selectedPlanInfo?.pid ?? ""

        useEffect(() => {
            const storedData = sessionStorage.getItem("sheet") ?? null
            const parsedData = storedData ? JSON.parse(storedData) : null
            setData(parsedData)
        }, [])

        if (!pid || !sections.includes(pid)) return null

        return (
            <Component
                {...props}
                freebie={data?.freebie?.title ?? "없음"}
                monthlyPrice={data?.freebie?.monthly_price ?? 0}
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
        const [youtubePremiumBonus, setYoutubePremiumBonus] = useState(0)

        useEffect(() => {
            setHydrated(true)
        }, [])

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

            // YouTube 프리미엄 3종 추가지원금 3만원 — 표시용으로만 분리 (계산은 ktmarketSubsidy에 포함)
            const YOUTUBE_PIDS = new Set(["ppllistobj_0937", "ppllistobj_0938", "ppllistobj_0939"])
            const selectedPid = store.selectedPlanInfo?.pid ?? ""
            const youtubePremiumBonus = (store.benefit === "KT마켓 단독혜택" && YOUTUBE_PIDS.has(selectedPid)) ? 30000 : 0

            const preorderDiscount = 0

            const promotionDiscount = calculatePromotionDiscount(
                selectedPlan?.plan_id
            )

            const isGuaranteedReturn = store.isGuaranteedReturn
            const guaranteedReturnPrice = calcGuaranteedReturnPrice(
                device?.model,
                devicePrice,
                isGuaranteedReturn
            )

            const modelPrices = SPECIAL_PRICES[device?.model] || {
                mnp: 0,
                chg: 0,
            }
            const specialPriceMnp = modelPrices.mnp
            const specialPriceChg = modelPrices.chg

            const selected = getSpecialPrice(device?.model ?? "", register, SPECIAL_PRICES)

            let disclosureSubsidy = 0
            if (discount === "공통지원금") {
                disclosureSubsidy = selectedPlan?.disclosure_subsidy ?? 0
            }

            const doubleStorageDiscountValue = 0

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
                : calcInstallment(
                    installmentPrincipal,
                    store.installment,
                    5.9
                )

            const planDiscountAmount =
                discount === "공통지원금" ? 0 : planPrice * 0.25
            const totalPlanDiscountAmount = planDiscountAmount * (store.installment > 0 ? store.installment : 0)
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
                youtubePremiumBonus,
            }
        }

        const getInstallmentPaymentTitle = (store) => {
            return calcInstallmentPaymentTitle(store.isGuaranteedReturn, store.installment)
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
            setYoutubePremiumBonus(result.youtubePremiumBonus)

            const noInterestMonthly = result.installmentPrincipal > 0 && store.installment > 0
                ? Math.round(result.installmentPrincipal / store.installment)
                : 0  // 일시불(installment=0)이면 월 기기값 없음
            setInstallmentPaymentNoInterest(noInterestMonthly)
            setTotalMonthPaymentNoInterest(Math.round(noInterestMonthly + (result.totalMonthPlanPrice ?? 0)))

            const data = {
                ...result,
                installmentPayment: `${result.installmentPayment.toLocaleString()}원`,
                installmentPaymentNoInterest: noInterestMonthly,
                totalMonthPaymentNoInterest: Math.round(noInterestMonthly + (result.totalMonthPlanPrice ?? 0)),
                formLink,
                installment: store.installment,
                installmentPaymentTitle: getInstallmentPaymentTitle(store),
                installmentPaymentDescription: calcInstallmentPaymentDescription(store.installment),
            }

            sessionStorage.setItem("sheet", JSON.stringify(data))
            localStorage.setItem("kt_sheet", JSON.stringify(data))
        }, [
            store.plan,
            store.device,
            store.selectedPlan,
            store.installment,
            store.discount,
            store.register,
            store.benefit,
            store.ktmarketSubsidy,
            store.ktmarketSubsidies,
            store.isGuaranteedReturn,
        ])

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

        const getConfirmRouteId = () => {
            for (const [key, value] of Object.entries(routes)) {
                if ((value as any)?.path === "/phone/confirm") return key
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

        const handlePhoneOrder = () => {
            saveOrderSession()
            const routeId = getConfirmRouteId()
            if (routeId) {
                navigate(routeId, "")
            } else {
                window.location.href = "/phone/confirm"
            }
        }

        const handleRestockOrder = () => {
            saveOrderSession()
            const notificationRouteId = Object.entries(routes).find(
                ([, value]) => (value as any)?.path === "/phone/device-notification"
            )?.[0]

            if (notificationRouteId) {
                navigate(notificationRouteId, "")
            } else {
                window.location.href = "/phone/device-notification"
            }
        }

        const hasStockData =
            Array.isArray(store.stocks) &&
            store.stocks.length > 0 &&
            !!store.color?.en
        const selectedStock = hasStockData
            ? store.stocks.find((stock) => stock.colorEn === store.color.en)
            : null
        const isSoldOut = hasStockData && selectedStock
            ? (selectedStock.quantity ?? 0) <= 0
            : false

        if (!hydrated) return null
        return (
            <Component
                {...props}
                plan={planName}
                installment={store.installment}
                installmentPaymentTitle={getInstallmentPaymentTitle(store)}
                installmentPaymentDescription={calcInstallmentPaymentDescription(store.installment)}
                benefit={benefit}
                discount={discount}
                preorderDiscount={preorderDiscount}
                devicePrice={devicePrice}
                totalDeviceDiscountAmount={totalDeviceDiscountAmount}
                ktmarketSubsidy={ktmarketSubsidy - youtubePremiumBonus}
                youtubePremiumBonus={youtubePremiumBonus}
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
                isSoldOut={isSoldOut}
                onKakaoOrderClick={handleKakaoOrder}
                onPhoneClick={handlePhoneOrder}
                onRestockClick={handleRestockOrder}
                onSaveOrderSession={saveOrderSession}
            />
        )
    }
}

export function withPlanBasicNotice(Component): ComponentType {
    return (props) => {
        const [store] = useStore()

        if (!store?.selectedPlan || !store?.device) {
            return <Component {...props} officialMonthlyPrice={0} />
        }

        const planPrice = store.selectedPlan?.price ?? 0
        const modelPrice = store.selectedPlan?.model_price ?? 0
        const discountType = store.discount ?? "공통지원금"
        const register = store.register ?? "기기변경"
        const planId = store.selectedPlan?.plan_id ?? ""
        const disclosureSubsidy =
            discountType === "공통지원금"
                ? (store.selectedPlan?.disclosure_subsidy ?? 0)
                : 0
        const migrationSubsidy =
            register === "번호이동" && discountType === "공통지원금"
                ? (store.selectedPlan?.migration_subsidy ?? 0)
                : 0
        const ktmarketSubsidy =
            store.benefit === "KT마켓 단독혜택" ? store.ktmarketSubsidy ?? 0 : 0

        const promotionDiscount = calculatePromotionDiscount(planId)

        const guaranteedReturnPrice = calcGuaranteedReturnPrice(
            store.device?.model ?? "", modelPrice, store.isGuaranteedReturn
        )

        const specialPrice = getSpecialPrice(store.device?.model ?? "", register, SPECIAL_PRICES)

        const doubleStorageDiscount = 0

        const totalDeviceDiscountAmount =
            ktmarketSubsidy +
            disclosureSubsidy +
            migrationSubsidy +
            promotionDiscount +
            guaranteedReturnPrice +
            specialPrice +
            doubleStorageDiscount

        const officialPrincipal = Math.max(
            0,
            modelPrice - (totalDeviceDiscountAmount - ktmarketSubsidy)
        )
        const officialPlanDiscount =
            discountType === "공통지원금" ? 0 : planPrice * 0.25
        const officialPlanPrice = planPrice - officialPlanDiscount
        const officialDeviceMonthly =
            (store.installment ?? 24) === 0
                ? 0
                : calcInstallment(officialPrincipal, store.installment ?? 24, 5.9)
        const officialMonthlyPrice = Math.round(
            officialDeviceMonthly + officialPlanPrice
        )

        return (
            <Component
                {...props}
                officialMonthlyPrice={officialMonthlyPrice}
            />
        )
    }
}

export function withPlanChoiceNotice(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const selectedPlanPid = store.selectedPlanInfo?.pid ?? ""

        return <Component {...props} pplId={selectedPlanPid} />
    }
}

export function withDetailSection(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [height, setHeight] = useState("1800px")

        useEffect(() => {
            if (store.isExpanded) {
                setHeight("auto")
            } else {
                setHeight("1800px")
            }
        }, [store.isExpanded])

        return (
            <Component
                {...props}
                style={{
                    ...(props.style || {}),
                    height,
                    overflow: "hidden",
                }}
            />
        )
    }
}

export function withReadMoreButton(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        const handleOnClick = () => {
            setStore({ isExpanded: !store.isExpanded })
        }

        return (
            <Component
                {...props}
                title={store.isExpanded ? "상세정보 접기" : "상세정보 펼처보기"}
                onClick={handleOnClick}
            />
        )
    }
}

export function withBenefitCategoryTabs(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        const handleTabClick = (key: string, sectionId: string, offset: number = 0) => {
            const doScroll = () => {
                if (typeof window === "undefined") return false
                const el = document.getElementById(sectionId)
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - offset
                    window.scrollTo({ top, behavior: "smooth" })
                    return true
                }
                return false
            }

            const retryScroll = (attempt = 0) => {
                const done = doScroll()
                if (done || attempt >= 12) return
                window.setTimeout(() => retryScroll(attempt + 1), 120)
            }

            if (!store.isExpanded) {
                setStore({ isExpanded: true })
                // 펼침 이후 레이아웃이 실제 반영될 때까지 재시도
                window.setTimeout(() => retryScroll(0), 180)
            } else {
                retryScroll(0)
            }
        }

        return <Component {...props} onTabClick={handleTabClick} />
    }
}

export function withPhoneDetail(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [loading, setLoading] = useState(true)
        const [isFirst, setIsFirst] = useState(true)
        const [error, setError] = useState(null)
        const [hydrated, setHydrated] = useState(false)

        // ✅ 단종 팝업 상태 추가
        const [discontinuedInfo, setDiscontinuedInfo] = useState(null)

        const DB = {
            DEVICES: "devices",
            DEVICE_PLANS_CHG: "device_plans_chg",
            DEVICE_PLANS_MNP: "device_plans_mnp",
            DEVICE_PLANS: "device_plans",
            KTMARKET_SUBSIDY: "ktmarket_subsidy",
        }

        const lastSegment =
            typeof window !== "undefined"
                ? window.location.pathname.split("/").filter(Boolean).pop() || ""
                : ""

        const createColors = ({
            category,
            colors_kr,
            colors_en,
            colors_code,
            images,
        }) =>
            colors_kr.map((krColor, index) => {
                const enColor = colors_en[index]
                const codeColor = colors_code[index]
                const urls =
                    images[enColor]?.map(
                        (imageKey) =>
                            `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${category}/${enColor}/${imageKey}.png`
                    ) || []

                return {
                    kr: krColor,
                    en: enColor,
                    code: codeColor,
                    isSoldOut: false,
                    urls,
                }
            })

        const fetchKTmarketSubsidy = async (modelId: string) => {
            try {
                const { data, error } = await supabase
                    .from(DB.KTMARKET_SUBSIDY)
                    .select("*")
                    .eq("model", modelId)

                if (error) throw error
                setStore({
                    ktmarketSubsidies: data[0],
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setIsFirst(false)
            }
        }

        const getPlanDB = (registerKr) => {
            switch (registerKr) {
                case "번호이동":
                    return "device_plans_mnp"

                case "신규가입": // 01-26
                    return "device_plans_new"

                default:
                    return "device_plans_chg"
            }
        }

        const fetchInitPlanData = async (planId: string, planType: string, modelId: string) => {
            try {
                const { data, error } = await supabase
                    .from(getPlanDB(planType))
                    .select("*")
                    .eq("plan_id", planId)
                    .eq("model", modelId)

                if (error) throw error
                await fetchKTmarketSubsidy(modelId)
                const planInfo = getPlanInfoByPid(data[0].plan_id)
                setStore({
                    plan: data[0],
                    planInfo: planInfo,
                    selectedPlan: data[0],
                    selectedPlanInfo: planInfo,
                })
            } catch (err) {
                setError(err.message)
            }
        }

        const fetchMainPlanData = async (planId: string, planType: string, modelId: string) => {
            try {
                const { data, error } = await supabase
                    .from(getPlanDB(planType))
                    .select("*")
                    .eq("plan_id", planId)
                    .eq("model", modelId)

                if (error) throw error
                setStore({
                    plan: data[0],
                    selectedPlan: data[0],
                    selectedPlanInfo: store.planInfo,
                })
            } catch (err) {
                setError(err.message)
            }
        }

        const fetchSelectedPlanData = async (
            plan_id: string,
            planType: string,
            modelId: string
        ) => {
            try {
                const { data, error } = await supabase
                    .from(getPlanDB(planType))
                    .select("*")
                    .eq("plan_id", plan_id)
                    .eq("model", modelId)

                if (error) throw error
                setStore({
                    selectedPlan: data[0],
                })
            } catch (err) {
                setError(err.message)
            }
        }

        const isIphone16eModel = (model: string) => {
            return ["aip16e-128", "aip16e-256", "aip16e-512"].includes(model)
        }

        const fetchDeviceData = async (modelId: string) => {
            setStore({ isLoading: true })
            try {
                const { data, error } = await supabase
                    .from(DB.DEVICES)
                    .select("*")
                    .eq("model", modelId)

                if (error) throw error

                const device = data[0]
                const colors = createColors(device)

                const params = new URLSearchParams(window.location.search)
                const queryPlanId = params.get("plan")

                let initialPlanId: string

                if (queryPlanId) {
                    initialPlanId = queryPlanId
                } else if (isIphone16eModel(device.model)) {
                    initialPlanId = Iphone16ePlanInfo.pid
                } else {
                    initialPlanId = device.plan_id
                }

                // ── 번호이동 vs 기기변경 중 더 저렴한 쪽을 기본값으로 설정 ──
                const [mnpRes, chgRes] = await Promise.all([
                    supabase
                        .from("device_plans_mnp")
                        .select("price, migration_subsidy")
                        .eq("plan_id", initialPlanId)
                        .eq("model", modelId)
                        .maybeSingle(),
                    supabase
                        .from("device_plans_chg")
                        .select("price")
                        .eq("plan_id", initialPlanId)
                        .eq("model", modelId)
                        .maybeSingle(),
                ])
                // 번이 실질 단말가 = price - migration_subsidy
                const mnpEffective = mnpRes.data
                    ? (mnpRes.data.price ?? 0) - (mnpRes.data.migration_subsidy ?? 0)
                    : null
                const chgEffective = chgRes.data ? (chgRes.data.price ?? 0) : null

                let bestRegister = store.register
                if (mnpEffective !== null && chgEffective !== null) {
                    bestRegister = mnpEffective <= chgEffective ? "번호이동" : "기기변경"
                } else if (mnpEffective !== null) {
                    bestRegister = "번호이동"
                } else if (chgEffective !== null) {
                    bestRegister = "기기변경"
                }
                // numberPortingModels는 가격 비교 결과와 무관하게 항상 번호이동 기준
                if (NUMBER_PORTING_MODELS.includes(modelId)) {
                    bestRegister = "번호이동"
                }
                setStore({ register: bestRegister })

                await fetchInitPlanData(initialPlanId, bestRegister, modelId)

                setStore({
                    device,
                    colors,
                    color: colors[0],
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
                setStore({ isLoading: false })
            }
        }

        // ✅ 단종 팝업 → SPA 방식으로 모델 이동
        const handleDiscontinuedRedirect = () => {
            if (!discontinuedInfo) return
            const currentPath = window.location.pathname
            const newPath = lastSegment
                ? currentPath.replace(lastSegment, discontinuedInfo.targetModel)
                : `/phone/${discontinuedInfo.targetModel}`
            window.history.pushState({}, "", newPath)
            setStore({ currentModelId: discontinuedInfo.targetModel })
        }

        // currentModelId 초기화: URL에서 파싱 후 store에 저장
        useEffect(() => {
            if (typeof window === "undefined") return
            if (!store.currentModelId) {
                const pathSegment = lastSegment
                setStore({ currentModelId: pathSegment })
            }
        }, [lastSegment, store.currentModelId])

        // currentModelId 변경 시: 팝업/단종 체크 + 데이터 재호출 (SPA 핵심)
        useEffect(() => {
            const modelId = store.currentModelId || lastSegment
            if (!modelId) return

            const pathname =
                typeof window !== "undefined" ? window.location.pathname : ""

            // isGuaranteedReturn 초기화 (해당 모델만)
            if (modelId === "sm-f966nk512" || modelId === "sm-f766nk512") {
                const params = new URLSearchParams(window.location.search)
                const isGuaranteedReturnValue =
                    params.get("isGuaranteedReturn") ?? "0"
                if (isGuaranteedReturnValue === "1") {
                    setStore({ isGuaranteedReturn: true })
                }
            }

            // ✅ 단종 모델 체크
            const obsoleteIphones = [
                "aip16-128",
                "aip16-256",
                "aip16-512",
                "aip16p-128",
                "aip16p-256",
                "aip16p-512",
                "aip16pm-256",
                "aip16pm-512",
                "aip16ps-128",
                "aip16ps-256",
                "aip16ps-512",
                "aip15-512",
                "aip15p-128",
                "aip15p-512",
                "aip15pm-256",
                "aip15pm-512",
                "aip15ps-128",
                "aip15ps-256",
                "aip15ps-512",
                "aip13-128",
            ]
            const obsoleteGalaxys = [
                "sm-s931nk",
                "sm-s931nk512",
                "sm-s721nk",
                "sm-s928nk",
            ]

            if (obsoleteIphones.includes(modelId)) {
                setDiscontinuedInfo({
                    title: "단종된 모델입니다",
                    description:
                        "고객님께서 찾으시는 기종은 단종되었습니다.\n더 나은 성능과 최신 기능을 갖춘 모델로 안내해 드리겠습니다.",
                    targetModel: "aip17-256",
                    buttonText: "아이폰17 보러가기",
                })
            } else if (obsoleteGalaxys.includes(modelId)) {
                setDiscontinuedInfo({
                    title: "단종된 모델입니다",
                    description:
                        "고객님께서 찾으시는 기종은 단종되었습니다.\n더 나은 성능과 최신 기능을 갖춘 모델로 안내해 드리겠습니다.",
                    targetModel: "sm-s942nk",
                    buttonText: "최신 기종 보러가기",
                })
            } else {
                setDiscontinuedInfo(null)
            }

            // 디바이스 데이터 재호출 (스켈레톤 ON → fetch → OFF)
            fetchDeviceData(modelId)
        }, [lastSegment, store.currentModelId])

        useEffect(() => {
            if (!isFirst) {
                const modelId = store.currentModelId || ""
                if (store.selectedPlanInfo)
                    fetchSelectedPlanData(
                        store.selectedPlanInfo.pid,
                        store.register,
                        modelId
                    )
            }
        }, [store.selectedPlanInfo])

        useEffect(() => {
            if (!isFirst) {
                const modelId = store.currentModelId || ""
                if (store.planInfo)
                    fetchMainPlanData(store.planInfo.pid, store.register, modelId)
            }
        }, [store.planInfo])

        useEffect(() => {
            if (!isFirst) {
                const modelId = store.currentModelId || ""
                if (store.planInfo)
                    fetchMainPlanData(store.planInfo.pid, store.register, modelId)
            }
        }, [store.register])

        useEffect(() => {
            const savedScrollPosition = sessionStorage.getItem("scrollPosition")
            if (savedScrollPosition) {
                setTimeout(() => {
                    window.scrollTo(0, parseInt(savedScrollPosition, 10))
                }, 50)
            }
        }, [])

        useEffect(() => {
            setHydrated(true)
        }, [])

        if (!hydrated) return null

        return (
            <>
                {/* 원래 PhoneDetail 화면 */}
                <Component {...props} />

                {/* ✅ iOS 스타일 (Glassmorphism) 단종 안내 팝업 */}
                {discontinuedInfo && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0, 0, 0, 0.4)", // 외부 화면 약간 어둡게
                            zIndex: 10000,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 20px",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "340px",
                                // 💡 핵심 변경 사항: iPhone 스타일 투명 블러 (Glassmorphism)
                                backgroundColor: "rgba(255, 255, 255, 0.7)", // 반투명 흰색 배경
                                backdropFilter: "blur(24px) saturate(150%)", // 배경 흐림 및 채도 증가
                                WebkitBackdropFilter:
                                    "blur(24px) saturate(150%)", // iPhone(Safari) 브라우저 호환성
                                border: "1px solid rgba(255, 255, 255, 0.5)", // 투명도 있는 테두리로 유리 질감 극대화

                                borderRadius: "24px",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                                padding: "36px 24px 28px",
                                textAlign: "center",
                                boxSizing: "border-box",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: "22px",
                                    fontWeight: 800,
                                    marginBottom: "16px",
                                    color: "#24292E",
                                    letterSpacing: "-0.5px",
                                }}
                            >
                                {discontinuedInfo.title}
                            </h3>

                            {/* 은은한 가로 구분선 */}
                            <div
                                style={{
                                    width: "100%",
                                    height: "1px",
                                    backgroundColor: "rgba(229, 232, 235, 0.5)", // 투명도에 맞춰 선도 반투명 처리
                                    marginBottom: "20px",
                                }}
                            ></div>

                            <p
                                style={{
                                    fontSize: "15px",
                                    lineHeight: 1.6,
                                    color: "#3F4750",
                                    marginBottom: "32px",
                                    whiteSpace: "pre-line",
                                    wordBreak: "keep-all",
                                    letterSpacing: "-0.3px",
                                }}
                            >
                                {discontinuedInfo.description}
                            </p>

                            <button
                                onClick={handleDiscontinuedRedirect}
                                style={{
                                    width: "100%",
                                    height: "54px",
                                    backgroundColor: "#2B66F6",
                                    color: "#FFFFFF",
                                    border: "none",
                                    borderRadius: "999px",
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    letterSpacing: -0.3,
                                    lineHeight: 1.5,
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                {discontinuedInfo.buttonText}
                            </button>
                        </div>
                    </div>
                )}

            </>
        )
    }
}

export function withThumbnail(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [urls, setUrls] = useState([])
        useEffect(() => {
            if (store.color) {
                setUrls(store.color.urls)
            }
        }, [store.color])

        return <Component {...props} urls={urls} />
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
                if (selectedStock && selectedStock.quantity <= 0) {
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

export function withStock(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [colors, setColors] = useState([])
        const [quantity, setQuantity] = useState(0)

        // 0320 금요일 수정
        useEffect(() => {
            if (
                Array.isArray(store.colors) &&
                Array.isArray(store.stocks) &&
                store.colors.length === store.stocks.length
            ) {
                if (store.color) {
                    const selectedColor = store.color.en
                    const selectedStock = store.stocks?.find(
                        (stock) => stock.colorEn === selectedColor
                    )

                    const quantity = selectedStock?.quantity ?? 0
                    setQuantity(quantity)
                }
            }
        }, [store.color, store.stocks])

        const handleColorChange = (color) => { }

        return <Component {...props} quantity={quantity} />
    }
}

export function withStockComponent(Component): ComponentType {
    return (props) => {
        const [, setStore] = useStore()
        const { quantity, colorEn, colorKr } = props

        useEffect(() => {
            setStore((prevStore) => {
                const currentStocks = Array.isArray(prevStore.stocks)
                    ? prevStore.stocks
                    : []

                const nextStock = { quantity, colorEn, colorKr }
                const existingIndex = currentStocks.findIndex(
                    (stock) => stock.colorEn === colorEn
                )

                const updatedStocks =
                    existingIndex >= 0
                        ? currentStocks.map((stock, index) =>
                            index === existingIndex ? nextStock : stock
                        )
                        : [...currentStocks, nextStock]

                return {
                    ...prevStore,
                    stocks: updatedStocks,
                }
            })
        }, [colorEn, colorKr, quantity, setStore])

        return <Component {...props} />
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

        const numberPortingModels = NUMBER_PORTING_MODELS

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

                // AI 맞춤 추천 데이터가 있으면 우선 적용
                try {
                    const aiRaw = typeof window !== "undefined"
                        ? window.sessionStorage.getItem("kt_ai_recommend")
                        : null
                    if (aiRaw) {
                        const aiData = JSON.parse(aiRaw)
                        if (aiData.carrier && aiData.register) {
                            initialCarrier = aiData.carrier
                            initialRegister = aiData.register
                        }
                    }
                } catch { }

                // 모델별 강제 설정 (AI 추천보다 우선)
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

export function withSelectedPlan(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        const promotionPlan = [
            "ppllistobj_0865",
            "ppllistobj_0864",
            "ppllistobj_0863",
            "ppllistobj_0850",
            "ppllistobj_0851",
            "ppllistobj_0852",
            "ppllistobj_0994",
            "ppllistobj_0993",
            "ppllistobj_0992",
        ]

        const handleOnClick = () => {
            setStore({
                selectedPlan: store.plan,
                selectedPlanInfo: store.planInfo,
            })
        }
        useEffect(() => {
            const pid = store.planInfo?.pid
            if (!pid || !promotionPlan.includes(pid)) {
                setStore({ freebie: null })
            }
        }, [store.planInfo, store.selectedPlanInfo])

        if (!store.planInfo) return null
        return (
            <Component
                {...props}
                onClick={handleOnClick}
                pid={store.planInfo?.pid}
                title={store.planInfo?.title}
                price={store.planInfo?.price}
                description={store.planInfo?.description}
                data={store.planInfo?.data}
                tethering={store.planInfo?.tethering}
                roaming={store.planInfo?.roaming}
                voiceText={store.planInfo?.voiceText}
                isBenefit={false}
                variant={
                    (store.selectedPlanInfo?.pid ?? "") == store.planInfo.pid
                        ? "active"
                        : "inactive"
                }
            />
        )
    }
}


export function withPlan(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [variant, setVariant] = useState(
            store.selectedPlanInfo.pid === props.pid ? "active" : "inactive"
        )

        const handleOnClick = (event) => {
            event.preventDefault()
            const planInfo = mapToPlanInfo(props)
            setStore({ planInfo: planInfo, selectedPlanInfo: planInfo })
        }

        if (!store.planInfo) return null

        return (
            <Component
                {...props}
                variant={
                    store.planInfo.pid == props.pid ? "active" : "inactive"
                }
                onClick={handleOnClick}
                isBenefit={false}
            />
        )
    }
}

export function withSubPlan(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        function mapToPlanInfo(data: any): PlanInfo {
            const isBenefit =
                data.price >= 61000 ||
                [
                    "ppllistobj_0778",
                    "ppllistobj_0844",
                    "ppllistobj_0893",
                ].includes(data.pid)

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

        useEffect(() => {
            const pid = store.selectedPlanInfo?.pid ?? ""
        }, [store.selectedPlanInfo])

        const handleOnClick = (event) => {
            event.preventDefault()
            // console.log(props)
            setStore({ selectedPlanInfo: mapToPlanInfo(props), freebie: null })
        }

        if (store.planInfo?.pid == props.pid) return null

        return (
            <Component
                {...props}
                variant={
                    (store.selectedPlanInfo?.pid ?? "") === props.pid
                        ? "active"
                        : "inactive"
                }
                onClick={handleOnClick}
                isBenefit={false}
            />
        )
    }
}

export function withPlanButton(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [title, setTitle] = useState(store.planInfo?.title ?? "")
        useEffect(() => {
            setTitle(store.planInfo?.title + " 선택하기" ?? "알 수 없음")
        }, [store.planInfo])

        return <Component {...props} title={title} />
    }
}

export function withPlanInfo(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        useEffect(() => {
            // console.log("Current capacity:", store)
        }, [store.planInfo])

        return (
            <Component
                {...props}
                planName={store.plan?.name ?? ""}
                price={store.plan?.price ?? 0}
            />
        )
    }
}


function discount_en(discount_kr) {
    switch (discount_kr) {
        case "선택약정할인":
            return "plan"
        case "공통지원금":
            return "device"
        default:
            return null
    }
}

function register_en(register_kr) {
    switch (register_kr) {
        case "번호이동":
            return "mnp"
        case "기기변경":
            return "chg"
        case "신규가입":
            return "new"
        default:
            return null
    }
}

const YOUTUBE_PLAN_PIDS_SET = new Set(["ppllistobj_0937", "ppllistobj_0938", "ppllistobj_0939"])

function calcKTmarketSubsidy(store): number {
    const discount = discount_en(store.discount)
    const register = register_en(store.register)
    const planPrice = store.selectedPlanInfo?.price ?? 0
    const planId = store.selectedPlanInfo?.pid
    const data = store.ktmarketSubsidies

    if (planPrice <= 0) return 0

    if (!data || typeof data !== "object") {
        console.warn("KT 마켓 지원금 데이터가 비정상입니다.")
        return 0
    }

    const forceTierByPlanId: Record<string, number> = {
        ppllistobj_0893: 61000,
        ppllistobj_0778: 61000,
        ppllistobj_0844: 61000,
        ppllistobj_0845: 37000,
        ppllistobj_0535: 37000,
        ppllistobj_0765: 37000,
        ppllistobj_0775: 37000,
    }

    const forcedTier = forceTierByPlanId[planId]

    const priceTiers = [110000, 100000, 90000, 61000, 37000]
    let matchedKey = ""

    if (forcedTier) {
        matchedKey = `${discount}_discount_${register}_gte_${forcedTier}`
    } else {
        for (const tier of priceTiers) {
            if (planPrice >= tier) {
                matchedKey = `${discount}_discount_${register}_gte_${tier}`
                break
            }
        }

        if (!matchedKey) {
            matchedKey = `${discount}_discount_${register}_lt_37000`
        }
    }

    const value = data[matchedKey] ?? 0
    const youtubeBonus = YOUTUBE_PLAN_PIDS_SET.has(planId) ? 30000 : 0
    return value + youtubeBonus
}

export function withKTMarketSubsidy(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [variant, setVariant] = useState(
            props.title === store.benefit ? "active" : "inactive"
        )

        const [price, setPrice] = useState("0원")

        useEffect(() => {
            const variant =
                props.title === store.benefit ? "active" : "inactive"
            setVariant(variant)
            setPrice(`${store.ktmarketSubsidy.toLocaleString()}원`)
        }, [store.benefit, store.ktmarketSubsidy, store.selectedPlanInfo])

        const handleOnClick = () => {
            event.preventDefault()
            setStore({ benefit: props.title })
        }

        return (
            <Component
                {...props}
                price={price}
                onClick={handleOnClick} // 클릭된 capacity 전달
                variant={variant}
            />
        )
    }
}

export function withKTMarketBenefit(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [variant, setVariant] = useState(
            props.title === store.benefit ? "active" : "inactive"
        )

        const [price, setPrice] = useState("359,000원")

        useEffect(() => {
            const variant =
                props.title === store.benefit ? "active" : "inactive"
            setVariant(variant)
        }, [store.benefit])

        const handleOnClick = () => {
            event.preventDefault()
            if (store.benefit == props.title) {
                setStore({ benefit: "" })
            } else {
                setStore({ benefit: props.title })
            }
        }

        return (
            <Component
                {...props}
                price={price}
                onClick={handleOnClick}
                variant={variant}
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


export function withInstallment(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [variant, setVariant] = useState(
            store.installment == props.installment
        )

        const handleOnClick = (event) => {
            event.preventDefault()
            if (store.isGuaranteedReturn) {
                if (props.installment == 0 || props.installment == 24) {
                    setStore({ installment: props.installment })
                } else {
                    alert(
                        "미리보상을 선택하신 고객님의 경우\n일시불 혹은 24개월 할부만 선택하실 수 있습니다."
                    )
                }
            } else {
                setStore({ installment: props.installment })
            }
        }

        useEffect(() => {
            const variant =
                props.installment === store.installment ? "active" : "inactive"
            setVariant(variant)
        }, [store.installment])

        return (
            <Component {...props} variant={variant} onClick={handleOnClick} />
        )
    }
}

// 사전예약때 기존꺼 지우고 살리기 0227
export function withDiscount(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [variant, setVariant] = useState(
            props.title1 === store.discount ? "active" : "inactive"
        )
        const [description1, setDescription1] = useState("")
        const [description2, setDescription2] = useState("")
        const [totalPrice, setTotalPrice] = useState(0)
        const [hydrated, setHydrated] = useState(false)
        const ktmarketSubsidiesRef = useMemo(() => {
            return store.ktmarketSubsidies
        }, [store.ktmarketSubsidies])

        useEffect(() => {
            setHydrated(true)
            // 요할 적용 S26
            const s26Models = [
                "sm-s942nk",
                "sm-s942nk512",
                "sm-s947nk",
                "sm-s947nk512",
                "sm-s948nk",
                "sm-s948nk512",
            ]
            const lastSegment =
                typeof window !== "undefined"
                    ? window.location.pathname.split("/").filter(Boolean).pop()
                    : ""
        }, [])

        useEffect(() => {
            const lastSegment =
                typeof window !== "undefined"
                    ? window.location.pathname.split("/").filter(Boolean).pop()
                    : ""
            if (
                lastSegment == "sm-f966nk512" ||
                lastSegment == "sm-f766nk512"
            ) {
            }
        }, [])

        useEffect(() => {
            const variant =
                props.title1 === store.discount ? "active" : "inactive"
            setVariant(variant)
            if (store.plan) {
                const planPrice = store.selectedPlan.price ?? 0
                const disclosure_subsidy =
                    store.selectedPlan.disclosure_subsidy ?? 0

                setDescription1(
                    `월 요금(월${planPrice.toLocaleString("en-US")}원) 선택시`
                )
                if (props.title1 == "선택약정할인") {
                    setDescription2(
                        `월 ${(planPrice * 0.25).toLocaleString("en-US")}원씩 24개월간 할인`
                    )
                    const totalPriceForPlan = planPrice * 0.25 * 24
                    setTotalPrice(totalPriceForPlan)
                } else {
                    setDescription2(
                        `출고가에서 즉시 ${disclosure_subsidy.toLocaleString("en-US")} 일시 할인`
                    )
                    setTotalPrice(disclosure_subsidy)
                }
                setStore({ ktmarketSubsidy: calcKTmarketSubsidy(store) })
            }
        }, [store.discount, store.selectedPlan, store.ktmarketSubsidies])

        const handleOnClick = () => {
            setStore({ discount: props.title1 })
        }

        if (!hydrated) return null
        return (
            <Component
                {...props}
                description1={description1}
                description2={description2}
                price={totalPrice}
                onClick={handleOnClick}
                variant={variant}
            />
        )
    }
}


export function withOnlineButton(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const { navigate, routes } = useRouter()

        const PATH_USER_INFO = "/phone/user-info"
        const PATH_NOTIFICATION = "/phone/device-notification"

        const releasedModels = [
            "sm-s942nk",
            "sm-s942nk512",
            "sm-s947nk",
            "sm-s947nk512",
            "sm-s948nk",
            "sm-s948nk512",
        ]

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
            ...releasedModels,
        ]

        const getQuantity = () => {
            const colorEn = store.color?.en
            const match = store.stocks?.find((item) => item.colorEn === colorEn)
            return match?.quantity ?? null
        }

        const quantity = getQuantity()
        const hasStockData =
            Array.isArray(store.stocks) &&
            store.stocks.length > 0 &&
            !!store.color?.en
        const isSoldOut = hasStockData && quantity !== null ? quantity <= 0 : false

        const isSamsungExternalPreorder = (model) => {
            if (releasedModels.includes(model)) return false
            // @ts-ignore (S26_MODLE은 원본 파일 전역에 선언되어 있음)
            return typeof S26_MODLE !== "undefined" && S26_MODLE.includes(model)
        }

        const getTitle = () => {
            // 품절일 경우 무조건 입고 알림 반환
            if (isSoldOut) return "입고 알림"

            const currentModel = store.device?.model

            if (isSamsungExternalPreorder(currentModel)) return "셀프가입 신청"
            // @ts-ignore
            if (
                typeof Iphone17e_MODEL !== "undefined" &&
                Iphone17e_MODEL.includes(currentModel)
            )
                return "셀프가입 신청"
            if (preorderModel.includes(currentModel)) return "셀프가입 신청"

            return "신청서 작성"
        }

        const getRouteId = (allRoutes, path) => {
            for (const [key, value] of Object.entries(allRoutes)) {
                if (value?.path === path) return key
            }
            return getRouteId(allRoutes, "/")
        }

        const handleOnClick = (event) => {
            event.preventDefault()

            const storeJson = JSON.stringify(store)
            sessionStorage.removeItem("data")
            sessionStorage.setItem("data", storeJson)
            localStorage.setItem("kt_data", storeJson)

            const allRoutes = routes
            // 재고 상태에 따라 다른 페이지(알림 페이지 vs 정보 입력 페이지)로 라우팅
            const path = isSoldOut ? PATH_NOTIFICATION : PATH_USER_INFO
            const routeId = getRouteId(allRoutes, path)

            navigate(routeId, "")
        }

        return (
            <Component
                {...props}
                title={getTitle()}
                onClick={handleOnClick}
                // Framer 디자인에서 품절 상태일 때 버튼 색상/형태를 바꾸려면 variant 활용
                variant={isSoldOut ? "SoldOut" : "Default"}
            />
        )
    }
}

export function withSubmitButton(Component): ComponentType {
    return (props) => {
        // const freebieSectionPath = "/phone/confirm"
        const PATH = "/phone/confirm"
        const { navigate, routes } = useRouter()

        const url =
            "https://script.google.com/macros/s/AKfycbzzSuCn_9r4BzwfPvKPcjA902x7-Mut2wlznWhSf93Sx2nZgUm77gtkuq-JWdYB4ShS/exec" +
            "?path=" +
            props.path

        const [store, setStore] = useStore()
        const [isFormValid, setIsFormValid] = useState(false)
        const [isLoading, setIsLoading] = useState(false)

        useEffect(() => {
            const pathSegments = window.location.pathname.split("/")
            const lastSegment = pathSegments.pop() || pathSegments.pop() // 빈 문자열을 방지
        }, [])

        function getRouteId(allRoute, path) {
            for (const [key, value] of Object.entries(allRoute)) {
                if (value?.path === path) {
                    return key
                }
            }
            return ""
        }

        // provide the path here

        useEffect(() => {
            // validateForm(store)
        }, [store])

        const handleOnClick = async (e) => {
            // e.preventDefault()

            const storeJson2 = JSON.stringify(store)
            sessionStorage.setItem("data", storeJson2)
            localStorage.setItem("kt_data", storeJson2)
            // window.history.pushState({}, "", PATH)
            sessionStorage.setItem("scrollPosition", window.scrollY)
            // console.log(window.scrollY)
            const allRoute = routes
            let routeId = getRouteId(allRoute, PATH)
            if (routeId === "") {
                routeId = getRouteId(allRoute, "/")
            }
            navigate(routeId, "")
        }

        const handleSubmit = async (e) => {
            if (isFormValid) {
                e.preventDefault()
                const keys = Component.propertyControls.variant.options
                const values = Component.propertyControls.variant.optionTitles
                // console.log(JSON.stringify(store))
                const componentType = {}

                for (let i = 0; i < keys.length; i++) {
                    componentType[keys[i]] = values[i]
                }

                if (props.variant == componentType["inactive"]) {
                    return
                }

                if (store.isAgreedTOS != true) {
                    alert("이용약관에 동의를 해주세요")
                    return
                }

                // setIsLoading(true)
                try {
                    const response = await fetch(url, {
                        method: "POST",
                        // mode: "no-cors",

                        cache: "no-cache",
                        headers: {
                            "Content-Type": "text/plain;charset=utf-8",
                        },
                        redirect: "follow",
                        body: JSON.stringify(store),
                    })

                    const data = await response.json()
                    window.location.href = "/check"
                } catch (error) {
                    console.log("Error sending data:", error)
                    console.error("Error sending data:", error)
                } finally {
                    // setIsLoading(false)
                }
            }
        }

        return <Component {...props} onClick={handleOnClick} />
    }
}


// 0227
// export function withSubsidyNoticeVisibility(Component): ComponentType {
//     return (props) => {
//         const [store] = useStore()

//         // 1. 현재 모델이 대상인지 확인 (S26 모델 또는 아이폰 17e 모델 포함)
//         const isTargetModel = store.device?.model
//             ? S26_MODLE.includes(store.device.model) ||
//               Iphone17e_MODEL.includes(store.device.model)
//             : false

//         // 2. 대상 모델이 아니면 렌더링하지 않음 (null 반환 = 숨김)
//         if (!isTargetModel) {
//             return null
//         }

//         // 3. 대상 모델이면 컴포넌트 보여줌
//         return <Component {...props} />
//     }
// }


// ─── withPlanGrid ─────────────────────────────────────────────────────
// PlanBenefitSelector 전용 Override
// store의 planInfo / selectedPlanInfo 연동 + 카드별 할인 금액 계산
// ──────────────────────────────────────────────────────────────────────
export function withPlanGrid(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        // 고정 3개 요금제의 공통 단말할인(공시지원금)만 DB에서 fetch
        const [planDisclosures, setPlanDisclosures] = useState<Record<string, number>>({})

        useEffect(() => {
            if (!store.currentModelId || store.discount === "선택약정할인") {
                setPlanDisclosures({})
                return
            }
            const planDB = store.register === "번호이동" ? "device_plans_mnp"
                : store.register === "신규가입" ? "device_plans_new" : "device_plans_chg"
            const FIXED_PIDS = ["ppllistobj_0937", "ppllistobj_0938", "ppllistobj_0939", "ppllistobj_0808", "ppllistobj_0925"]
            supabase
                .from(planDB)
                .select("plan_id, disclosure_subsidy")
                .eq("model", store.currentModelId)
                .in("plan_id", FIXED_PIDS)
                .then(({ data }) => {
                    if (!data) return
                    const map: Record<string, number> = {}
                    for (const row of data) {
                        map[row.plan_id] = row.disclosure_subsidy ?? 0
                    }
                    setPlanDisclosures(map)
                })
        }, [store.currentModelId, store.register, store.discount])

        useEffect(() => {
            if (!store.selectedPlanInfo || !store.ktmarketSubsidies) return
            const nextSubsidy = calcKTmarketSubsidy(store)
            if ((store.ktmarketSubsidy ?? 0) !== nextSubsidy) {
                setStore({ ktmarketSubsidy: nextSubsidy })
            }
        }, [
            store.selectedPlanInfo?.pid,
            store.selectedPlanInfo?.price,
            store.register,
            store.discount,
            store.ktmarketSubsidies,
        ])

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

        // KT마켓 지원금만 계산
        const calcKtmarketForPid = (planPrice: number, pid: string): number => {
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

        // 디바이스 추가지원금(단독) — withOrderSheet와 동일
        // 현재 전 요금제 0원으로 운영
        const calcPromoDiscount = (_pid: string): number => {
            return 0
        }

        const calcDiscountLabelAmount = (planPrice: number, pid: string): number => {
            const ktmarket = calcKtmarketForPid(planPrice, pid)
            const promotion = calcPromoDiscount(pid)
            const disclosure =
                store.discount === "공통지원금"
                    ? (planDisclosures[pid] ??
                        (store.selectedPlanInfo?.pid === pid
                            ? (store.selectedPlan?.disclosure_subsidy ?? 0)
                            : 0))
                    : 0

            return disclosure + ktmarket + promotion
        }

        // 고정 3개 PID + YouTube 3종 + 선택된 요금제에 대한 총 할인 금액 맵
        // 기기할인: 단말할인(공통) + KT마켓지원금 + 디바이스 추가지원금(단독)
        // 요금할인: KT마켓지원금 + 디바이스 추가지원금(단독)
        const GRID_PIDS = ["ppllistobj_0937", "ppllistobj_0808", "ppllistobj_0925"]
        const planPriceMap: Record<string, number> = {
            "ppllistobj_0937": 90000,  // YouTube 초이스 베이직
            "ppllistobj_0938": 110000, // YouTube 초이스 스페셜
            "ppllistobj_0939": 130000, // YouTube 초이스 프리미엄
            "ppllistobj_0808": 69000,
            "ppllistobj_0925": 37000,
        }
        const discountAmounts: Record<string, number> = {}
        for (const [pid, price] of Object.entries(planPriceMap)) {
            discountAmounts[pid] = calcDiscountLabelAmount(price, pid)
        }
        // 현재 선택된 커스텀 요금제 할인 금액도 포함
        if (store.selectedPlanInfo?.pid && !discountAmounts[store.selectedPlanInfo.pid]) {
            const pid = store.selectedPlanInfo.pid
            discountAmounts[pid] = calcDiscountLabelAmount(
                store.selectedPlanInfo.price,
                pid
            )
        }

        // KT마켓 지원금 — 할인 타입(device/plan)을 직접 지정하는 버전
        const calcKtmarketTyped = (planPrice: number, pid: string, discountType: "device" | "plan"): number => {
            if (!store.ktmarketSubsidies) return 0
            const register = store.register === "번호이동" ? "mnp" : store.register === "신규가입" ? "new" : "chg"
            const forceTierByPlanId: Record<string, number> = {
                ppllistobj_0893: 61000, ppllistobj_0778: 61000, ppllistobj_0844: 61000,
                ppllistobj_0845: 37000, ppllistobj_0535: 37000, ppllistobj_0765: 37000, ppllistobj_0775: 37000,
            }
            const forcedTier = forceTierByPlanId[pid]
            const priceTiers = [110000, 100000, 90000, 61000, 37000]
            let key = ""
            if (forcedTier) {
                key = `${discountType}_discount_${register}_gte_${forcedTier}`
            } else {
                for (const tier of priceTiers) {
                    if (planPrice >= tier) { key = `${discountType}_discount_${register}_gte_${tier}`; break }
                }
                if (!key) key = `${discountType}_discount_${register}_lt_37000`
            }
            return store.ktmarketSubsidies[key] ?? 0
        }

        // 기기할인 vs 요금할인 중 더 저렴한 탭 계산 (선택된 요금제 기준, 무이자 단순 비교)
        const cheaperTab: "기기 할인" | "요금할인" | null = (() => {
            if (!store.selectedPlan) return null
            const devicePrice = store.selectedPlan.model_price ?? 0
            const planPrice = store.selectedPlan.price ?? 0
            const installment = store.installment > 0 ? store.installment : 24
            const isMnp = store.register === "번호이동"
            const pid = store.selectedPlan.plan_id ?? ""
            const ktApplied = store.benefit === "KT마켓 단독혜택"
            const promo = calcPromoDiscount(pid)

            // 기기할인: 공시지원금 + 번이지원금 + KT마켓(device) + 프로모션
            const disclosureSubsidy = store.selectedPlan.disclosure_subsidy ?? 0
            const migrationSubsidy = isMnp ? (store.selectedPlan.migration_subsidy ?? 0) : 0
            const ktDevice = ktApplied ? calcKtmarketTyped(planPrice, pid, "device") : 0
            const principalDevice = Math.max(0, devicePrice - (disclosureSubsidy + migrationSubsidy + ktDevice + promo))

            // 요금할인: KT마켓(plan) + 프로모션 (공시/번이 없음)
            const ktPlan = ktApplied ? calcKtmarketTyped(planPrice, pid, "plan") : 0
            const principalPlan = Math.max(0, devicePrice - (ktPlan + promo))

            // 월 총액 비교
            const totalDevice = Math.round(principalDevice / installment) + planPrice
            const totalPlan = Math.round(principalPlan / installment) + Math.round(planPrice * 0.75)

            if (totalDevice < totalPlan) return "기기 할인"
            if (totalPlan < totalDevice) return "요금할인"
            return null
        })()

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
                cheaperTab={cheaperTab}
                onPlanSelect={handlePlanSelect}
                onTabChange={handleTabChange}
                store={store}
                setStore={setStore}
            />
        )
    }
}
