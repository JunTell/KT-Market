// 가정의 달 이벤트 - 통합 페이지
// 모든 섹션을 한 화면에 조합한 풀 페이지 컴포넌트
//
// 섹션 순서:
//   1. HeroSection         (PNG 이미지)
//   2. BuyNowSection       (특가 핸드폰 자동 가격 계산)
//   3. DeliverySection     (PNG 이미지)
//   4. WhyKTMarketSection  (PNG 이미지)
//   5. ReviewSection       (생생한 후기 가로 슬라이드)

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import FamilyMonthHeroSection from "https://framer.com/m/FamilyMonthHeroSection-JvFflt.js@pSnmMSyCO8Hc9lK9Ce2a"
import FamilyMonthBuyNowSection from "https://framer.com/m/FamilyMonthBuyNowSection-KPp1n1.js@7tnv4hiSNZN63hFMJvau"
import FamilyMonthDeliverySection from "https://framer.com/m/FamilyMonthDeliverySection-6aYx7g.js@cl6kv6v8mIfWyktg436Y"
import FamilyMonthWhyKTMarketSection from "https://framer.com/m/FamilyMonthWhyKTMarketSection-qWOCi5.js@MDYrOeR2dbVJTZWDMCki"
import FamilyMonthReviewSection from "https://framer.com/m/FamilyMonthReviewSection-tRjyCQ.js@r2sMqdBeR5TzmsuNTiqN"
import FamilyMonthBottomCTA from "https://framer.com/m/FamilyMonthBottomCTA-AoWTk1.js@M7ljif8PYUDpAgfev8qA"

const FONT = '"Pretendard", "Inter", sans-serif'

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FamilyMonthEventPage(props) {
    const {
        heroImage,
        deliveryImage,
        whyKTImage,
        kakaoLink = "https://pf.kakao.com/",
        applyLink = "",
        showHero = true,
        showBuyNow = true,
        showDelivery = true,
        showWhyKT = true,
        showReview = true,
        showBottomCTA = true,
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
            {showHero && <FamilyMonthHeroSection heroImage={heroImage} />}
            {showBuyNow && <FamilyMonthBuyNowSection />}
            {showDelivery && <FamilyMonthDeliverySection image={deliveryImage} />}
            {showWhyKT && <FamilyMonthWhyKTMarketSection image={whyKTImage} />}
            {showReview && <FamilyMonthReviewSection />}
            {showBottomCTA && (
                <FamilyMonthBottomCTA
                    kakaoLink={kakaoLink}
                    applyLink={applyLink}
                />
            )}
        </div>
    )
}

addPropertyControls(FamilyMonthEventPage, {
    heroImage: {
        type: ControlType.Image,
        title: "Hero 이미지",
    },
    deliveryImage: {
        type: ControlType.Image,
        title: "배송 섹션 이미지",
    },
    whyKTImage: {
        type: ControlType.Image,
        title: "왜 KT마켓 이미지",
    },
    kakaoLink: {
        type: ControlType.String,
        title: "카카오 상담 링크",
        defaultValue: "https://pf.kakao.com/",
    },
    applyLink: {
        type: ControlType.String,
        title: "신청 링크",
        defaultValue: "",
    },
    showHero: { type: ControlType.Boolean, title: "Hero 노출", defaultValue: true },
    showBuyNow: { type: ControlType.Boolean, title: "특가 핸드폰", defaultValue: true },
    showDelivery: { type: ControlType.Boolean, title: "배송 프로세스", defaultValue: true },
    showWhyKT: { type: ControlType.Boolean, title: "왜 KT마켓", defaultValue: true },
    showReview: { type: ControlType.Boolean, title: "후기 섹션", defaultValue: true },
    showBottomCTA: { type: ControlType.Boolean, title: "하단 CTA 바", defaultValue: true },
})
