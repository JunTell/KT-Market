// 주문서 공통 가격 계산 유틸리티
// withPriceCard, withOrderSheet, withPlanBasicNotice에서 공유

// ─── 할부금 계산 (원리금균등상환) ────────────────────────────────────────
export function calcInstallment(
    principal: number,
    months: number,
    annualRate = 5.9
): number {
    if (months === 0) return principal
    const r = annualRate / 100 / 12
    const n = months
    return Math.floor(
        (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    )
}

// ─── 미리보상 할인 ──────────────────────────────────────────────────────
const GUARANTEED_RETURN_MODELS = [
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

export function getGuaranteedReturnPrice(
    model: string,
    price: number,
    isGR: boolean
): number {
    if (!isGR) return 0
    return GUARANTEED_RETURN_MODELS.includes(model) ? price / 2 : 0
}

// ─── 프로모션 할인 (현재 미적용) ─────────────────────────────────────────
// 디바이스 추가지원금은 현재 전 요금제 0원으로 운영
const PROMO_50000_PLANS: string[] = []

export function calculatePromotionDiscount(planId: string): number {
    return PROMO_50000_PLANS.includes(planId) ? 50000 : 0
}

// ─── SPECIAL_PRICES에서 가입유형별 스페셜 할인 ──────────────────────────
export function getSpecialPrice(
    model: string,
    register: string,
    specialPrices: Record<string, { mnp: number; chg: number }>
): number {
    const prices = specialPrices[model] || { mnp: 0, chg: 0 }
    if (register === "번호이동" || register === "신규가입") return prices.mnp
    if (register === "기기변경") return prices.chg
    return 0
}

// ─── 할부금 타이틀 / 설명 ───────────────────────────────────────────────
export function getInstallmentPaymentTitle(
    isGuaranteedReturn: boolean,
    installment: number
): string {
    if (isGuaranteedReturn) return "월 할부금"
    return installment > 0 ? `월 할부금 (${installment}개월)` : "결제 금액"
}

export function getInstallmentPaymentDescription(
    installment: number
): string {
    return installment > 0 ? "분할 상환 수수료 5.9% 포함" : "카드 또는 현금결제"
}
