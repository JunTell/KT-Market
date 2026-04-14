import { ComponentType, useEffect, useState } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { createClient } from "@supabase/supabase-js"

// --- Supabase 설정 ---
const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 기본 선택 ID (69요금제 기본값)
const DEFAULT_PLAN_UUID = "plan_69"

// 타입 정의
type DiscountMode = "device" | "plan"
type RegistrationType = "chg" | "mnp"

const PRELOAD_DATA = {
    model: "aip17-256",
    title: "iPhone 17",
    capacity: "256GB",
    originPrice: 1250000, // 실제 출고가 입력
    // 기본 선택될 요금제 (데이터ON 비디오 플러스) 기준 지원금 예시
    defaultSubsidies: {
        device_discount_chg_gte_110000: 450000, // 예시 값 (실제 DB 값으로 수정 필요)
        device_discount_chg_gte_69000: 400000,
        device_discount_mnp_gte_69000: 450000,
        // ... 필요한 만큼 추가
    },
    defaultImageUrl:
        "https://juntell.s3.ap-northeast-2.amazonaws.com/phone/iphone17/lavender/01.png",
}

// ✅ [수정됨] 요금제 메타데이터 (69요금제 분리)
const PLAN_METADATA = [
    {
        uuid: "plan_61",
        dbId: "ppllistobj_0926",
        data: "30GB",
        name: "5G 심플 (30G)",
        description: "데이터 30GB + 다쓰면 5Mbps",
        calls: "무제한",
        texts: "무제한",
        fixedPrice: 61000,
    },
    // 69요금제 (변형): 데이터ON 비디오 플러스
    {
        uuid: "plan_69",
        dbId: "ppllistobj_0747",
        data: "110GB",
        name: "데이터ON 비디오",
        description: "데이터 100GB + 다쓰면 최대 5Mbps",
        calls: "무제한",
        texts: "기본제공",
        fixedPrice: 69000,
    },
    // 69요금제 (기본): 5G 심플 110GB
    {
        uuid: "plan_69_v",
        dbId: "ppllistobj_0808",
        data: "110GB",
        name: "5G 심플 110GB",
        description: "데이터 110GB + 다쓰면 5Mbps",
        calls: "무제한",
        texts: "무제한",
        fixedPrice: 69000,
    },
    {
        uuid: "plan_90",
        dbId: "ppllistobj_0811",
        data: "무제한",
        name: "베이직 초이스",
        description: "데이터 완전 무제한",
        calls: "무제한",
        texts: "무제한",
        fixedPrice: 90000,
    },
    {
        uuid: "plan_100",
        dbId: "ppllistobj_0769",
        data: "무제한",
        name: "스페셜이상",
        description: "데이터 완전 무제한 + 멤버십 VVIP",
        calls: "무제한",
        texts: "무제한",
        fixedPrice: 100000,
    },
]

const MODEL_VARIANTS = {
    aip17: [
        { label: "iPhone 17 256GB", value: "aip17-256" },
        { label: "iPhone 17 512GB", value: "aip17-512" },
    ],
    aip17p: [
        { label: "iPhone 17 Pro 256GB", value: "aip17p-256" },
        { label: "iPhone 17 Pro 512GB", value: "aip17p-512" },
        { label: "iPhone 17 Pro 1TB", value: "aip17p-1t" },
    ],
    aip17pm: [
        { label: "iPhone 17 Pro Max 256GB", value: "aip17pm-256" },
        { label: "iPhone 17 Pro Max 512GB", value: "aip17pm-512" },
        { label: "iPhone 17 Pro Max 1TB", value: "aip17pm-1t" },
        { label: "iPhone 17 Pro Max 2TB", value: "aip17pm-2t" },
    ],
    aipa: [
        { label: "iPhone 17 Air 256GB", value: "aipa-256" },
        { label: "iPhone 17 Air 512GB", value: "aipa-512" },
        { label: "iPhone 17 Air 1TB", value: "aipa-1t" },
    ],
    aip16e: [
        { label: "iPhone 16e 128GB", value: "aip16e-128" },
        { label: "iPhone 16e 256GB", value: "aip16e-256" },
    ],
}

