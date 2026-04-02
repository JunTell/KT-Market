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

// PhonePriceCard 전용 override
// finalPrice 카운트 애니메이션 + 월 할부 팝업 + 스켈레톤 통합
export function withPriceCard(Component): ComponentType {
    return (props) => {
        const [store] = useStore()

        function calcInstallment(principal: number, months: number) {
            if (months === 0) return principal
            const r = 5.9 / 100 / 12
            const n = months
            return Math.floor(
                (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
            )
        }

        const finalPrice = store.installmentPrincipal ?? 0
        const originPrice = store.device?.price ?? 0
        const installment = store.installment ?? 24
        const monthlyPayment = calcInstallment(finalPrice, installment)

        const planPrice = store.selectedPlan?.price ?? 0
        const planDiscountAmount =
            store.discount === "선택약정"
                ? Math.round(planPrice * 0.25)
                : 0

        const discountRate = (() => {
            if (originPrice <= 0) return 0
            const rate = ((originPrice - finalPrice) / originPrice) * 100
            return Math.round(Math.min(Math.max(rate, 0), 100))
        })()

        return (
            <Component
                {...props}
                finalPrice={finalPrice}
                originPrice={originPrice}
                discountRate={discountRate}
                monthlyPayment={monthlyPayment}
                installment={installment}
                planPrice={planPrice}
                planDiscountAmount={planDiscountAmount}
                isLoading={store.isLoading ?? false}
                formLink={store.device?.form_link ?? ""}
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
        const [formLink, setFormLink] = useState(props.formLink)
        const [hydrated, setHydrated] = useState(false)

        // 12-04
        const [specialPriceMnp, setSpecialPriceMnp] = useState(0)
        const [specialPriceChg, setSpecialPriceChg] = useState(0)

        const [installmentPayment, setInstallmentPayment] = useState("")
        const [planName, setPlanName] = useState("")
        const [benefit, setBenefit] = useState("")
        const [discount, setDiscount] = useState("")
        const [devicePrice, setDevicePrice] = useState(0)
        const [ktmarketSubsidy, setKtmarketSubsidy] = useState(0)
        const [disclosureSubsidy, setDisclosureSubsidy] = useState(0)
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
        }, [store])

        useEffect(() => {
            if (!store || !store.plan || !store.device) return
            if (store.installmentPrincipal !== installmentPrincipal) {
                setStore({ installmentPrincipal })
            }
        }, [installmentPrincipal])

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
            />
        )
    }
}

