// UTM 파라미터 추적 유틸리티
// Instagram/Facebook 광고 ↔ 랜딩 메시지 매칭 점검용
// Quick back 6.20% 대응

export interface UTMParams {
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_content: string
    utm_term: string
    referrer: string
    landing_page: string
    timestamp: number
}

const UTM_STORAGE_KEY = "kt_utm_params"

export function captureUTMParams(): UTMParams | null {
    if (typeof window === "undefined") return null

    const url = new URL(window.location.href)
    const params: UTMParams = {
        utm_source: url.searchParams.get("utm_source") || "",
        utm_medium: url.searchParams.get("utm_medium") || "",
        utm_campaign: url.searchParams.get("utm_campaign") || "",
        utm_content: url.searchParams.get("utm_content") || "",
        utm_term: url.searchParams.get("utm_term") || "",
        referrer: document.referrer || "",
        landing_page: window.location.pathname,
        timestamp: Date.now(),
    }

    // UTM 파라미터가 있을 때만 저장
    if (params.utm_source || params.utm_medium || params.utm_campaign) {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params))
        return params
    }

    // 기존 저장된 값 반환
    const saved = sessionStorage.getItem(UTM_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
}

export function getStoredUTMParams(): UTMParams | null {
    if (typeof window === "undefined") return null
    const saved = sessionStorage.getItem(UTM_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
}

// Instagram 광고에서 진입한 사용자인지 확인
export function isFromInstagram(): boolean {
    const params = getStoredUTMParams()
    if (params?.utm_source?.toLowerCase().includes("instagram")) return true
    if (params?.utm_source?.toLowerCase().includes("ig")) return true
    if (params?.referrer?.includes("instagram.com")) return true

    // UA 기반 체크
    if (typeof navigator !== "undefined") {
        const ua = navigator.userAgent || ""
        if (/Instagram/i.test(ua)) return true
    }
    return false
}

// 주문 폼 전송 시 UTM 데이터 포함
export function getUTMForOrder(): Record<string, string> {
    const params = getStoredUTMParams()
    if (!params) return {}
    return {
        funnel: [params.utm_source, params.utm_medium, params.utm_campaign]
            .filter(Boolean).join(" / ") || "direct",
    }
}