const COLOR_LABEL_MAP: Record<string, string> = {
    lavender: "라벤더",
    sage: "세이지",
    blue: "미스트 블루",
    deep_blue: "딥 블루",
    teal: "틸",
    pink: "핑크",
    yellow: "옐로",
    green: "그린",
    ultramarine: "울트라마린",
    white: "화이트",
    black: "블랙",
    starlight: "스타라이트",
    midnight: "미드나이트",
    titaniumgray: "내추럴 티타늄",
    titaniumwhite: "화이트 티타늄",
    titaniumblack: "블랙 티타늄",
    titaniumblue: "블루 티타늄",
    natural_titanium: "내추럴 티타늄",
    black_titanium: "블랙 티타늄",
    blue_titanium: "블루 티타늄",
    white_titanium: "화이트 티타늄",
    gold: "골드",
    silver: "실버",
    desert_titanium: "데저트 티타늄",
    mist_blue: "미스트 블루",
    cosmic_orange: "코스믹 오렌지",
    sky_blue: "스카이 블루",
    light_gold: "라이트 골드",
    cloud_white: "클라우드 화이트",
    space_black: "스페이스 블랙",
}

// --- Store ---
const useStore = createStore({
    title: PRELOAD_DATA.title,
    model: PRELOAD_DATA.model,
    capacity: PRELOAD_DATA.capacity,
    originPrice: PRELOAD_DATA.originPrice,

    // 초기 가격 계산 (대략적인 값이라도 먼저 보여줌)
    finalPrice:
        new Intl.NumberFormat("ko-KR").format(
            PRELOAD_DATA.originPrice - 450000
        ) + "원", // 예시 계산
    discountInfo: "지원금 조회 중...",

    imageUrl: PRELOAD_DATA.defaultImageUrl,
    imageUrls: [PRELOAD_DATA.defaultImageUrl],
    availableColors: ["lavender", "sage", "white", "black"], // 기본 색상 하드코딩 권장
    colorImages: {}, // 나중에 채워짐

    plans: PLAN_METADATA, // 메타데이터 바로 연결
    selectedPlanId: DEFAULT_PLAN_UUID, // plan_69_v

    discountMode: "device" as DiscountMode,
    registrationType: "chg" as RegistrationType,
    userCarrier: "",

    subsidies: PRELOAD_DATA.defaultSubsidies, // 초기 지원금 데이터
    currentKtMarketDiscount: 0,
    specialDiscount: 0,
    isReady: true, // 로딩 완료 상태로 시작
})

// ✅ 세션 데이터 안전 병합 함수
const updateSessionStorage = (newData: any) => {
    if (typeof window === "undefined") return
    try {
        const stored = sessionStorage.getItem("asamoDeal")
        const existingData = stored ? JSON.parse(stored) : {}

        const mergedData = {
            ...existingData,
            ...newData,
            savedAt: new Date().toISOString(),
        }

        sessionStorage.setItem("asamoDeal", JSON.stringify(mergedData))
    } catch (e) {
        console.error("Session Update Failed", e)
    }
}