export function withPhoneDetail(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [loading, setLoading] = useState(true)
        const [isFirst, setIsFirst] = useState(true)
        const [error, setError] = useState(null)
        const [hydrated, setHydrated] = useState(false)

        // 기존 iphone16e 팝업
        const [showPopup, setShowPopup] = useState(false)

        // ✅ 단종 팝업 상태 추가
        const [discontinuedInfo, setDiscontinuedInfo] = useState(null)

        const DB = {
            DEVICES: "devices",
            DEVICE_PLANS_CHG: "device_plans_chg",
            DEVICE_PLANS_MNP: "device_plans_mnp",
            DEVICE_PLANS: "device_plans",
            KTMARKET_SUBSIDY: "ktmarket_subsidy",
        }

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

                await fetchInitPlanData(initialPlanId, store.register, modelId)

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
            window.history.pushState({}, "", `/phone/${discontinuedInfo.targetModel}`)
            setStore({ currentModelId: discontinuedInfo.targetModel })
        }

        // currentModelId 초기화: URL에서 파싱 후 store에 저장
        useEffect(() => {
            if (typeof window === "undefined") return
            if (!store.currentModelId) {
                const pathSegment =
                    window.location.pathname.split("/").filter(Boolean).pop() || ""
                setStore({ currentModelId: pathSegment })
            }
        }, [])

        // currentModelId 변경 시: 팝업/단종 체크 + 데이터 재호출 (SPA 핵심)
        useEffect(() => {
            if (!store.currentModelId) return
            const modelId = store.currentModelId

            // isGuaranteedReturn 초기화 (해당 모델만)
            if (modelId === "sm-f966nk512" || modelId === "sm-f766nk512") {
                const params = new URLSearchParams(window.location.search)
                const isGuaranteedReturnValue =
                    params.get("isGuaranteedReturn") ?? "0"
                if (isGuaranteedReturnValue === "1") {
                    setStore({ isGuaranteedReturn: true })
                }
            }

            // ✅ 오직 이 경로에서만 16e 팝업 ON
            setShowPopup(modelId === "aip16e-128")

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
        }, [store.currentModelId])

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

        const handlePopupClose = (
            e?: React.MouseEvent<
                HTMLDivElement | HTMLButtonElement | SVGSVGElement
            >
        ) => {
            if (e) {
                e.preventDefault()
                e.stopPropagation()
            }
            setShowPopup(false)
        }

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
                                    color: "#191F28",
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
                                    color: "#4E5968",
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
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                {discontinuedInfo.buttonText}
                            </button>
                        </div>
                    </div>
                )}

                {/* aip16e일 때만, 페이지 전체를 덮는 팝업 */}
                {showPopup && !discontinuedInfo && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "center",
                        }}
                        onClick={handlePopupClose}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "480px",
                                backgroundColor: "#fff",
                                borderTopLeftRadius: "16px",
                                borderTopRightRadius: "16px",
                                boxShadow: "0 -6px 20px rgba(0,0,0,0.15)",
                                padding: "24px 20px 20px",
                                maxHeight: "80vh",
                                overflowY: "auto",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3
                                style={{
                                    fontSize: "24px",
                                    fontWeight: 800,
                                    marginBottom: "16px",
                                    textAlign: "center",
                                    color: "#000",
                                }}
                            >
                                아이폰16E KT마켓지원금 안내
                            </h3>

                            <p
                                style={{
                                    fontSize: "15px",
                                    lineHeight: 1.6,
                                    color: "#3182CE",
                                    textAlign: "center",
                                    marginBottom: "20px",
                                    fontWeight: 700,
                                    whiteSpace: "pre-line",
                                    wordBreak: "keep-all",
                                }}
                            >
                                본 혜택은 KT마켓 단독특가입니다.{"\n"}
                                이후 작성하는 KT 공식신청서에는 추가지원금이
                                표시되지 않아도 정상이며,{"\n"}
                                주문페이지 가격 그대로 적용됩니다.
                            </p>

                            <button
                                onClick={handlePopupClose}
                                style={{
                                    width: "100%",
                                    height: "48px",
                                    backgroundColor: "#1A1A1A",
                                    color: "#FAFAF8",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                확인
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

// JunCarousel 전용: 이미지 + 색상 선택 + 스켈레톤 통합
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

// s26 사전예약때 쓰던거
// export function withCapacity(Component): ComponentType {
//     return (props) => {
//         const [store, setStore] = useStore()
//         const [capacities, setCapacities] = useState([])

//         function getDescriptionForCapacity(capacity: string): string {
//             const currentModel = store.device?.model || ""

//             // [일반 설명]
//             const descriptions: Record<string, string> = {
//                 "128GB": "사진은 약 38,333장 저장할 수 있어요.",
//                 "256GB": "사진은 약 76,667장 저장할 수 있어요.",
//                 "512GB": "사진은 약 153,334장 저장할 수 있어요.",
//                 "1TB": "사진은 306,668장 저장할 수 있어요.",
//             }
//             return (
//                 descriptions[capacity] || "사진은 612,668장 저장할 수 있어요."
//             )
//         }

//         useEffect(() => {
//             if (store.device && Array.isArray(store.device.capacities)) {
//                 // 프레이머용 데이터(capacities props) 생성
//                 const formattedCapacities = store.device.capacities.map(
//                     (item, index) => ({
//                         capacity: item || "",
//                         description: getDescriptionForCapacity(item),
//                         path: store.device.paths[index] || "",
//                     })
//                 )
//                 setCapacities(formattedCapacities)
//             }
//         }, [store.device])

//         return <Component {...props} capacities={capacities} />
//     }
// }

export function withCapacity(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [capacities, setCapacities] = useState([])

        useEffect(() => {
            if (store.device && Array.isArray(store.device.capacities)) {
                const formattedCapacities = store.device.capacities.map(
                    (item, index) => ({
                        capacity: item || "",
                        path: store.device.paths[index] || "",
                    })
                )
                setCapacities(formattedCapacities)
            }
        }, [store.device])

        const handleCapacitySelect = (path: string) => {
            window.history.pushState({}, "", `/phone/${path}`)
            setStore({ currentModelId: path })
        }

        return (
            <Component
                {...props}
                capacities={capacities}
                currentModelId={store.currentModelId}
                isLoading={store.isLoading}
                onCapacitySelect={handleCapacitySelect}
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
            if (store.colors.length == store.stocks.length) {
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

        const handleColorChange = (color) => {}

        return <Component {...props} quantity={quantity} />
    }
}

export function withColor(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [colors, setColors] = useState([])

        useEffect(() => {
            setColors(store.colors)
            if (store.colors.length > 0) {
                handleColorChange(store.colors[0])
            }
        }, [store.colors])

        const handleColorChange = (color) => {
            setStore({ color: color })

            if (store.stocks) {
                const selectedStock = store.stocks?.find(
                    (stock) => stock.colorEn === color.en
                )

                const quantity = selectedStock?.quantity ?? 0
                if (quantity <= 0) {
                    // 재고 없는 기능 추가: 품절 알림을 띄우거나 UI 제어를 위한 Store 업데이트
                    alert(
                        "해당 색상은 현재 재고가 없습니다. 입고 알림을 신청해주세요."
                    )
                }
            }
        }

        return (
            <Component
                {...props}
                colors={colors}
                activeColor={store.color}
                onColorChange={handleColorChange}
                isLoading={store.isLoading ?? false}
            />
        )
    }
}

// export function withRegister(Component): ComponentType {
//     return (props) => {
//         const [store, setStore] = useStore()
//         const [variant, setVariant] = useState(
//             props.title === store.register ? "active" : "inactive"
//         )
//         const hasInitializedRef = useRef(false)

//         const NEW_SUBSCRIPTION_MODELS = [
//             "aip16e-128",
//             "aip16e-256",
//             "sm-a175nk-kp",
//         ]

//         // 번호이동을 기본값으로 설정할 기기 모델들
//         const numberPortingModels = [
//             "aip16-128", // iPhone 16 128GB
//             "aip16-256", // iPhone 16 256GB
//             "aip16-512", // iPhone 16 512GB
//             "aip17-256",
//             "aip17-512",
//             "aip17p-1t",
//             "aip17p-256",
//             "aip17p-512",
//             "aip17pm-1t",
//             "aip17pm-256",
//             "aip17pm-2t",
//             "aip17pm-512",
//             "aipa-1t",
//             "aipa-256",
//             "aipa-512",
//         ]

//         useEffect(() => {
//             const variant =
//                 props.title === store.register ? "active" : "inactive"
//             setVariant(variant)
//             setStore({ ktmarketSubsidy: calcKTmarketSubsidy(store) })
//         }, [store.register, store.ktmarketSubsidies])

//         useEffect(() => {
//             if (store.device && !hasInitializedRef.current) {
//                 const deviceModel = store.device.model

//                 if (numberPortingModels.includes(deviceModel)) {
//                     setStore({ register: "번호이동" })
//                 } else if (deviceModel === "sm-a175nk-kp") {
//                     setStore({ register: "신규가입" })
//                 }

//                 hasInitializedRef.current = true
//             }
//         }, [store.device])

//         const handleOnClick = (register) => {
//             setStore({ register: register })
//         }

//         if (props.title === "신규가입") {
//             const currentModel = store.device?.model
//             if (
//                 !currentModel ||
//                 !NEW_SUBSCRIPTION_MODELS.includes(currentModel)
//             ) {
//                 return null
//             }
//         }

//         return (
//             <Component
//                 {...props}
//                 onClick={() => handleOnClick(props.title)}
//                 variant={variant}
//             />
//         )
//     }
// }

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

export function withFreebiesSection(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

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

        const pid = store.selectedPlanInfo?.pid

        if (!pid || !sections.includes(pid)) return null

        return <Component {...props} />
    }
}

export function withFreebies(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        if (!store.planInfo) return null
        return (
            <Component
                {...props}
                plan={store.planInfo?.pid}
                store={store}
                setStore={setStore}
            />
        )
    }
}

