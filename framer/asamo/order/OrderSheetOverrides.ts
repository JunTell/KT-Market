import { ComponentType, useEffect, useState } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { createClient } from "@supabase/supabase-js"

// --- Supabase 설정 ---
const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ 요금제 정보 매핑
const PLAN_DETAILS: Record<string, any> = {
    plan_61: {
        name: "5G 심플 (30G)",
        data: "30GB + 5Mbps",
        calls: "무제한",
        texts: "무제한",
        price: 61000,
    },
    plan_69: {
        name: "데이터ON 비디오",
        data: "110GB + 5Mbps",
        calls: "무제한",
        texts: "기본제공",
        price: 69000,
    },
    plan_69_v: {
        name: "5G 심플 110GB",
        data: "110GB + 5Mbps",
        calls: "무제한",
        texts: "무제한",
        price: 69000,
    },
    plan_90: {
        name: "(유튜브 프리미엄) 초이스 베이직",
        data: "완전 무제한 + 공유데이터 2배 80GB",
        calls: "무제한",
        texts: "기본제공",
        price: 90000,
    },
    ppllistobj_0926: {
        name: "5G 심플 (30G)",
        data: "30GB+5Mbps",
        calls: "무제한",
        texts: "무제한",
        price: 61000,
    },
    ppllistobj_0808: {
        name: "5G 심플 110GB",
        data: "110GB+5Mbps",
        calls: "무제한",
        texts: "무제한",
        price: 69000,
    },
    ppllistobj_0937: {
        name: "(유튜브 프리미엄) 초이스 베이직",
        data: "완전 무제한 + 공유데이터 2배 80GB",
        calls: "무제한",
        texts: "기본제공",
        price: 90000,
    },
}

// ✅ Store 정의
const useStore = createStore({
    // 표시용
    imageUrl: "",
    title: "",
    spec: "",
    price: "",

    // 기본 사용자 정보
    userName: "",
    userDob: "",
    userPhone: "",
    requirements: "", // 요청사항

    // 신청 정보
    joinType: "기기변경",
    contract: "24개월",
    asamoId: "",
    discountType: "device",
    selectedPlanId: "plan_90",

    // DB 저장용 데이터
    deviceModel: "",
    modelBase: "",
    deviceCapacity: "",
    deviceColor: "",
    telecomCompany: "애플",
    funnel: "asamo",

    isReady: false,
})

// ✅ 색상 매핑
const COLOR_MAP: Record<string, string> = {
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

export function OrderDataFetcher(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()

        useEffect(() => {
            if (typeof window === "undefined") return

            const loadData = async () => {
                const params = new URLSearchParams(window.location.search)
                const modelFromUrl = params.get("model")
                const sessionDataStr = sessionStorage.getItem("asamoDeal")
                let sessionData = null

                if (sessionDataStr) {
                    try {
                        sessionData = JSON.parse(sessionDataStr)
                    } catch (e) {
                        console.error("세션 파싱 에러", e)
                    }
                }

                if (
                    sessionData &&
                    modelFromUrl &&
                    sessionData.model === modelFromUrl
                ) {
                    applyDataToStore(sessionData, setStore)
                } else if (modelFromUrl) {
                    await fetchFromDB(modelFromUrl, setStore)
                }
            }
            loadData()
        }, [])

        return <Component { ...props } />
    }
}

function applyDataToStore(data: any, setStore: any) {
    const format = (n) => new Intl.NumberFormat("ko-KR").format(n)
    const colorKey = data.color || "random"
    const colorName = COLOR_MAP[colorKey] || colorKey || "기본색상"
    const planId = data.selectedPlanId || "plan_90"
    const joinTypeKr = data.registrationType === "mnp" ? "번호이동" : "기기변경"
    const discountTypeKr =
        data.discountType || data.discountMode || data.mode || "device"
    const modelParts = (data.model || "").split("-")
    const modelBase =
        modelParts.length >= 2
            ? `${modelParts[0]}-${modelParts[1]}`
            : data.model

    setStore({
        imageUrl: data.imageUrl || "",
        title: data.title || "모델명 로딩 중",
        spec: `${data.capacity || ""} · ${colorName}`,
        price: data.finalPrice
            ? `${data.finalPrice}`
            : `출고가 ${format(data.originPrice || 0)}원`,

        deviceModel: data.model,
        modelBase: modelBase,
        deviceCapacity: data.capacity,
        deviceColor: colorName,
        telecomCompany: "KT",

        joinType: joinTypeKr,
        contract: "24개월",
        discountType: discountTypeKr,
        selectedPlanId: planId,
        isReady: true,
    })
}