// --- Data Fetcher ---
export function DataFetcher(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        useEffect(() => {
            const loadData = async () => {
                if (typeof window === "undefined") return

                const params = new URLSearchParams(window.location.search)
                const currentModel = params.get("model")
                const sessionDataStr = sessionStorage.getItem("asamoDeal")
                const prefStr = sessionStorage.getItem("asamo_user_preference")

                // 1. 기본값 설정
                let initialRegType: RegistrationType = "chg"
                let initialCarrier = ""
                // let initialMode: DiscountMode = "device" // (필요시 사용)

                // 2. Preference(사용자 설정) 우선 확인
                if (prefStr) {
                    const pref = JSON.parse(prefStr)
                    if (pref.registrationType)
                        initialRegType = pref.registrationType
                    if (pref.userCarrier) initialCarrier = pref.userCarrier
                }

                // 3. 세션 데이터(asamoDeal) 로드 및 Preference와 동기화
                if (sessionDataStr && currentModel) {
                    let data = JSON.parse(sessionDataStr)

                    if (data.model === currentModel) {
                        // ✅ [핵심 수정] Preference 값이 있다면, 기존 세션 데이터를 덮어씌움
                        if (prefStr) {
                            data = {
                                ...data,
                                registrationType: initialRegType, // 강제 적용 (mnp)
                                userCarrier: initialCarrier, // 강제 적용
                            }
                            // 수정된 데이터를 다시 세션에 저장 (싱크 맞춤)
                            sessionStorage.setItem(
                                "asamoDeal",
                                JSON.stringify(data)
                            )
                        }

                        // 스토어에 데이터 적용
                        applyDataToStore(data, setStore)

                        // DB 최신화 요청 시에도 올바른 Type(mnp) 전달
                        await fetchAndApplyFromDB(
                            currentModel,
                            setStore,
                            store,
                            data.discountMode || "device",
                            initialRegType, // ✅ mnp 전달
                            initialCarrier,
                            data.selectedPlanId
                        )
                        return
                    }
                }

                // 4. 세션이 없거나 모델이 다른 경우 DB에서 새로 조회
                if (currentModel) {
                    try {
                        setStore((prev) => ({
                            ...prev,
                            registrationType: initialRegType, // ✅ mnp 적용
                            userCarrier: initialCarrier,
                        }))

                        await fetchAndApplyFromDB(
                            currentModel,
                            setStore,
                            store,
                            "device",
                            initialRegType, // ✅ mnp 전달
                            initialCarrier,
                            DEFAULT_PLAN_UUID
                        )
                    } catch (err) {
                        console.error("DB Load Failed", err)
                    }
                }
            }
            loadData()
        }, [])
        return <Component {...props} />
    }
}

function applyDataToStore(data: any, setStore: any) {
    const format = (n) => new Intl.NumberFormat("ko-KR").format(n)
    setStore((prev) => ({
        ...prev,
        title: data.title,
        capacity: data.capacity,
        originPrice: data.originPrice,
        finalPrice: `${format(data.finalDevicePrice ?? 0)}원`,
        discountInfo: data.discountInfo,
        imageUrl: data.imageUrl || prev.imageUrl,
        imageUrls: data.imageUrls || [],
        discountMode: data.discountMode || "device",
        registrationType: data.registrationType || "chg",
        userCarrier: data.userCarrier || "",
        currentKtMarketDiscount: data.ktmarketDiscount || 0,
        specialDiscount: data.specialDiscount || 0,
        selectedPlanId: data.selectedPlanId || DEFAULT_PLAN_UUID, // ✅ Plan ID 복구
        isReady: true,
    }))
}