export function withFreebiesSecondSection(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        return <Component {...props} />
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

export function withBenefitSection(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [isVisible, setIsVisible] = useState(true)

        useEffect(() => {
            var isVisible = store.ktmarketSubsidy > 0
            setIsVisible(isVisible)
        }, [store.ktmarketSubsidy])

        return (
            <Component
                {...props}
                style={{ display: isVisible ? "flex" : "none" }}
            />
        )
    }
}

export function withBenefit(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [variant, setVariant] = useState(
            props.title === store.benefit ? "active" : "inactive"
        )

        useEffect(() => {
            const variant =
                props.title === store.benefit ? "active" : "inactive"
            setVariant(variant)
        }, [store.benefit])

        const handleOnClick = () => {
            event.preventDefault()
            setStore({ benefit: props.title })
            // console.log(`Clicked benefit: ${benefit}`)
        }

        return (
            <Component
                {...props}
                onClick={handleOnClick} // 클릭된 capacity 전달
                variant={variant}
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
    return value
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
        return <Component {...props} isVisible={store.installment == 0} />
    }
}

export function withGuaranteedReturnWarning(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        if (!store.isGuaranteedReturn) return null
        return <Component {...props} />
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

export function withGuaranteedReturnComponent(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const variant = (isGuaranteedReturn: Boolean) => {
            if (isGuaranteedReturn) {
                if (props.title == "신청하기") {
                    return "active"
                } else {
                    return "inactive"
                }
            } else {
                if (props.title == "신청하기") {
                    return "inactive"
                } else {
                    return "active"
                }
            }
        }

        const handleOnClick = (event) => {
            if (props.title == "신청하기") {
                setStore({ isGuaranteedReturn: true })
            } else {
                setStore({ isGuaranteedReturn: false })
            }
        }

        return (
            <Component
                {...props}
                variant={variant(store.isGuaranteedReturn)}
                onClick={handleOnClick}
            />
        )
    }
}