async function fetchFromDB(fullModelStr: string, setStore: any) {
    const parts = fullModelStr.split("-")
    const dbModelKey =
        parts.length >= 2 ? `${parts[0]}-${parts[1]}` : fullModelStr
    const colorKey = parts.length >= 3 ? parts.slice(2).join("-") : "black"
    const colorName = COLOR_MAP[colorKey] || colorKey

    const { data: device } = await supabase
        .from("devices")
        .select("*")
        .eq("model", dbModelKey)
        .single()

    if (device) {
        const format = (n) => new Intl.NumberFormat("ko-KR").format(n)
        const imageFile = device.images?.[colorKey]?.[0] || "01"
        const imageUrl = `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${device.category}/${colorKey}/${imageFile}.png`

        setStore({
            imageUrl: imageUrl,
            title: device.pet_name,
            spec: `${device.capacity} · ${colorName}`,
            price: `출고가 ${format(device.price)}원`,

            deviceModel: fullModelStr,
            modelBase: dbModelKey,
            deviceCapacity: device.capacity,
            deviceColor: colorName,
            telecomCompany: "KT",

            joinType: "기기변경",
            discountType: "device",
            selectedPlanId: "plan_90",
            isReady: true,
        })
    }
}

export function withOrderProductSummary(Component): ComponentType {
    return (props) => {
        const [store] = useStore()
        const [mounted, setMounted] = useState(false)
        const [sessionPrice, setSessionPrice] = useState("")

        useEffect(() => {
            setMounted(true)

            if (typeof window !== "undefined") {
                try {
                    const sessionStr = sessionStorage.getItem("asamoDeal")
                    if (sessionStr) {
                        const sessionData = JSON.parse(sessionStr)

                        // 스크린샷의 finalDevicePrice (예: 367000) 확인
                        if (sessionData.finalDevicePrice !== undefined) {
                            const formattedPrice = new Intl.NumberFormat(
                                "ko-KR"
                            ).format(Number(sessionData.finalDevicePrice))
                            setSessionPrice(`${formattedPrice}원`)
                        }
                    }
                } catch (e) {
                    console.error("세션 가격 파싱 오류", e)
                }
            }
        }, [])

        if (!mounted) return <Component { ...props } />

        return (
            <Component
                { ...props }
                image = { store.imageUrl }
        title = { store.title }
        spec = { store.spec }
        price = { sessionPrice || store.price
    }
            />
        )
}
}