async function fetchAndApplyFromDB(
    fullModelStr: string,
    setStore: any,
    currentStore: any,
    initialDiscountMode: DiscountMode,
    registrationType: RegistrationType,
    userCarrier: string,
    initialPlanId: string = DEFAULT_PLAN_UUID
) {
    const parts = fullModelStr.split("-")
    const dbModelKey =
        parts.length >= 2 ? `${parts[0]}-${parts[1]}` : fullModelStr
    const urlColorKey = parts.length >= 3 ? parts.slice(2).join("-") : null

    // 테이블 선택
    const planTableName =
        registrationType === "chg" ? "device_plans_chg" : "device_plans_mnp"

    const uniqueDbIds = Array.from(new Set(PLAN_METADATA.map((p) => p.dbId)))

    // ✅ [최적화] Promise.all을 사용하여 3개의 DB 요청을 동시에 시작
    const [deviceResult, subsidiesResult, dbPlansResult] = await Promise.all([
        // 1. 기기 정보 조회
        supabase.from("devices").select("*").eq("model", dbModelKey).single(),

        // 2. 지원금 정보 조회
        supabase
            .from("ktmarket_subsidy")
            .select("*")
            .eq("model", dbModelKey)
            .single(),

        // 3. 요금제 정보 조회
        supabase
            .from(planTableName)
            .select("plan_id, price, disclosure_subsidy")
            .eq("model", dbModelKey)
            .in("plan_id", uniqueDbIds),
    ])

    // 에러 핸들링 또는 데이터 추출
    const device = deviceResult.data
    const subsidies = subsidiesResult.data
    const dbPlans = dbPlansResult.data

    // 기기 정보가 없으면 중단
    if (!device) return

    const mergedPlans = PLAN_METADATA.map((meta) => {
        const dbData = dbPlans?.find((p) => p.plan_id === meta.dbId)
        const planPrice = meta.fixedPrice || (dbData ? dbData.price : 0)

        // 마켓지원금 계산 (5만원 추가 포함)
        let marketSubsidy = calcKTmarketSubsidy(
            meta.dbId,
            planPrice,
            subsidies,
            registrationType
        )

        return {
            id: meta.uuid,
            dbId: meta.dbId,
            name: meta.name,
            data: meta.data,
            description: meta.description,
            calls: meta.calls,
            texts: meta.texts,
            price: planPrice,
            disclosureSubsidy: dbData ? dbData.disclosure_subsidy : 0,
            marketSubsidy: marketSubsidy,
        }
    })

    const availableColors = device.colors_en || []
    const colorImageMap: Record<string, string> = {}
    availableColors.forEach((colorKey: string) => {
        const imageFilenames = device.images?.[colorKey] || []
        if (imageFilenames.length > 0) {
            colorImageMap[colorKey] =
                `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${device.category}/${colorKey}/${imageFilenames[0]}.png`
        }
    })

    let selectedColor = availableColors[0] || "black"
    if (urlColorKey && availableColors.includes(urlColorKey)) {
        selectedColor = urlColorKey
    }

    const currentImageFilenames = device.images?.[selectedColor] || []
    const currentImageUrls = currentImageFilenames.map(
        (f) =>
            `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${device.category}/${selectedColor}/${f}.png`
    )

    // ✅ 저장된 planId가 유효한지 확인하고, 없으면 기본값 사용
    const currentPlanId = initialPlanId || DEFAULT_PLAN_UUID
    const finalPlanId = mergedPlans.find((p) => p.id === currentPlanId)
        ? currentPlanId
        : DEFAULT_PLAN_UUID

    const calc = calculatePriceAndDiscount(
        finalPlanId,
        initialDiscountMode,
        device.price,
        subsidies,
        mergedPlans,
        registrationType,
        dbModelKey
    )

    const finalModelStr = `${dbModelKey}-${selectedColor}`

    const payload = {
        model: finalModelStr,
        title: device.pet_name,
        capacity: device.capacity,
        originPrice: device.price,
        imageUrl: currentImageUrls[0],
        imageUrls: currentImageUrls,
        finalDevicePrice: calc.finalDevicePrice,
        totalDeviceDiscount: calc.totalDeviceDiscount,
        planMonthlyDiscount: calc.planMonthlyDiscount,
        mode: initialDiscountMode,
        selectedPlanId: finalPlanId, // ✅ 최종 선택된 Plan ID 저장
        registrationType: registrationType,
        color: selectedColor,
        discountType: initialDiscountMode,
        specialDiscount: calc.specialDiscount,
        userCarrier: userCarrier,
    }

    setStore((prev) => {
        const nextState = {
            ...prev,
            ...payload,
            subsidies: subsidies,
            originPrice: device.price,
            plans: mergedPlans,
            selectedPlanId: finalPlanId,
            discountMode: initialDiscountMode,
            registrationType: registrationType,
            availableColors: availableColors,
            colorImages: colorImageMap,
        }

        updateSessionStorage({
            ...nextState,
            finalPrice: calc.finalPriceStr,
            currentKtMarketDiscount: calc.ktmarketDiscount,
            specialDiscount: calc.specialDiscount,
            discountMode: initialDiscountMode,
            totalDeviceDiscount: calc.totalDeviceDiscount,
            discountType: initialDiscountMode,
            userCarrier: userCarrier,
        })

        return {
            ...nextState,
            finalPrice: calc.finalPriceStr,
            discountInfo: calc.discountInfoStr,
            currentKtMarketDiscount: calc.ktmarketDiscount,
            specialDiscount: calc.specialDiscount,
        }
    })
}