export function withDiscountWarning(Component): ComponentType {
    return (props) => {
        // console.log(props)
        const [store, setStore] = useStore()
        const [variant, setVariant] = useState("")
        const [hydrated, setHydrated] = useState(false)

        const calcVariant = (discount) => {
            const samsungDevice = [
                "ppllistobj_0850",
                "ppllistobj_0851",
                "ppllistobj_0852", // 삼성 초이스
                "ppllistobj_0863",
                "ppllistobj_0864",
                "ppllistobj_0865", // 디바이스 초이스
            ]

            const phoneCare = [
                "ppllistobj_0956",
                "ppllistobj_0957",
                "ppllistobj_0958", // 폰케어 초이스
            ]

            const planId = store.selectedPlan?.plan_id

            if (phoneCare.includes(planId)) {
                if (discount === "선택약정할인") {
                    setVariant("폰케어_요금")
                } else {
                    setVariant("폰케어_공시")
                }
            } else if (samsungDevice.includes(planId)) {
                setVariant("삼성디바이스")
            } else {
                setVariant(discount)
            }
        }
        useEffect(() => {
            setHydrated(true)
        }, [])

        useEffect(() => {
            calcVariant(store.discount)
        }, [store.discount, store.selectedPlan])

        if (!hydrated) return null
        return <Component {...props} variant={variant} />
    }
}

export function withFreebie(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        return <Component {...props} />
    }
}

export function withConditionalText(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const plan = store.selectedPlanInfo?.pid

        // 특정 plan일 때 다른 텍스트 표시
        const appliancePlans = [
            "ppllistobj_0994",
            "ppllistobj_0993",
            "ppllistobj_0992",
        ]

        let displayText = "할인 제품을 확인해주세요." // 기본 텍스트

        if (plan && appliancePlans.includes(plan)) {
            displayText = "가전 제품을 확인해주세요." // 가전 요금제용 텍스트
        }

        return (
            <Component
                {...props}
                text={displayText}
                style={{ marginTop: "6px" }}
            />
        )
    }
}

export function withConditionalSubText(Component): ComponentType {
    return (props: any) => {
        const [store] = useStore()
        const plan = store.selectedPlanInfo?.pid

        // 36개월 조건 요금제
        const plan36Months = [
            "ppllistobj_0994",
            "ppllistobj_0993",
            "ppllistobj_0992",
        ]

        // 24개월 조건 요금제
        const plan24Months = [
            "ppllistobj_0863",
            "ppllistobj_0864",
            "ppllistobj_0865",
            "ppllistobj_0852",
            "ppllistobj_0850",
            "ppllistobj_0851",
        ]

        // 기본 텍스트
        let displayText = `해당 요금제 가입 후 유지 시
아래 선택하신 제품의 할부금을 매월 할인해드립니다.`

        if (plan && plan36Months.includes(plan)) {
            displayText = `할인 제품 안내를 꼭 확인해주세요.
아래 상품의 가격은 휴대폰 개통조건 최소 유지기간(6개월)과 별도로, 상품 조건 기간(36개월) 기준입니다.
개통 완료 후 2~3일 이내 해당 제품의 신청서를 보내드립니다.`
        } else if (plan && plan24Months.includes(plan)) {
            displayText = `할인 제품 안내를 꼭 확인해주세요.
아래 상품의 가격은 휴대폰 개통조건 최소 유지기간(6개월)과 별도로, 상품 조건 기간(24개월) 기준입니다.
개통 완료 후 2~3일 이내 해당 제품의 신청서를 보내드립니다.`
        }

        return (
            <Component
                {...props}
                text={displayText}
                style={{ ...props.style, whiteSpace: "pre-wrap" }}
            />
        )
    }
}

