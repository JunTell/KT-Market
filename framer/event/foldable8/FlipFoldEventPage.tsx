// Flip · Fold 사전예약 — 통합 페이지
// Hero · 알림 필수 · 통계 · 이유 · 혜택 · 사은품 · 후기를 한 페이지로 구성
//
// 로컬 컴포넌트 import: Framer에서 발행한 후 URL import 로 교체 가능

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import FlipFoldHeroSection from "./FlipFoldHeroSection"
import FlipFoldNoticeSection from "./FlipFoldNoticeSection"
import FlipFoldStatsSection from "./FlipFoldStatsSection"
import FlipFoldReasonsSection from "./FlipFoldReasonsSection"
import FlipFoldExtraBenefitsSection from "./FlipFoldExtraBenefitsSection"
import FlipFoldGiftsSection from "./FlipFoldGiftsSection"
import FlipFoldReviewsSection from "./FlipFoldReviewsSection"

const FONT = '"Cafe24 Ohsquare", "Cafe24 Ohsquare OTF", sans-serif'

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FlipFoldEventPage(props) {
    const {
        heroImage,
        kakaoLink = "http://pf.kakao.com/_HfItxj/chat",
        phoneLink = "tel:1522-6562",
        applyLink = "#flip-fold-apply",
        showHero = true,
        showNotice = true,
        showStats = true,
        showReasons = true,
        showExtraBenefits = true,
        showGifts = true,
        showReviews = true,
        style,
    } = props

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                fontFamily: FONT,
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                ...style,
            }}
        >
            {showHero && <FlipFoldHeroSection heroImage={heroImage} />}
            {showNotice && (
                <div id="flip-fold-apply" style={{ scrollMarginTop: 0 }}>
                    <FlipFoldNoticeSection ctaLink={applyLink} />
                </div>
            )}
            {showStats && <FlipFoldStatsSection />}
            {showReasons && (
                <FlipFoldReasonsSection
                    kakaoLink={kakaoLink}
                    phoneLink={phoneLink}
                />
            )}
            {showExtraBenefits && <FlipFoldExtraBenefitsSection />}
            {showGifts && <FlipFoldGiftsSection />}
            {showReviews && <FlipFoldReviewsSection ctaLink={applyLink} />}
        </div>
    )
}

addPropertyControls(FlipFoldEventPage, {
    heroImage: { type: ControlType.Image, title: "Hero 이미지" },
    kakaoLink: {
        type: ControlType.String,
        title: "카카오 상담 링크",
        defaultValue: "http://pf.kakao.com/_HfItxj/chat",
    },
    phoneLink: {
        type: ControlType.String,
        title: "전화 상담 링크",
        defaultValue: "tel:1522-6562",
    },
    applyLink: {
        type: ControlType.String,
        title: "신청 링크",
        defaultValue: "#flip-fold-apply",
    },
    showHero: { type: ControlType.Boolean, title: "Hero", defaultValue: true },
    showNotice: { type: ControlType.Boolean, title: "알림 필수", defaultValue: true },
    showStats: { type: ControlType.Boolean, title: "통계 증명", defaultValue: true },
    showReasons: { type: ControlType.Boolean, title: "좋은 이유", defaultValue: true },
    showExtraBenefits: {
        type: ControlType.Boolean,
        title: "놓치기 쉬운 혜택",
        defaultValue: true,
    },
    showGifts: {
        type: ControlType.Boolean,
        title: "프리미엄 사은품",
        defaultValue: true,
    },
    showReviews: { type: ControlType.Boolean, title: "후기 + CTA", defaultValue: true },
})