// --- Helper Functions ---

// ✅ [수정됨] 특가 모델 판별 (아이폰 17 계열만 True, 16e 및 특정 17e 모델은 False)
function isIphone17Series(model: string) {
    if (!model) return false
    // aip17e-256, aip17e-512 모델은 5만원 할인 특가 대상에서 제외
    if (model === "aip17e-256" || model === "aip17e-512") return false

    return model.startsWith("aip17") || model.startsWith("aipa")
}

// ✅ 가격 및 할인 계산 로직
function calculatePriceAndDiscount(
    planUuid: string,
    mode: DiscountMode,
    originPrice: number,
    subsidies: any,
    plansList: any[],
    registrationType: RegistrationType,
    modelCode?: string
) {
    const format = (n) => new Intl.NumberFormat("ko-KR").format(n)

    const selectedPlan = plansList.find((p) => p.id === planUuid)
    const planPrice = selectedPlan?.price ?? 0
    const disclosureSubsidy = selectedPlan?.disclosureSubsidy ?? 0

    // ✅ Store에서 계산된 marketSubsidy 사용 (없으면 재계산)
    let ktmarketDiscount = selectedPlan?.marketSubsidy ?? 0
    if (!selectedPlan?.marketSubsidy) {
        ktmarketDiscount = calcKTmarketSubsidy(
            selectedPlan?.dbId || "",
            planPrice,
            subsidies,
            registrationType
        )
    }

    const planMonthlyDiscount = Math.floor((planPrice * 0.25) / 10) * 10

    // 특가 할인 로직
    const isSpecial = modelCode ? isIphone17Series(modelCode) : false
    const specialDiscount = isSpecial && registrationType === "mnp" ? 50000 : 0

    // 총 기기 할인액
    const totalDeviceDiscount =
        disclosureSubsidy + ktmarketDiscount + specialDiscount

    let finalDevicePrice = 0
    let discountInfoStr = ""

    if (mode === "device") {
        finalDevicePrice = Math.max(0, originPrice - totalDeviceDiscount)
        discountInfoStr = `총 ${format(totalDeviceDiscount)}원 할인`
    } else {
        // 선약: 출고가 - 마켓지원금 - 특가할인
        finalDevicePrice = Math.max(
            0,
            originPrice - ktmarketDiscount - specialDiscount
        )
        discountInfoStr = `월 ${format(planMonthlyDiscount)}원 요금할인`
    }

    return {
        finalPriceStr: `${format(finalDevicePrice)}원`,
        discountInfoStr,
        ktmarketDiscount,
        specialDiscount,
        totalDeviceDiscount,
        finalDevicePrice,
        planMonthlyDiscount,
    }
}

function calcKTmarketSubsidy(
    planId: string,
    planPrice: number,
    subsidyRow: any,
    registrationType: RegistrationType
): number {
    if (!subsidyRow) return 0
    if (planPrice <= 0) return 0

    const forcedTier = {
        ppllistobj_0893: 61000,
        ppllistobj_0778: 61000,
        ppllistobj_0844: 61000,
        ppllistobj_0845: 37000,
        ppllistobj_0535: 37000,
        ppllistobj_0765: 37000,
        ppllistobj_0775: 37000,
    }[planId]

    const priceTiers = [110000, 100000, 90000, 61000, 37000]
    let matchedKey = ""

    if (forcedTier) {
        matchedKey = `device_discount_${registrationType}_gte_${forcedTier}`
    } else {
        for (const tier of priceTiers) {
            if (planPrice >= tier) {
                matchedKey = `device_discount_${registrationType}_gte_${tier}`
                break
            }
        }
        if (!matchedKey)
            matchedKey = `device_discount_${registrationType}_lt_37000`
    }
    return subsidyRow[matchedKey] ?? 0
}

// --- Overrides ---