export function withApplianceText(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const { navigate, routes } = useRouter()
        const plan = store.selectedPlanInfo?.pid

        // 가전 요금제 목록
        const appliancePlans = [
            "ppllistobj_0994",
            "ppllistobj_0993",
            "ppllistobj_0992",
        ]

        const isAppliancePlan = plan && appliancePlans.includes(plan)

        // 텍스트 설정
        let displayText = null
        if (isAppliancePlan) {
            displayText = "가전구독 신청하기 >"
        }

        // Route ID 찾기 함수
        const getRouteId = (allRoutes, path) => {
            for (const [key, value] of Object.entries(allRoutes)) {
                if (value?.path === path) return key
            }
            return null
        }

        const handleOnClick = (event) => {
            // 가전 요금제가 아니면 클릭 무시
            if (!isAppliancePlan) {
                return
            }

            // 이벤트 버블링 방지
            event.preventDefault()
            event.stopPropagation()

            console.log("====가전구독 신청 클릭====")
            console.log("Store:", store)
            console.log("Routes:", routes)

            // sessionStorage에 데이터 저장
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("data")
                sessionStorage.setItem("data", JSON.stringify(store))
            }

            // 페이지 이동
            const targetPath = "/event/home-appliance-subscription"
            const routeId = getRouteId(routes, targetPath)

            if (routeId) {
                console.log("Route ID 찾음:", routeId)
                navigate(routeId)
            } else {
                console.error("Route를 찾을 수 없음:", targetPath)
                console.log("사용 가능한 routes:", routes)

                // 대체 방법: 직접 URL 이동
                if (typeof window !== "undefined") {
                    window.location.href = targetPath
                }
            }
        }

        return (
            <Component
                {...props}
                text={displayText}
                onClick={isAppliancePlan ? handleOnClick : props.onClick}
                style={{
                    ...props.style,
                    cursor: isAppliancePlan ? "pointer" : props.style?.cursor,
                }}
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
            return match?.quantity ?? 0
        }

        // 기존 하드코딩된 false를 지우고 실제 재고 수량 연동
        const isSoldOut = getQuantity() <= 0

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

            sessionStorage.removeItem("data")
            sessionStorage.setItem("data", JSON.stringify(store))

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

            sessionStorage.setItem("data", JSON.stringify(store))
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

export function withShareButton(Component): ComponentType {
    return (props) => {
        const shareURL = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: document.title,
                        // text: "이 페이지를 공유합니다!",
                        url: window.location.href,
                    })
                    console.log("공유 성공")
                } catch (error) {
                    console.log("공유 실패:", error)
                }
            } else {
                try {
                    await navigator.clipboard.writeText(window.location.href)
                    alert("URL이 클립보드에 복사되었습니다!")
                } catch (err) {
                    console.error("URL 복사 실패:", err)
                }
            }
        }

        return <Component {...props} onClick={() => shareURL()} />
    }
}

export function withDetailCategoryButton(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const handleOnClick = () => {
            setStore({ isExpanded: true })
        }

        return <Component {...props} onClick={() => handleOnClick()} />
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
                onClick={() => handleOnClick()}
            />
        )
    }
}

export function withDetailSection(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
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
                    height: height,
                    overflow: "hidden",
                }}
            />
        )
    }
}

export function GoToCategory(): Override {
    const [store, setStore] = useStore()

    const scrollToCategory = () => {
        const el = document.querySelector("#category")
        if (!el) return
        el.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    return {
        onTap() {
            if (!store.isExpanded) {
                setStore({ ...store, isExpanded: true })

                setTimeout(() => {
                    requestAnimationFrame(scrollToCategory)
                }, 50)
            } else {
                scrollToCategory()
            }
        },
    }
}

export function withReviewCard(Component): ComponentType {
    return (props) => {
        return (
            <Component
                {...props}
                image={`https://juntell.s3.ap-northeast-2.amazonaws.com/reviews/${props.rid}.png`}
            />
        )
    }
}

export function withAddtionalBenefit(Component): ComponentType {
    return (props) => {
        const handleOnClick = () => {
            alert("준비중입니다.")
        }
        return <Component {...props} onClick={handleOnClick} />
    }
}

export function withStockComponent(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const { quantity, colorEn, colorKr } = props

        useEffect(() => {
            // 상태 업데이트를 함수형으로 처리
            setStore((prevStore) => {
                const currentStocks = prevStore.stocks || []

                const updatedStocks = [
                    ...currentStocks,
                    { quantity, colorEn, colorKr },
                ]
                return {
                    ...prevStore,
                    stocks: updatedStocks,
                }
            })
        }, [quantity, colorEn, colorKr]) // 의존성 추가

        return <Component {...props} />
    }
}