// ✅ [핵심] Session Data 병합 + 리다이렉트 처리
export function withOrderUserForm(Component): ComponentType {
    return (props) => {
        const [store, setStore] = useStore()
        const [mounted, setMounted] = useState(false)
        const [isReadOnly, setIsReadOnly] = useState(false)

        useEffect(() => {
            setMounted(true)
            // ... (user-info 로드 로직 동일)
            try {
                const userInfoStr = sessionStorage.getItem("user-info")
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr)
                    setStore((prev) => ({
                        ...prev,
                        userName: userInfo.userName || prev.userName,
                        userDob: userInfo.userDob || prev.userDob,
                        userPhone: userInfo.userPhone || prev.userPhone,
                        asamoId: userInfo.asamoId || prev.asamoId,
                    }))
                    setIsReadOnly(true)
                }
            } catch (e) {
                console.error("user-info 로드 실패", e)
            }
        }, [])

        const planInfo =
            PLAN_DETAILS[store.selectedPlanId] || PLAN_DETAILS["plan_90"]
        const planPriceText = `월 ${new Intl.NumberFormat("ko-KR").format(planInfo.price)}원`

        const parseDeviceName = (fullName: string) => {
            if (!fullName) return ""
            return fullName.replace(/\s\d+(GB|TB)$/i, "").trim()
        }

        // ✅ [수정된 부분] handleConfirm
        const handleConfirm = async (userInput: any) => {
            try {
                const finalInput = userInput || store

                if (
                    !finalInput ||
                    !finalInput.userName ||
                    !finalInput.userPhone
                ) {
                    alert("성함과 연락처를 모두 입력해주세요.")
                    return
                }

                // 1. Session Storage 가져오기 (asamoDeal)
                let sessionData = {}
                try {
                    const stored = sessionStorage.getItem("asamoDeal")
                    if (stored) sessionData = JSON.parse(stored)
                } catch (e) {
                    console.error("Session parse failed", e)
                }

                // 2. 기본 데이터 준비
                const companyName = "애플"
                const deviceName = parseDeviceName(store.title)
                const modelCode = store.modelBase || store.deviceModel

                // 3. JSONB 데이터 병합
                const formDataJson = {
                    ...sessionData,
                    name: finalInput.userName,
                    color: store.deviceColor,
                    phone: finalInput.userPhone,
                    device: deviceName,
                    funnel: store.funnel || "asamo",
                    asamoId: finalInput.asamoId || store.asamoId,
                    company: companyName,
                    birthday: finalInput.userDob,
                    capacity: store.deviceCapacity,
                    pet_name: modelCode,
                    register: store.joinType,
                    sub_phone: finalInput.userPhone,
                    isAgreedTOS: true,
                    requirements:
                        finalInput.requirements || "기존요금제로 기변",
                    planName: planInfo.name,
                    contract: store.contract,
                    discountType: store.discountType,
                }

                // 4. DB Insert Payload
                const insertPayload = {
                    company: companyName,
                    device: deviceName,
                    capacity: store.deviceCapacity,
                    color: store.deviceColor,
                    name: finalInput.userName,
                    birthday: finalInput.userDob,
                    phone: finalInput.userPhone,
                    funnel: store.funnel,
                    is_agreed_tos: true,
                    form_data: formDataJson,
                }

                // 5. Supabase 저장
                const { error } = await supabase
                    .from("gonggu-asamo")
                    .insert([insertPayload])

                if (error) throw error

                // ✅ 6. [추가됨] 다음 페이지를 위해 user-info 세션 저장
                const userInfoToSave = {
                    userName: finalInput.userName,
                    userDob: finalInput.userDob,
                    userPhone: finalInput.userPhone,
                    asamoId: finalInput.asamoId,
                    requirements: finalInput.requirements,
                }
                sessionStorage.setItem(
                    "user-info",
                    JSON.stringify(userInfoToSave)
                )

                // ✅ 7. [수정됨] URL 쿼리 파라미터(?model=...) 유지하며 이동
                // 현재 URL의 쿼리 스트링을 가져옴 (예: ?model=aip17-256-black)
                const currentQueryParams = window.location.search

                // 결과 페이지로 쿼리 파라미터와 함께 이동
                window.location.href =
                    "/asamo-page/asamo-result" + currentQueryParams
            } catch (e: any) {
                console.error("DB Error:", e)
                alert(`접수 실패: ${e.message}`)
            }
        }

        if (!mounted) return <Component { ...props } />

        return (
            <Component
                { ...props }
                planName = { planInfo.name }
        planData = { planInfo.data }
        planCalls = { planInfo.calls || "무제한" }
        planTexts = { planInfo.texts || "무제한" }
        planPrice = { planPriceText }
        joinType = { store.joinType }
        contract = { store.contract }
        discountType = { store.discountType }
        userName = { store.userName }
        userDob = { store.userDob }
        userPhone = { store.userPhone }
        asamoId = { store.asamoId }
        requirements = { store.requirements }
        onConfirm = { handleConfirm }
        isReadOnly = { isReadOnly }
            />
        )
    }
}