export function withRegistrationToggle(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        const handleToggle = async (type: RegistrationType) => {
            if (type === store.registrationType) return
            setStore((prev) => ({ ...prev, registrationType: type }))
            await fetchAndApplyFromDB(
                store.model,
                setStore,
                store,
                store.discountMode,
                type,
                store.userCarrier,
                store.selectedPlanId
            )
        }

        if (!mounted) return <Component {...props} />

        return (
            <Component
                {...props}
                registrationType={store.registrationType}
                onToggle={handleToggle}
            />
        )
    }
}

export function withPlanSelector(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        const handleSelectPlan = (uuid: string) => {
            const parts = store.model.split("-")
            const modelCode =
                parts.length >= 2 ? `${parts[0]}-${parts[1]}` : store.model

            setStore((prev) => {
                const calc = calculatePriceAndDiscount(
                    uuid,
                    prev.discountMode,
                    prev.originPrice,
                    prev.subsidies,
                    prev.plans,
                    prev.registrationType,
                    modelCode
                )
                const selectedPlan = prev.plans.find((p) => p.id === uuid)
                const nextState = {
                    selectedPlanId: uuid,
                    mode: prev.discountMode,
                    discountType: prev.discountMode,
                    finalDevicePrice: calc.finalDevicePrice,
                    ktmarketDiscount: calc.ktmarketDiscount,
                    disclosureSubsidy: selectedPlan?.disclosureSubsidy,
                    totalDeviceDiscount: calc.totalDeviceDiscount,
                    planMonthlyDiscount: calc.planMonthlyDiscount,
                    registrationType: prev.registrationType,
                    specialDiscount: calc.specialDiscount,
                }
                updateSessionStorage(nextState)
                return {
                    ...prev,
                    selectedPlanId: uuid,
                    finalPrice: calc.finalPriceStr,
                    discountInfo: calc.discountInfoStr,
                    currentKtMarketDiscount: calc.ktmarketDiscount,
                    specialDiscount: calc.specialDiscount,
                }
            })
        }

        const handleChangeMode = (mode: DiscountMode) => {
            const parts = store.model.split("-")
            const modelCode =
                parts.length >= 2 ? `${parts[0]}-${parts[1]}` : store.model

            setStore((prev) => {
                const calc = calculatePriceAndDiscount(
                    prev.selectedPlanId,
                    mode,
                    prev.originPrice,
                    prev.subsidies,
                    prev.plans,
                    prev.registrationType,
                    modelCode
                )
                const selectedPlan = prev.plans.find(
                    (p) => p.id === prev.selectedPlanId
                )
                const nextState = {
                    selectedPlanId: prev.selectedPlanId,
                    mode: mode,
                    discountType: mode,
                    finalDevicePrice: calc.finalDevicePrice,
                    ktmarketDiscount: calc.ktmarketDiscount,
                    disclosureSubsidy: selectedPlan?.disclosureSubsidy,
                    totalDeviceDiscount: calc.totalDeviceDiscount,
                    planMonthlyDiscount: calc.planMonthlyDiscount,
                    registrationType: prev.registrationType,
                    specialDiscount: calc.specialDiscount,
                }
                updateSessionStorage(nextState)
                return {
                    ...prev,
                    discountMode: mode,
                    finalPrice: calc.finalPriceStr,
                    discountInfo: calc.discountInfoStr,
                    currentKtMarketDiscount: calc.ktmarketDiscount,
                    specialDiscount: calc.specialDiscount,
                }
            })
        }

        if (!mounted) return <Component {...props} />

        const parts = store.model.split("-")
        const modelCode =
            parts.length >= 2 ? `${parts[0]}-${parts[1]}` : store.model
        const isSpecial = isIphone17Series(modelCode)

        return (
            <Component
                {...props}
                plans={store.plans}
                selectedPlanId={store.selectedPlanId}
                discountMode={store.discountMode}
                originPrice={store.originPrice}
                ktMarketDiscount={store.currentKtMarketDiscount}
                registrationType={store.registrationType}
                isSpecialModel={isSpecial}
                specialDiscount={store.specialDiscount}
                onSelectPlan={handleSelectPlan}
                onChangeMode={handleChangeMode}
            />
        )
    }
}