export function withPreorderVisibleSection(Component): ComponentType {
    return (props) => {
        const lastSegment =
            typeof window !== "undefined"
                ? window.location.pathname.split("/").filter(Boolean).pop()
                : ""

        if (!preorderModel.includes(lastSegment)) return null

        return <Component {...props} />
    }
}

export function withPreorderInVisibleSection(Component): ComponentType {
    return (props) => {
        const lastSegment =
            typeof window !== "undefined"
                ? window.location.pathname.split("/").filter(Boolean).pop()
                : ""

        if (preorderModel.includes(lastSegment)) return null

        return <Component {...props} />
    }
}

export function withBackButton(): Override {
    return {
        onClick: () => {
            if (typeof window !== "undefined") {
                window.history.back()
            }
        },
        style: {
            cursor: "pointer",
        },
    }
}

export function withDepositMessage(Component): ComponentType {
    return (props) => {
        const [store] = useStore()

        // 1. 안전 장치: 데이터가 로딩 전이면 숨김
        if (!store || !store.device || !store.selectedPlan) return null

        // 2. 모델명 체크: 대상 모델이 아니면 렌더링 안 함 (숨김)
        const targetModels = ["sm-m366k", "sm-a366nk"]

        if (!targetModels.includes(store.device.model)) {
            return null
        }

        // 3. 금액 계산 로직
        // 기기 출고가
        const devicePrice = store.selectedPlan?.model_price ?? 0

        // 공시지원금 (할인 유형이 '공통지원금'일 때만 적용)
        const disclosureSubsidy =
            store.discount === "공통지원금"
                ? (store.selectedPlan?.disclosure_subsidy ?? 0)
                : 0

        // KT마켓 단독지원금 (혜택이 'KT마켓 단독혜택'일 때만 적용)
        const ktmarketSubsidy =
            store.benefit === "KT마켓 단독혜택"
                ? (store.ktmarketSubsidy ?? 0)
                : 0

        // 총 할인 금액 (필요시 추가지원금 등 다른 변수도 더할 수 있음)
        const totalDiscount = disclosureSubsidy + ktmarketSubsidy

        // ★ 차액 계산 (할인액 - 기기값)
        const difference = totalDiscount - devicePrice

        // 차액이 0원 이하(입금받을 돈이 없음)라면 숨길지, 아니면 그냥 0원으로 띄울지 결정
        // 아래 코드는 "받을 돈이 있을 때만" 띄웁니다.
        if (difference <= 0) return null

        // 4. 텍스트 변경하여 렌더링
        return (
            <Component
                {...props}
                text={`※ 지원금이 단말기 출고가를 초과하여\n    초과 금액은 개통 완료 후\n    고객 명의 계좌로 다음달에 환급됩니다.`}
            />
        )
    }
}

export function withHiddenDetailSection(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        // isExpanded가 false면 아예 렌더링하지 않음
        if (!store.isExpanded) {
            return null
        }

        return <Component {...props} />
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

export function withYoutubePremiumCondition(Component): ComponentType {
    const YOUTUBE_PREMIUM_PLANS = [
        "ppllistobj_0939",

        "ppllistobj_0938",

        "ppllistobj_0937",
    ]

    return (props) => {
        const [store] = useStore()

        // 스토어에서 요금제 PID 가져오기

        const plan = store?.selectedPlanInfo?.pid

        // 1. 현재 선택된 요금제가 유튜브 프리미엄 대상인지 확인

        const isYoutubePlan = plan && YOUTUBE_PREMIUM_PLANS.includes(plan)

        // 2. 대상 요금제가 아니면 렌더링하지 않음 (null 반환 = 숨김)

        if (!isYoutubePlan) {
            return null
        }

        // 3. 대상 요금제면 컴포넌트 보여줌

        return <Component {...props} />
    }
}
