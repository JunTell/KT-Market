// withPlanGrid override와 함께 사용
// 준텔DB - plans.csv 전체 등록
// 고정 3개: 90,000원(ppllistobj_0942) / 69,000원(ppllistobj_0808) / 37,000원(ppllistobj_0925)
// 4번째 칸: 팝업에서 전체 요금제 선택 가능 (5G/LTE 탭 + 카테고리 + 검색)

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── 타입 ────────────────────────────────────────────────────────────
type Plan = {
    pid: string
    main_plan: "5G" | "LTE"
    category: string
    title: string
    description: string
    data: string
    tethering: string
    roaming: string
    voiceText: string
    price: number
}

// ─── 전체 요금제 데이터 (준텔DB - plans.csv) ─────────────────────────
const ALL_PLANS: Plan[] = [
    // 5G 초이스
    { pid: "ppllistobj_0994", main_plan: "5G", category: "5G 초이스", title: "가전구독 초이스 프리미엄", description: "KT 가전구독상품 월 할부금 할인", data: "완전 무제한", tethering: "100GB", roaming: "3Mbps 무제한", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0993", main_plan: "5G", category: "5G 초이스", title: "가전구독 초이스 스페셜", description: "KT 가전구독상품 월 할부금 할인", data: "완전 무제한", tethering: "70GB", roaming: "100Kbps 무제한", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0992", main_plan: "5G", category: "5G 초이스", title: "가전구독 초이스 베이직", description: "KT 가전구독상품 월 할부금 할인", data: "완전 무제한", tethering: "40GB", roaming: "100Kbps 무제한", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0863", main_plan: "5G", category: "5G 초이스", title: "디바이스 초이스 프리미엄", description: "디바이스 할부금 할인 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP, 단말보험할인 / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0864", main_plan: "5G", category: "5G 초이스", title: "디바이스 초이스 스페셜", description: "디바이스 할부금 할인 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP, 단말보험할인 / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0865", main_plan: "5G", category: "5G 초이스", title: "디바이스 초이스 베이직", description: "디바이스 할부금 할인 / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0956", main_plan: "5G", category: "5G 초이스", title: "폰케어 초이스 베이직", description: "KT 단말 보험 할인 (최대 5,500원) / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0957", main_plan: "5G", category: "5G 초이스", title: "폰케어 초이스 스페셜", description: "KT 단말 보험 할인 (최대 5,500원) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP, 단말보험할인 / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0958", main_plan: "5G", category: "5G 초이스", title: "폰케어 초이스 프리미엄", description: "KT 단말 보험 할인 (최대 5,500원) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0852", main_plan: "5G", category: "5G 초이스", title: "삼성 초이스 프리미엄", description: "삼성초이스 디바이스 할부금 할인 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0850", main_plan: "5G", category: "5G 초이스", title: "삼성 초이스 베이직", description: "삼성초이스 디바이스 할부금 할인 / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0851", main_plan: "5G", category: "5G 초이스", title: "삼성 초이스 스페셜", description: "삼성초이스 디바이스 할부금 할인 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0940", main_plan: "5G", category: "5G 초이스", title: "티빙/지니/밀리 초이스 프리미엄", description: "티빙·지니 스마트 음악감상·밀리의 서재·블라이스 기본제공 / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0941", main_plan: "5G", category: "5G 초이스", title: "티빙/지니/밀리 초이스 스페셜", description: "티빙·지니 스마트 음악감상·밀리의 서재·블라이스 기본제공 / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0942", main_plan: "5G", category: "5G 초이스", title: "티빙/지니/밀리 초이스 베이직", description: "티빙·지니 스마트 음악감상·밀리의 서재·블라이스 기본제공 / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0809", main_plan: "5G", category: "5G 초이스", title: "넷플릭스 초이스 프리미엄", description: "넷플릭스 스탠다드 제공 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0810", main_plan: "5G", category: "5G 초이스", title: "넷플릭스 초이스 스페셜", description: "넷플릭스 베이식 제공 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0811", main_plan: "5G", category: "5G 초이스", title: "넷플릭스 초이스 베이직", description: "넷플릭스 베이식 제공 / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0939", main_plan: "5G", category: "5G 초이스", title: "(유튜브 프리미엄) 초이스 프리미엄", description: "유튜브 프리미엄 제공 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0938", main_plan: "5G", category: "5G 초이스", title: "(유튜브 프리미엄) 초이스 스페셜", description: "유튜브 프리미엄 제공 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0937", main_plan: "5G", category: "5G 초이스", title: "(유튜브 프리미엄) 초이스 베이직", description: "유튜브 프리미엄 제공 / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0840", main_plan: "5G", category: "5G 초이스", title: "디즈니+ 초이스 프리미엄", description: "디즈니+ 스탠다드 이용권 제공 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0841", main_plan: "5G", category: "5G 초이스", title: "디즈니+ 초이스 스페셜", description: "디즈니+ 스탠다드 이용권 제공 / 플러스혜택(택1) / 스마트기기&데이터쉐어링 1회선 무료, 멤버쉽VVIP / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0842", main_plan: "5G", category: "5G 초이스", title: "디즈니+ 초이스 베이직", description: "디즈니+ 스탠다드 이용권 제공 / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    { pid: "ppllistobj_0982", main_plan: "5G", category: "5G 초이스", title: "소상공인 초이스 프리미엄", description: "AI전화 라이트 월정액 할인 (최대 11,220원) / 플러스혜택(택1) / Y덤 혜택) 공유데이터 2배 200GB", data: "완전 무제한", tethering: "100GB", roaming: "무제한 (최대 3Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 130000 },
    { pid: "ppllistobj_0983", main_plan: "5G", category: "5G 초이스", title: "소상공인 초이스 스페셜", description: "AI전화 라이트 월정액 할인 (최대 11,220원) / 플러스혜택(택1) / Y덤 혜택) 공유데이터 2배 140GB", data: "완전 무제한", tethering: "70GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 110000 },
    { pid: "ppllistobj_0984", main_plan: "5G", category: "5G 초이스", title: "소상공인 초이스 베이직", description: "AI전화 라이트 월정액 할인 (최대 11,220원) / 멤버쉽VIP / Y덤 혜택) 스마트기기 or 데이터쉐어링 1회선 무료 택1, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 90000 },
    // 5G 일반
    { pid: "ppllistobj_0769", main_plan: "5G", category: "5G 일반", title: "스페셜", description: "멤버쉽VVIP 제공, 단말보험할인, 스마트기기 or 데이터쉐어링 1회선 무료 / Y덤 혜택) 공유데이터 2배 100GB", data: "완전 무제한", tethering: "50GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 100000 },
    { pid: "ppllistobj_0770", main_plan: "5G", category: "5G 일반", title: "베이직", description: "멤버쉽VIP 제공 / Y덤 혜택) 스마트기기 1회선 50% 할인, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대100Kbps)", voiceText: "집/이동전화 무제한/기본제공", price: 80000 },
    { pid: "ppllistobj_0779", main_plan: "5G", category: "5G 일반", title: "Y 스페셜", description: "멤버쉽VVIP 제공, 로밍데이터 1Mbps 속도 제공, 단말보험할인, 스마트기기 or 데이터쉐어링 1회선 무료 / Y덤 혜택) 공유데이터 2배 100GB", data: "완전 무제한", tethering: "50GB", roaming: "무제한 (최대 1Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 100000 },
    { pid: "ppllistobj_0780", main_plan: "5G", category: "5G 일반", title: "Y 베이직", description: "멤버쉽VIP 제공, 로밍데이터 1Mbps 속도 제공 / Y덤 혜택) 스마트기기 1회선 50% 할인, 공유데이터 2배 80GB", data: "완전 무제한", tethering: "40GB", roaming: "무제한 (최대 1Mbps)", voiceText: "집/이동전화 무제한/기본제공", price: 80000 },
    { pid: "ppllistobj_0808", main_plan: "5G", category: "5G 일반", title: "5G 심플 110GB", description: "나의 데이터 사용량에 맞춤 실속형 요금제 / Y덤 혜택) 기본데이터 2배 220GB", data: "110GB+다 쓰면 최대 5Mbps", tethering: "40GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 69000 },
    { pid: "ppllistobj_0897", main_plan: "5G", category: "5G 일반", title: "5G 심플 90GB", description: "나의 데이터 사용량에 맞춤 실속형 요금제 / Y덤 혜택) 기본데이터 2배 180GB", data: "90GB+다 쓰면 최대 1Mbps", tethering: "40GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 67000 },
    { pid: "ppllistobj_0898", main_plan: "5G", category: "5G 일반", title: "5G 심플 70GB", description: "나의 데이터 사용량에 맞춤 실속형 요금제 / Y덤 혜택) 기본데이터 2배 140GB", data: "70GB+다 쓰면 최대 1Mbps", tethering: "40GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 65000 },
    { pid: "ppllistobj_0899", main_plan: "5G", category: "5G 일반", title: "5G 심플 50GB", description: "나의 데이터 사용량에 맞춤 실속형 요금제 / Y덤 혜택) 기본데이터 2배 100GB", data: "50GB+다 쓰면 최대 1Mbps", tethering: "40GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 63000 },
    { pid: "ppllistobj_0926", main_plan: "5G", category: "5G 일반", title: "5G 심플 30GB", description: "나의 데이터 사용량에 맞춤 실속형 요금제 / Y덤 혜택) 기본데이터 2배 60GB", data: "30GB+다 쓰면 최대 1Mbps", tethering: "30GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 61000 },
    { pid: "ppllistobj_0921", main_plan: "5G", category: "5G 일반", title: "5G 슬림 21GB", description: "기본 데이터 다 소진해도 데이터 무제한 제공(제한속도) / Y덤 혜택) 기본데이터 2배 42GB", data: "21GB+다 쓰면 최대 1Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 58000 },
    { pid: "ppllistobj_0929", main_plan: "5G", category: "5G 일반", title: "5G 슬림 21GB(이월)", description: "이번 달 남은 데이터 실속있게 다음달 사용 가능한 요금제 / Y덤 혜택) 기본데이터 2배 42GB+이월", data: "21GB+이월", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 58000 },
    { pid: "ppllistobj_0781", main_plan: "5G", category: "5G 일반", title: "5G 슬림 14GB", description: "기본 데이터 다 소진해도 데이터 무제한 제공(제한속도) / Y덤 혜택) 기본데이터 2배 28GB", data: "14GB+다 쓰면 최대 1Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 55000 },
    { pid: "ppllistobj_0930", main_plan: "5G", category: "5G 일반", title: "5G 슬림 14GB(이월)", description: "이번 달 남은 데이터 실속있게 다음달 사용 가능한 요금제 / Y덤 혜택) 기본데이터 2배 28GB+이월", data: "14GB+이월", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 55000 },
    { pid: "ppllistobj_0923", main_plan: "5G", category: "5G 일반", title: "5G 슬림 10GB", description: "기본 데이터 다 소진해도 데이터 무제한 제공(제한속도) / Y덤 혜택) 기본데이터 2배 20GB", data: "10GB+다 쓰면 최대 400Kbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 50000 },
    { pid: "ppllistobj_0931", main_plan: "5G", category: "5G 일반", title: "5G 슬림 10GB(이월)", description: "이번 달 남은 데이터 실속있게 다음달 사용 가능한 요금제 / Y덤 혜택) 기본데이터 2배 20GB+이월", data: "10GB+이월", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 50000 },
    { pid: "ppllistobj_0932", main_plan: "5G", category: "5G 일반", title: "5G 슬림 7GB(이월)", description: "이번 달 남은 데이터 실속있게 다음달 사용 가능한 요금제 / Y덤 혜택) 기본데이터 2배 14GB+이월", data: "7GB+이월", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 45000 },
    { pid: "ppllistobj_0925", main_plan: "5G", category: "5G 일반", title: "5G 슬림 4GB", description: "기본 데이터 다 소진해도 데이터 무제한 제공(제한속도) / Y덤 혜택) 기본데이터 2배 8GB", data: "4GB+다 쓰면 최대 400Kbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 37000 },
    { pid: "ppllistobj_0933", main_plan: "5G", category: "5G 일반", title: "5G 슬림 4GB(이월)", description: "이번 달 남은 데이터 실속있게 다음달 사용 가능한 요금제 / Y덤 혜택) 기본데이터 2배 8GB+이월", data: "4GB+이월", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 37000 },
    // 5G 청소년
    { pid: "ppllistobj_0778", main_plan: "5G", category: "5G 청소년", title: "5G Y틴", description: "만 18세 이하 요금제, 기본 데이터 다 소진해도 데이터 무제한 제공(제한속도) / Y덤 혜택) 공유데이터 10GB 추가 제공", data: "10GB+다 쓰면 최대 1Mbps", tethering: "Y덤 혜택 10GB 추가 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 47000 },
    // 5G 주니어
    { pid: "ppllistobj_0844", main_plan: "5G", category: "5G 주니어", title: "5G 주니어", description: "만 12세 이하를 위한 요금제, 기본 데이터 다 소진해도 데이터 무제한 제공(제한속도), 통화 무제한, KT안심박스 무료 제공", data: "5GB+다 쓰면 최대 1Mbps", tethering: "", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 38000 },
    { pid: "ppllistobj_0845", main_plan: "5G", category: "5G 주니어", title: "5G 주니어 슬림", description: "만 12세 이하를 위한 요금제, 느린속도 데이터 무제한 제공, 통화 무제한, KT안심박스 무료 제공", data: "3GB+다 쓰면 최대 400Kbps", tethering: "", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 28000 },
    // 5G 시니어
    { pid: "ppllistobj_0893", main_plan: "5G", category: "5G 시니어", title: "5G 시니어 베이직", description: "만 65세 이상 시니어를 위한 요금제 / 기본 데이터 다 소진해도 데이터 무제한 제공(제한속도), KT안심박스 무료 제공", data: "15GB+다 쓰면 최대 1Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 49000 },
    { pid: "ppllistobj_0894", main_plan: "5G", category: "5G 시니어", title: "5G 시니어 A형", description: "만 65세 이상 시니어를 위한 요금제 / 기본 데이터 다 소진해도 데이터 무제한 제공(제한속도), KT안심박스 무료 제공", data: "10GB+다 쓰면 최대 1Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 44000 },
    { pid: "ppllistobj_0895", main_plan: "5G", category: "5G 시니어", title: "5G 시니어 B형", description: "만 75세 이상 시니어를 위한 요금제 / 기본 데이터 다 소진해도 데이터 무제한 제공(제한속도), KT안심박스 무료 제공", data: "9GB+다 쓰면 최대 1Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 42000 },
    { pid: "ppllistobj_0896", main_plan: "5G", category: "5G 시니어", title: "5G 시니어 C형", description: "만 80세 이상 시니어를 위한 요금제 / 기본 데이터 다 소진해도 데이터 무제한 제공(제한속도), KT안심박스 무료 제공", data: "8GB+다 쓰면 최대 1Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 41000 },
    // 5G 군인
    { pid: "ppllistobj_0856", main_plan: "5G", category: "5G 군인", title: "5G 슬림 14GB(군인)", description: "현역병을 위한 데이터 추가 혜택, 군인 추가할인 20% 적용가능 (기본 제공량 소진 시 매일 2GB 추가제공 / 최대 3Mbps 속도제어)", data: "14GB+매일 2GB 추가 제공", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 55000 },
    { pid: "ppllistobj_0858", main_plan: "5G", category: "5G 군인", title: "5G 슬림 복지(군인)", description: "현역병을 위한 데이터 추가 혜택, 군인 추가할인 20% 적용가능 (기본 제공량 소진 시 매일 2GB 추가제공 / 최대 3Mbps 속도제어)", data: "14GB+매일 2GB 추가 제공", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 55000 },
    { pid: "ppllistobj_0859", main_plan: "5G", category: "5G 군인", title: "5G 슬림12GB(군인)", description: "현역병을 위한 데이터 추가 혜택, 군인 추가할인 20% 적용가능 (매월 5GB 데이터 추가 제공)", data: "7GB+매월 5GB 추가 제공", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 45000 },
    // 5G 복지
    { pid: "ppllistobj_0822", main_plan: "5G", category: "5G 복지", title: "5G 베이직 복지", description: "데이터 걱정 없는 장애인 전용 요금제 / 멤버십 VIP / 데이터 완전 무제한! 데이터로밍 무제한 제공", data: "완전 무제한", tethering: "40GB 별도 제공", roaming: "무제한 (최대 100Kbps 속도제한)", voiceText: "집/이동전화 무제한/기본제공", price: 80000 },
    { pid: "ppllistobj_0826", main_plan: "5G", category: "5G 복지", title: "5G 심플 복지", description: "장애인을 위한 요금제 / 110GB의 데이터를 다 써도 데이터 무제한", data: "110GB+다 쓰면 최대 5Mbps", tethering: "40GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 69000 },
    { pid: "ppllistobj_0821", main_plan: "5G", category: "5G 복지", title: "5G 슬림 복지", description: "장애인을 위한 요금제, 14GB의 데이터를 다 쓴 후에도 일반 동영상을 마음껏 시청 가능", data: "14GB+다 쓰면 최대 1Mbps", tethering: "14GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 55000 },
    // 5G 외국인
    { pid: "ppllistobj_0934", main_plan: "5G", category: "5G 외국인", title: "5G 웰컴 5", description: "끊기지 않는 데이터는 물론, 국제전화 혜택까지 제공 / 001 Free 무료", data: "25GB+다 쓰면 최대 5Mbps", tethering: "", roaming: "", voiceText: "200분/200건", price: 59000 },
    { pid: "ppllistobj_0935", main_plan: "5G", category: "5G 외국인", title: "5G 웰컴 3", description: "끊기지 않는 데이터는 물론, 국제전화 혜택까지 제공 / 001 Free 무료", data: "3GB+다 쓰면 최대 3Mbps", tethering: "", roaming: "", voiceText: "200분/200건", price: 49000 },
    { pid: "ppllistobj_0936", main_plan: "5G", category: "5G 외국인", title: "5G 웰컴 1", description: "끊기지 않는 데이터는 물론, 국제전화 혜택까지 제공 / 001 Free 무료", data: "1GB+다 쓰면 최대 1Mbps", tethering: "", roaming: "", voiceText: "200분/200건", price: 39000 },
    // LTE 데이터ON
    { pid: "ppllistobj_0748", main_plan: "LTE", category: "데이터ON", title: "데이터ON 프리미엄", description: "데이터 완전 무제한 요금제 / 멤버쉽VIP 제공, 단말보험할인, 스마트기기 1회선 무료 / 필수팩 L3(지니/밀리) 무료", data: "완전 무제한", tethering: "50GB 별도 제공", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 89000 },
    { pid: "ppllistobj_0747", main_plan: "LTE", category: "데이터ON", title: "데이터ON 비디오 플러스", description: "데이터 초과요금 걱정없는 LTE 요금제 / 제한속도 최대 5Mbps(고화질 동영상 재생 가능한 속도)", data: "110GB+다 쓰면 최대 5Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 69000 },
    // LTE Y데이터ON
    { pid: "ppllistobj_0758", main_plan: "LTE", category: "Y데이터ON", title: "Y데이터ON 프리미엄", description: "만 34세 이하 요금제 / 데이터 완전 무제한, 스마트기기 1회선 무료, 멤버십 VIP, 필수팩 L3(지니/밀리) 무료, 단말보험 할인제공", data: "완전 무제한", tethering: "50GB 별도 제공", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 89000 },
    { pid: "ppllistobj_0759", main_plan: "LTE", category: "Y데이터ON", title: "Y데이터ON 비디오 플러스", description: "만 34세 이하 요금제 / 데이터 110GB, 필수팩 L3(지니/밀리) 50% 할인", data: "110GB+다 쓰면 최대 5Mbps", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 69000 },
    // LTE 일반
    { pid: "ppllistobj_0761", main_plan: "LTE", category: "LTE 일반", title: "Y 베이직", description: "만 34세 이하 요금제 / 데이터 2.5GB, 집/이동전화, 문자 기본제공", data: "2.5GB(+밀당)", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 33000 },
    { pid: "ppllistobj_0745", main_plan: "LTE", category: "LTE 일반", title: "LTE 베이직", description: "데이터 1.4GB에 집/이동전화,문자 기본제공 가성비 좋은 요금제", data: "1.4GB(+밀당)", tethering: "", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 33000 },
    { pid: "ppllistobj_0743", main_plan: "LTE", category: "LTE 일반", title: "LTE 음성 18.7", description: "데이터없이 음성/문자만 알뜰하게, 피쳐폰 고객 맞춤 요금제 음성 100분+문자100건", data: "0", tethering: "", roaming: "", voiceText: "100분/100건", price: 18700 },
    { pid: "ppllistobj_0744", main_plan: "LTE", category: "LTE 일반", title: "LTE 음성 12.1", description: "데이터없이 음성/문자만 알뜰하게, 피쳐폰 고객 맞춤 요금제 문자 50건", data: "0", tethering: "", roaming: "", voiceText: "0/50건", price: 12100 },
    // LTE Y틴
    { pid: "ppllistobj_0765", main_plan: "LTE", category: "LTE Y틴(청소년)", title: "Y틴 ON", description: "만 18세 이하 요금제 / 2.5GB의 데이터를 다 쓴 후에도 데이터 무제한(속도제어)", data: "2.5GB+무제한(400Kbps)", tethering: "", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 33000 },
    { pid: "ppllistobj_0663", main_plan: "LTE", category: "LTE Y틴(청소년)", title: "Y틴 27", description: "만 18세 이하 요금제 / 데이터 2배 쓰고, 콘텐츠로도 바꿔쓰는 요금제(데이터 2,100MB)", data: "2,100MB", tethering: "", roaming: "", voiceText: "조절 이용/일 200건", price: 27390 },
    { pid: "ppllistobj_0665", main_plan: "LTE", category: "LTE Y틴(청소년)", title: "Y틴 20", description: "만 18세 이하 요금제 / 데이터 2배 쓰고, 콘텐츠로도 바꿔쓰는 요금제(데이터 1,400MB)", data: "1,400MB", tethering: "", roaming: "", voiceText: "조절 이용/일 200건", price: 20900 },
    // LTE Y 주니어
    { pid: "ppllistobj_0816", main_plan: "LTE", category: "LTE Y 주니어", title: "Y주니어 ON", description: "만 12세 이하 요금제 / KT안심박스(위치 조회 및 유해물 차단 등) 무료 제공", data: "1.5GB+무제한(400Kbps)", tethering: "", roaming: "", voiceText: "60분+무선망내 기본제공/기본 제공", price: 24000 },
    { pid: "ppllistobj_0671", main_plan: "LTE", category: "LTE Y 주니어", title: "Y주니어 19.8", description: "만 12세 이하 요금제 / KT안심박스(위치 조회 및 유해물 차단 등) 무료 제공", data: "900MB+무제한(400Kbps)", tethering: "", roaming: "", voiceText: "KT 휴대폰 지정 2회선 무제한/일 200건", price: 19800 },
    { pid: "ppllistobj_0461", main_plan: "LTE", category: "LTE Y 주니어", title: "키즈 알115(LTE)", description: "만 12세 이하 요금제 / 저렴한 월정액에 안전 서비스가 기본 제공", data: "기본알 12,000알", tethering: "", roaming: "", voiceText: "12,000알/50건", price: 12650 },
    // LTE 시니어
    { pid: "ppllistobj_0775", main_plan: "LTE", category: "LTE 시니어", title: "시니어 베이직", description: "만 65세 이상 어르신 요금제 / 데이터 2GB에 집/이동전화, 문자 기본제공", data: "2GB(+밀당)", tethering: "", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 33000 },
    { pid: "ppllistobj_0535", main_plan: "LTE", category: "LTE 시니어", title: "순 골든20(LTE)", description: "만 65세 이상 어르신에게 필요한 만큼 저렴하게 제공하는 LTE 요금제", data: "500MB", tethering: "", roaming: "", voiceText: "조절제공량 20,000원(음성/데이터/문자)/-", price: 22000 },
    { pid: "ppllistobj_0582", main_plan: "LTE", category: "LTE 시니어", title: "LTE-골든150", description: "만 65세 이상 어르신에게 필요한 만큼 저렴하게 제공하는 LTE 요금제", data: "300MB", tethering: "", roaming: "", voiceText: "조절제공량 13,000원(음성/데이터/문자)/-", price: 16500 },
    // LTE Y 군인
    { pid: "ppllistobj_0789", main_plan: "LTE", category: "Y 군인", title: "Y군인 77 PLUS", description: "현역병들의 여가시간을 즐겁게 데이터 무제한에 지니뮤직/밀리의 서재/ 블라이스 셀렉트 중 2개 선택 / 멤버십 VIP", data: "완전 무제한", tethering: "50GB", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 77000 },
    { pid: "ppllistobj_0773", main_plan: "LTE", category: "Y 군인", title: "Y군인 55 PLUS(미디어팩)", description: "현역병들의 여가시간을 즐겁게 사용하기 좋은 요금제 / 지니뮤직/밀리의 서재/ 블라이스 셀렉트 중 1개 선택", data: "100GB+무제한(5Mbps)", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 55000 },
    { pid: "ppllistobj_0790", main_plan: "LTE", category: "Y 군인", title: "Y군인 55 PLUS", description: "현역병들의 여가시간을 즐겁게 사용하기 좋은 요금제 / 필수팩 L3(지니/밀리)", data: "100GB+무제한(5Mbps)", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 55000 },
    { pid: "ppllistobj_0772", main_plan: "LTE", category: "Y 군인", title: "Y군인 33", description: "현역병들의 여가시간을 즐겁게 데이터 일 2GB+최대 3Mbps 속도로 지속이용", data: "일 2GB+무제한(3Mbps)", tethering: "", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 33000 },
    // LTE 복지
    { pid: "ppllistobj_0776", main_plan: "LTE", category: "LTE 복지", title: "데이터 ON 나눔", description: "장애인을 위해 더 넉넉한 데이터를 제공. 데이터 소진 후에도 속도제어 사용 가능", data: "6GB+무제한(1Mbps)", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 49000 },
    { pid: "ppllistobj_0777", main_plan: "LTE", category: "LTE 복지", title: "나눔 베이직", description: "장애인을 위한 가성비 좋은 요금제 데이터 2GB에 집/이동전화,문자 기본제공", data: "2GB+데이터 밀당", tethering: "기본데이터 내 이용가능", roaming: "", voiceText: "집/이동전화 무제한/기본제공", price: 33000 },
    // LTE 순 선택형
    { pid: "ppllistobj_0678", main_plan: "LTE", category: "순 선택형(LTE)", title: "순 선택형100분2GB", description: "사용량에 맞게 선택할 수 있는 요금제 음성 100분+문자100건+2GB", data: "2GB", tethering: "", roaming: "", voiceText: "100분/100건", price: 30800 },
    { pid: "ppllistobj_0683", main_plan: "LTE", category: "순 선택형(LTE)", title: "순 선택형180분1GB", description: "사용량에 맞게 선택할 수 있는 요금제 음성 180분+문자180건+1GB", data: "1GB", tethering: "", roaming: "", voiceText: "180분/180건", price: 31900 },
    { pid: "ppllistobj_0677", main_plan: "LTE", category: "순 선택형(LTE)", title: "순 선택형100분1GB", description: "사용량에 맞게 선택할 수 있는 요금제 음성 100분+문자100건+1GB", data: "1GB", tethering: "", roaming: "", voiceText: "100분/100건", price: 27500 },
    { pid: "ppllistobj_0682", main_plan: "LTE", category: "순 선택형(LTE)", title: "순 선택형180분250MB", description: "사용량에 맞게 선택할 수 있는 요금제 음성 180분+문자180건+250MB", data: "250MB", tethering: "", roaming: "", voiceText: "180분/180건", price: 29700 },
    { pid: "ppllistobj_0676", main_plan: "LTE", category: "순 선택형(LTE)", title: "순 선택형100분250MB", description: "사용량에 맞게 선택할 수 있는 요금제 음성 100분+문자100건+250MB", data: "250MB", tethering: "", roaming: "", voiceText: "100분/100건", price: 20900 },
    // LTE 순 망내무한 선택형
    { pid: "ppllistobj_0701", main_plan: "LTE", category: "순 망내무한 선택형(LTE)", title: "순 망내무한선택형100분1GB", description: "사용량 맞춤 요금제 kt모바일은 무제한 그 외 음성 100분+문자기본제공+1GB", data: "1GB", tethering: "", roaming: "", voiceText: "100분/기본제공", price: 32230 },
    { pid: "ppllistobj_0706", main_plan: "LTE", category: "순 망내무한 선택형(LTE)", title: "순 망내무한선택형180분250MB", description: "사용량 맞춤 요금제 kt모바일은 무제한 그 외 음성 180분+문자기본제공+250MB", data: "250MB", tethering: "", roaming: "", voiceText: "180분/기본제공", price: 31020 },
    { pid: "ppllistobj_0700", main_plan: "LTE", category: "순 망내무한 선택형(LTE)", title: "순 망내무한선택형100분250MB", description: "사용량 맞춤 요금제 kt모바일은 무제한 그 외 음성 100분+문자기본제공+250MB", data: "250MB", tethering: "", roaming: "", voiceText: "100분/기본제공", price: 27830 },
]

// ─── 고정 3개 요금제 ──────────────────────────────────────────────────
const FIXED_PLAN_PIDS = [
    "ppllistobj_0942", // 90,000원 티빙/지니/밀리 초이스 베이직
    "ppllistobj_0808", // 69,000원 5G 심플 110GB
    "ppllistobj_0925", // 37,000원 5G 슬림 4GB
]
const FIXED_PLANS = FIXED_PLAN_PIDS.map((pid) => ALL_PLANS.find((p) => p.pid === pid)!)

// ─── 카테고리 필터 ────────────────────────────────────────────────────
const CATEGORIES_5G = ["전체", "5G 초이스", "5G 일반", "5G 청소년", "5G 주니어", "5G 시니어", "5G 군인", "5G 복지", "5G 외국인"]
const CATEGORIES_LTE = ["전체", "데이터ON", "Y데이터ON", "LTE 일반", "LTE Y틴(청소년)", "LTE Y 주니어", "LTE 시니어", "Y 군인", "LTE 복지", "순 선택형(LTE)", "순 망내무한 선택형(LTE)"]

// 사은품 제공 대상 요금제 PID (티빙/지니/밀리 초이스는 할인 제품 없음 — 제외)
const FREEBIE_PLAN_PIDS = new Set([
    "ppllistobj_0865", "ppllistobj_0864", "ppllistobj_0863",
    "ppllistobj_0850", "ppllistobj_0851", "ppllistobj_0852",
    "ppllistobj_0994", "ppllistobj_0993", "ppllistobj_0992",
])

// ─── 스켈레톤 ────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
    <motion.div
        style={{ width: "100%", height: 80, borderRadius: 10, backgroundColor: "#E5E7EB", boxSizing: "border-box" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
    />
)

// ─── 요금제 카드 (사은품 통합) ────────────────────────────────────────
const PlanCard = ({
    plan, isActive, discountLabel, onSelect,
    freebies, freebieLoading, selectedFreebie, onFreebieSelect,
}: {
    plan: Plan; isActive: boolean; discountLabel: string; onSelect: (p: Plan) => void
    freebies: any[]; freebieLoading: boolean; selectedFreebie: any; onFreebieSelect: (f: any) => void
}) => {
    const hasFreebiePlan = FREEBIE_PLAN_PIDS.has(plan.pid)
    const showFreebie = isActive && hasFreebiePlan
    const subtitle = [plan.data, plan.tethering ? `공유 데이터 ${plan.tethering}` : ""].filter(Boolean).join(" | ")

    return (
        <motion.div
            onClick={() => onSelect(plan)}
            whileTap={{ scale: 0.98 }}
            style={{
                width: "100%", display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px",
                border: showFreebie ? "1px solid #0066FF" : isActive ? "2px solid #0055FF" : "1.5px solid #E5E7EB",
                borderRadius: showFreebie ? 10.526 : 8,
                backgroundColor: showFreebie ? "#ECF4FF" : "#FFFFFF",
                cursor: "pointer", boxSizing: "border-box",
            }}
        >
            {/* 상단: 라디오 + 요금제명 + 서브타이틀 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isActive ? "#0055FF" : "#D1D5DB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxSizing: "border-box" }}>
                    {isActive && <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#0055FF" }} />}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{plan.title}</div>
                    {subtitle && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{subtitle}</div>}
                </div>
            </div>

            {/* 사은품 섹션 (사은품 대상 요금제 + 활성 상태일 때) */}
            {showFreebie && (
                <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>할인 제품 안내</div>

                    {freebieLoading ? (
                        <motion.div
                            style={{ width: "100%", height: 75, borderRadius: 9, backgroundColor: "#E5E7EB" }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ) : freebies.length > 0 ? (
                        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
                            {freebies.map((f) => {
                                return (
                                    <div
                                        key={f.no}
                                        style={{
                                            flexShrink: 0, width: 226, height: 75,
                                            padding: "13px 7px",
                                            display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
                                            borderRadius: 9, border: "0.8px solid #CFCFCF",
                                            backgroundColor: "#FFF", boxSizing: "border-box",
                                        }}
                                    >
                                        <img
                                            src={`https://juntell.s3.ap-northeast-2.amazonaws.com/freebie/${f.no}.png`}
                                            alt={f.title}
                                            style={{ width: 48, height: 48, objectFit: "contain", flexShrink: 0 }}
                                            onError={(e) => { e.currentTarget.style.display = "none" }}
                                        />
                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", lineHeight: 1.3 }}>{f.title}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>월 {(f.monthly_price ?? 0).toLocaleString()}원</span>
                                            <span style={{ fontSize: 11, color: "#9CA3AF" }}>할부 수수료 별도</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <span style={{ fontSize: 13, color: "#9CA3AF" }}>해당 요금제에 적용 가능한 할인 제품이 없습니다.</span>
                    )}

                    <div style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                        <span>할인 상품 · 초이스 유의사항 안내</span>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid #9CA3AF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}>?</span>
                    </div>
                </>
            )}

            {/* 하단: 할인라벨 + 월 요금 */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#0055FF", fontWeight: 500 }}>{discountLabel}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>월 {plan.price.toLocaleString()}원</span>
            </div>
        </motion.div>
    )
}

// ─── 직접 선택 카드 ───────────────────────────────────────────────────
const SelectableCard = ({
    plan, isActive, discountLabel, onOpen,
    freebies, freebieLoading, selectedFreebie, onFreebieSelect,
}: {
    plan: Plan | null; isActive: boolean; discountLabel: string; onOpen: () => void
    freebies: any[]; freebieLoading: boolean; selectedFreebie: any; onFreebieSelect: (f: any) => void
}) => {
    const hasFreebie = plan ? FREEBIE_PLAN_PIDS.has(plan.pid) : false
    const showFreebie = isActive && hasFreebie

    // 요금제 미선택: 다크 카드
    if (!plan) {
        return (
            <motion.div
                onClick={onOpen}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: "100%", display: "flex", flexDirection: "row", alignItems: "center", gap: 10, padding: "14px 16px",
                    border: "none",
                    borderRadius: 8, backgroundColor: "#1C1C1E", cursor: "pointer", boxSizing: "border-box",
                }}
            >
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxSizing: "border-box" }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", flex: 1 }}>직접 선택할래요</span>
            </motion.div>
        )
    }

    // 요금제 선택됨: PlanCard와 동일한 column 레이아웃
    const subtitle = [plan.data, plan.tethering ? `공유 데이터 ${plan.tethering}` : ""].filter(Boolean).join(" | ")

    return (
        <motion.div
            onClick={onOpen}
            whileTap={{ scale: 0.98 }}
            style={{
                width: "100%", display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px",
                border: showFreebie ? "1px solid #0066FF" : "2px solid #0055FF",
                borderRadius: showFreebie ? 10.526 : 8,
                backgroundColor: showFreebie ? "#ECF4FF" : "#FFFFFF",
                cursor: "pointer", boxSizing: "border-box",
            }}
        >
            {/* 상단: 라디오 + 요금제명 + 서브타이틀 + › */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #0055FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxSizing: "border-box" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#0055FF" }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{plan.title}</div>
                    {subtitle && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{subtitle}</div>}
                </div>
                <span style={{ fontSize: 18, color: "#9CA3AF", flexShrink: 0 }}>›</span>
            </div>

            {/* 사은품 섹션 (할인 제품 있는 요금제일 때만) */}
            {showFreebie && (
                <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>할인 제품 안내</div>

                    {freebieLoading ? (
                        <motion.div
                            style={{ width: "100%", height: 75, borderRadius: 9, backgroundColor: "#E5E7EB" }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ) : freebies.length > 0 ? (
                        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
                            {freebies.map((f) => (
                                <div
                                    key={f.no}
                                    style={{
                                        flexShrink: 0, width: 226, height: 75,
                                        padding: "13px 7px",
                                        display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
                                        borderRadius: 9, border: "0.8px solid #CFCFCF",
                                        backgroundColor: "#FFF", boxSizing: "border-box",
                                    }}
                                >
                                    <img
                                        src={`https://juntell.s3.ap-northeast-2.amazonaws.com/freebie/${f.no}.png`}
                                        alt={f.title}
                                        style={{ width: 48, height: 48, objectFit: "contain", flexShrink: 0 }}
                                        onError={(e) => { e.currentTarget.style.display = "none" }}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", lineHeight: 1.3 }}>{f.title}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>월 {(f.monthly_price ?? 0).toLocaleString()}원</span>
                                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>할부 수수료 별도</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span style={{ fontSize: 13, color: "#9CA3AF" }}>해당 요금제에 적용 가능한 할인 제품이 없습니다.</span>
                    )}

                    <div style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                        <span>할인 상품 · 초이스 유의사항 안내</span>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid #9CA3AF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}>?</span>
                    </div>
                </>
            )}

            {/* 하단: 할인라벨 + 월 요금 */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#0055FF", fontWeight: 500 }}>{discountLabel}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>월 {plan.price.toLocaleString()}원</span>
            </div>
        </motion.div>
    )
}

// ─── 팝업 내 요금제 카드 ──────────────────────────────────────────────
const PopupPlanCard = ({ plan, isSelected, onSelect }: { plan: Plan; isSelected: boolean; onSelect: (p: Plan) => void }) => (
    <motion.div
        onClick={() => onSelect(plan)}
        whileTap={{ scale: 0.985 }}
        style={{
            width: "100%", border: isSelected ? "2px solid #0055FF" : "1.5px solid #E5E7EB",
            borderRadius: 12, padding: "14px 16px", backgroundColor: "#FFFFFF",
            cursor: "pointer", boxSizing: "border-box", marginBottom: 8,
        }}
    >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? "#0055FF" : "#D1D5DB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, boxSizing: "border-box" }}>
                {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#0055FF" }} />}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 1 }}>{plan.title}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 }}>월 {plan.price.toLocaleString()}원</div>
                {plan.description && <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8, lineHeight: 1.4 }}>{plan.description}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, borderTop: "1px solid #F3F4F6", paddingTop: 8 }}>
                    {plan.data && <div style={{ display: "flex", gap: 6, fontSize: 12 }}><span style={{ color: "#9CA3AF", minWidth: 60 }}>데이터</span><span style={{ color: "#374151", fontWeight: 500 }}>{plan.data}</span></div>}
                    {plan.tethering && <div style={{ display: "flex", gap: 6, fontSize: 12 }}><span style={{ color: "#9CA3AF", minWidth: 60 }}>테더링</span><span style={{ color: "#374151", fontWeight: 500 }}>{plan.tethering}</span></div>}
                    {plan.roaming && <div style={{ display: "flex", gap: 6, fontSize: 12 }}><span style={{ color: "#9CA3AF", minWidth: 60 }}>로밍</span><span style={{ color: "#374151", fontWeight: 500 }}>{plan.roaming}</span></div>}
                    {plan.voiceText && <div style={{ display: "flex", gap: 6, fontSize: 12 }}><span style={{ color: "#9CA3AF", minWidth: 60 }}>음성/문자</span><span style={{ color: "#374151", fontWeight: 500 }}>{plan.voiceText}</span></div>}
                </div>
            </div>
        </div>
    </motion.div>
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function PlanBenefitSelector(props) {
    const {
        isLoading = false,
        selectedPlanPid = "",
        title = "원하시는 요금제",
        onPlanSelect,
        onTabChange,
        discountAmounts = {} as Record<string, number>,
        store = null,
        setStore = null,
    } = props

    const [activeTab, setActiveTab] = useState<"기기 할인" | "요금할인">("기기 할인")
    const [showPopup, setShowPopup] = useState(false)
    const [popupTab, setPopupTab] = useState<"5G" | "LTE">("5G")
    const [popupCategory, setPopupCategory] = useState("전체")
    const [searchQuery, setSearchQuery] = useState("")
    const [customPlan, setCustomPlan] = useState<Plan | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // ─── 사은품 fetch (선택된 요금제가 사은품 대상일 때만) ───────────────
    const [freebies, setFreebies] = useState<any[]>([])
    const [freebieLoading, setFreebieLoading] = useState(false)

    React.useEffect(() => {
        if (!selectedPlanPid || !FREEBIE_PLAN_PIDS.has(selectedPlanPid)) {
            setFreebies([])
            return
        }
        setFreebieLoading(true)
        fetch(`https://kt-market-puce.vercel.app/api/freebies?planId=${encodeURIComponent(selectedPlanPid)}`)
            .then(r => r.json())
            .then(data => setFreebies(Array.isArray(data) ? data : []))
            .catch(() => setFreebies([]))
            .finally(() => setFreebieLoading(false))
    }, [selectedPlanPid])

    // selectedPlanPid가 고정 플랜이 아닌 경우 ALL_PLANS에서 찾아 customPlan 초기화
    React.useEffect(() => {
        if (!selectedPlanPid) return
        if (FIXED_PLAN_PIDS.includes(selectedPlanPid)) {
            setCustomPlan(null)
            return
        }
        setCustomPlan((prev) => {
            if (prev?.pid === selectedPlanPid) return prev
            return ALL_PLANS.find((p) => p.pid === selectedPlanPid) ?? null
        })
    }, [selectedPlanPid])

    const selectedFreebie = store?.freebie ?? null
    const handleFreebieSelect = (freebie: any) => {
        if (!setStore) return
        setStore({ freebie: selectedFreebie?.no === freebie.no ? null : freebie })
    }

    // 팝업 열릴 때 스크롤 맨 위로
    const openPopup = () => {
        setShowPopup(true)
        setSearchQuery("")
        setTimeout(() => scrollRef.current?.scrollTo(0, 0), 50)
    }

    // 팝업 요금제 필터링
    const filteredPlans = useMemo(() => {
        let list = ALL_PLANS.filter((p) => p.main_plan === popupTab)
        if (popupCategory !== "전체") list = list.filter((p) => p.category === popupCategory)
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase()
            list = list.filter((p) =>
                p.title.toLowerCase().includes(q) ||
                p.price.toString().includes(q) ||
                p.data.toLowerCase().includes(q)
            )
        }
        return list
    }, [popupTab, popupCategory, searchQuery])

    const categories = popupTab === "5G" ? CATEGORIES_5G : CATEGORIES_LTE

    const handleFixedSelect = (plan: Plan) => onPlanSelect?.(plan)

    const handlePopupSelect = (plan: Plan) => {
        setCustomPlan(plan)
        onPlanSelect?.(plan)
    }

    const handleConfirm = () => setShowPopup(false)

    // 4번째 카드 활성 여부 (고정 3개 외의 요금제가 선택된 경우)
    const isFixedSelected = FIXED_PLAN_PIDS.includes(selectedPlanPid)
    const isCustomActive = !isFixedSelected && !!customPlan && selectedPlanPid === customPlan.pid

    const getDiscountLabel = (pid: string) => {
        const amt = discountAmounts[pid]
        if (!amt || amt <= 0) return "00만원 할인"
        const man = Math.round(amt / 10000)
        return man > 0 ? `${man}만원 할인` : `${amt.toLocaleString()}원 할인`
    }

    // 스켈레톤
    if (isLoading) {
        return (
            <div style={wrapperStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <motion.div style={{ width: 120, height: 18, borderRadius: 6, backgroundColor: "#E5E7EB" }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                <div style={columnStyle}>
                    {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} delay={i * 0.07} />)}
                </div>
            </div>
        )
    }

    return (
        <div style={wrapperStyle}>
            {/* ── 할인 방법 섹션 ── */}
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: '"Pretendard","Inter",sans-serif' }}>할인 방법</span>

            {/* 기기할인 / 요금할인 탭 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
                    {(["기기 할인", "요금할인"] as const).map((tab) => (
                        <button key={tab} onClick={() => { setActiveTab(tab); onTabChange?.(tab) }} style={{
                            flex: 1, height: 34, border: "none",
                            backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent",
                            color: activeTab === tab ? "#111827" : "#9CA3AF",
                            fontSize: 13, fontWeight: activeTab === tab ? 700 : 400, cursor: "pointer",
                            boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                            borderRadius: 6, margin: 3, transition: "all 0.15s",
                            fontFamily: '"Pretendard","Inter",sans-serif',
                        }}>{tab}</button>
                    ))}
                </div>
                {/* 탭 설명 */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="7" cy="7" r="6.5" stroke="#9CA3AF" />
                        <text x="7" y="11" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontWeight="600">i</text>
                    </svg>
                    <span style={{ fontSize: 12, color: "#6B7280", fontFamily: '"Pretendard","Inter",sans-serif' }}>
                        {activeTab === "기기 할인"
                            ? "통신사 지원금과 대리점 지원금을 함께 받아요"
                            : "선택약정 할인과 대리점 지원금을 함께 받아요"}
                    </span>
                </div>
            </div>

            {/* ── 요금제 섹션 ── */}
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: '"Pretendard","Inter",sans-serif' }}>요금제</span>

            {/* 요금제 컬럼 리스트 */}
            <div style={columnStyle}>
                {FIXED_PLANS.map((plan) => (
                    <PlanCard
                        key={plan.pid}
                        plan={plan}
                        isActive={selectedPlanPid === plan.pid}
                        discountLabel={getDiscountLabel(plan.pid)}
                        onSelect={handleFixedSelect}
                        freebies={selectedPlanPid === plan.pid ? freebies : []}
                        freebieLoading={selectedPlanPid === plan.pid ? freebieLoading : false}
                        selectedFreebie={selectedFreebie}
                        onFreebieSelect={handleFreebieSelect}
                    />
                ))}
                <SelectableCard
                    plan={isCustomActive ? customPlan : null}
                    isActive={isCustomActive}
                    discountLabel={isCustomActive && customPlan ? getDiscountLabel(customPlan.pid) : "00만원 할인"}
                    onOpen={openPopup}
                    freebies={isCustomActive ? freebies : []}
                    freebieLoading={isCustomActive ? freebieLoading : false}
                    selectedFreebie={selectedFreebie}
                    onFreebieSelect={handleFreebieSelect}
                />
            </div>

            {/* ── 팝업 ── */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                        onClick={() => setShowPopup(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: "100%", maxWidth: 480, backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
                        >
                            {/* 팝업 헤더 고정 영역 */}
                            <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
                                {/* 핸들 */}
                                <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", margin: "0 auto 12px" }} />

                                {/* 5G / LTE 탭 */}
                                <div style={{ display: "flex", borderBottom: "2px solid #E5E7EB", marginBottom: 10 }}>
                                    {(["5G", "LTE"] as const).map((t) => (
                                        <button key={t} onClick={() => { setPopupTab(t); setPopupCategory("전체"); setSearchQuery("") }} style={{
                                            flex: 1, height: 42, border: "none", backgroundColor: "transparent",
                                            color: popupTab === t ? "#111827" : "#9CA3AF",
                                            fontSize: 15, fontWeight: popupTab === t ? 700 : 400, cursor: "pointer",
                                            borderBottom: popupTab === t ? "2px solid #111827" : "2px solid transparent",
                                            marginBottom: -2, fontFamily: '"Pretendard","Inter",sans-serif',
                                        }}>{t}</button>
                                    ))}
                                </div>

                                {/* 검색창 */}
                                <div style={{ position: "relative", marginBottom: 10 }}>
                                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9CA3AF" }}>🔍</span>
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setPopupCategory("전체") }}
                                        placeholder="요금제 이름, 데이터, 금액 검색"
                                        style={{
                                            width: "100%", height: 40, paddingLeft: 36, paddingRight: 12,
                                            border: "1.5px solid #E5E7EB", borderRadius: 8,
                                            fontSize: 13, color: "#111827", outline: "none",
                                            boxSizing: "border-box", fontFamily: '"Pretendard","Inter",sans-serif',
                                        }}
                                    />
                                </div>

                                {/* 카테고리 필터 */}
                                <div style={{ display: "flex", flexWrap: "nowrap", gap: 6, paddingBottom: 10, overflowX: "auto", scrollbarWidth: "none" }}>
                                    {categories.map((cat) => (
                                        <button key={cat} onClick={() => { setPopupCategory(cat); setSearchQuery("") }} style={{
                                            padding: "4px 10px", borderRadius: 20, border: "1px solid #E5E7EB",
                                            backgroundColor: popupCategory === cat ? "#111827" : "#F9FAFB",
                                            color: popupCategory === cat ? "#FFFFFF" : "#374151",
                                            fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                                            fontFamily: '"Pretendard","Inter",sans-serif',
                                        }}>{cat}</button>
                                    ))}
                                </div>

                                {/* 결과 수 */}
                                <div style={{ fontSize: 12, color: "#9CA3AF", paddingBottom: 8 }}>
                                    {filteredPlans.length}개의 요금제
                                </div>
                            </div>

                            {/* 스크롤 목록 */}
                            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
                                {filteredPlans.length === 0 ? (
                                    <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 14, padding: "32px 0" }}>검색 결과가 없습니다</div>
                                ) : (
                                    filteredPlans.map((plan) => (
                                        <PopupPlanCard
                                            key={plan.pid}
                                            plan={plan}
                                            isSelected={selectedPlanPid === plan.pid || customPlan?.pid === plan.pid}
                                            onSelect={handlePopupSelect}
                                        />
                                    ))
                                )}
                            </div>

                            {/* 하단 확인 버튼 */}
                            <div style={{ padding: "10px 20px 24px", flexShrink: 0, borderTop: "1px solid #F3F4F6" }}>
                                <button
                                    onClick={handleConfirm}
                                    style={{
                                        width: "100%", height: 52,
                                        backgroundColor: customPlan ? "#0055FF" : "#E5E7EB",
                                        color: customPlan ? "#FFFFFF" : "#9CA3AF",
                                        border: "none", borderRadius: 12,
                                        fontSize: 16, fontWeight: 700,
                                        cursor: customPlan ? "pointer" : "default",
                                        fontFamily: '"Pretendard","Inter",sans-serif',
                                    }}
                                >
                                    {customPlan ? `${customPlan.title} 선택하기` : "요금제를 선택해주세요"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── 스타일 ────────────────────────────────────────────────────────────
const wrapperStyle: React.CSSProperties = {
    width: "100%", display: "flex", flexDirection: "column", gap: 12,
    boxSizing: "border-box", fontFamily: '"Pretendard","Inter",sans-serif',
}
const columnStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8 }
const stepBadge: React.CSSProperties = { width: 24, height: 24, borderRadius: 6, backgroundColor: "#111827", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }
const stepText: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#FFFFFF" }

// ─── Framer 컨트롤 ────────────────────────────────────────────────────
addPropertyControls(PlanBenefitSelector, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    stepNumber: { type: ControlType.Number, title: "Step No.", defaultValue: 4, min: 1, max: 9 },
    title: { type: ControlType.String, title: "Title", defaultValue: "원하시는 요금제" },
    selectedPlanPid: { type: ControlType.String, title: "Selected Plan PID" },
})