export function withOptionData(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        const modelParts = store.model ? store.model.split("-") : []
        const currentPrefix = modelParts[0] || ""
        const currentCapacity = modelParts.length > 1 ? modelParts[1] : ""
        const currentColor =
            modelParts.length > 2
                ? modelParts.slice(2).join("-")
                : store.availableColors[0] || ""
        const capacityVariants = MODEL_VARIANTS[currentPrefix] || []
        const capacityOptions = capacityVariants.map((variant) => ({
            label: variant.label.split(" ").pop() || variant.label,
            value: variant.value.split("-")[1],
        }))
        const colorOptions = store.availableColors.map((colorKey) => ({
            label: COLOR_LABEL_MAP[colorKey] || colorKey,
            value: colorKey,
            image: store.colorImages[colorKey] || "",
            isSoldOut: false,
        }))

        const changeModel = async (newModel: string) => {
            if (newModel === store.model) return
            const url = new URL(window.location.href)
            url.searchParams.set("model", newModel)
            window.history.pushState({}, "", url)
            try {
                await fetchAndApplyFromDB(
                    newModel,
                    setStore,
                    store,
                    store.discountMode,
                    store.registrationType,
                    store.userCarrier,
                    store.selectedPlanId
                )
            } catch (e) {
                console.error("Model Change Failed", e)
            }
        }
        const handleSelectCapacity = (newCapacity: string) => {
            const newModel = `${currentPrefix}-${newCapacity}${currentColor ? `-${currentColor}` : ""}`
            changeModel(newModel)
        }
        const handleSelectColor = (newColor: string) => {
            const newModel = `${currentPrefix}-${currentCapacity}-${newColor}`
            changeModel(newModel)
        }

        if (!mounted) return <Component {...props} />

        return (
            <Component
                {...props}
                selectedCapacity={currentCapacity}
                selectedColorValue={currentColor}
                capacityOptions={capacityOptions}
                colorOptions={colorOptions}
                onSelectCapacity={handleSelectCapacity}
                onSelectColor={handleSelectColor}
            />
        )
    }
}

export function withDeviceImage(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        if (!mounted || !store.imageUrl) return <Component {...props} />

        return (
            <Component
                {...props}
                images={store.imageUrls}
                urls={store.imageUrls}
                src={store.imageUrl}
            />
        )
    }
}
export function withTitle(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        if (!mounted) return <Component {...props} />
        return <Component {...props} text={store.title} />
    }
}
export function withPrice(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        if (!mounted) return <Component {...props} />
        return <Component {...props} text={store.finalPrice} />
    }
}
export function withDiscount(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        if (!mounted) return <Component {...props} />
        return <Component {...props} text={store.discountInfo} />
    }
}
export function withPlanDetailCard(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        if (!mounted) return <Component {...props} />
        return <Component {...props} planId={store.selectedPlanId} />
    }
}
export function withApplyButton(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        const handleApply = () => {
            if (!store.model) {
                alert("모델 정보가 없습니다.")
                return
            }
            const targetPath = `/asamo-page/asamo-order?model=${store.model}`
            window.location.href = targetPath
        }

        if (!mounted) return <Component {...props} />
        return <Component {...props} onClick={handleApply} />
    }
}

export function withStickyBar(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        const handleClick = () => {
            if (!store.model) {
                alert("모델 정보가 로딩되지 않았습니다.")
                return
            }
            window.location.href = `/asamo-page/asamo-order?model=${store.model}`
        }

        if (!mounted) return <Component {...props} />

        return (
            <Component
                {...props}
                finalPrice={store.finalPrice}
                originPrice={store.originPrice}
                onClick={handleClick}
            />
        )
    }
}

export function withMainStickyBar(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        useEffect(() => setMounted(true), [])

        const handleClick = () => {
            const section =
                document.getElementById("today-phone") ||
                document.querySelector("[name='today-phone']")

            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" })
            } else {
                console.error("타겟 섹션(#today-phone)을 찾을 수 없습니다.")
            }
        }

        if (!mounted) return <Component {...props} />

        return (
            <Component
                {...props}
                finalPrice={store.finalPrice}
                originPrice={store.originPrice}
                onClick={handleClick}
            />
        )
    }
}
