import { addPropertyControls, ControlType } from "framer"
import { createClient } from "@supabase/supabase-js"
import React, { useEffect, useState } from "react"

const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const FONT = '"Pretendard", "Inter", sans-serif'

const brandMap: Record<string, string> = {
    삼성: "samsung",
    애플: "apple",
    기타: "etc",
}

const categoryMap: Record<string, string[]> = {
    삼성: ["S 시리즈", "Z 시리즈", "A 시리즈"],
    애플: ["아이폰 17", "아이폰 16", "아이폰 15", "아이폰 14"],
    기타: [],
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
export default function PhoneCatalogPage(props) {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])

    const [selectedBrand, setSelectedBrand] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedSubCategory, setSelectedSubCategory] = useState("")

    const [isClient, setIsClient] = useState(false)
    const [hideFilter, setHideFilter] = useState(false)
    const [isVisiblePlayer, setIsVisiblePlayer] = useState(false)
    const [isVisibleMainBanner, setIsVisibleMainBanner] = useState(false)
    const [mainBannerURL, setMainBannerURL] = useState("")
    const [videoURL, setVideoURL] = useState("")

    const handleOnClick = (product) => {
        window.location.href = `/phone/${product.model}`
    }

    const fetchDevices = async () => {
        try {
            const { data: devices, error } = await supabase
                .from("devices")
                .select("*")
                .eq("is_available", true)
            if (error) throw error

            // pet_name에서 용량 표기 제거
            const storageKeywords = ["128GB", "256GB", "512GB", "1TB"]
            devices.forEach((product) => {
                if (typeof product.pet_name === "string") {
                    storageKeywords.forEach((kw) => {
                        product.pet_name = product.pet_name.replace(kw, "").trim()
                    })
                }
            })

            // 최저 용량 모델만 표시
            const filtered = devices.filter(
                (p) => p.capacities?.[0] === p.capacity
            )
            setProducts(filtered)
        } catch (err) {
            console.error("fetchDevices error:", err)
        }
    }

    // 초기화
    useEffect(() => {
        setIsClient(true)

        if (props.brand) {
            setSelectedBrand(props.brand)
        } else {
            const params = new URLSearchParams(window.location.search)
            const brand = params.get("brand") ?? ""
            const category = params.get("category") ?? ""
            const subCategory = params.get("sub-category") ?? ""

            if (brand) setSelectedBrand(brand)
            if (category) setSelectedCategory(category)
            if (subCategory) setSelectedSubCategory(subCategory)
            if (brand && category) setHideFilter(true)
        }

        fetchDevices()
    }, [])

    // 필터링 + 비디오/배너 설정
    useEffect(() => {
        if (products.length === 0) return

        const lastPath =
            typeof window !== "undefined"
                ? window.location.pathname.split("/").filter(Boolean).pop()
                : ""
        const params = new URLSearchParams(
            typeof window !== "undefined" ? window.location.search : ""
        )
        const brand = params.get("brand") ?? selectedBrand
        const category = params.get("category") ?? selectedCategory
        const subCategory = params.get("sub-category") ?? selectedSubCategory

        // 비디오/배너 설정
        switch (lastPath) {
            case "apple":
                setIsVisibleMainBanner(true)
                setMainBannerURL(
                    "https://framerusercontent.com/images/hQqRf9KXTIIjEexGc76ihqzSfo.jpeg?scale-down-to=1024&width=3942&height=864"
                )
                break
            case "phone":
                if (brand === "애플" && category === "아이폰 17") {
                    setIsVisibleMainBanner(true)
                    setMainBannerURL(
                        "https://framerusercontent.com/images/hQqRf9KXTIIjEexGc76ihqzSfo.jpeg?scale-down-to=1024&width=3942&height=864"
                    )
                } else if (brand === "삼성") {
                    if (category === "Z시리즈" && subCategory === "폴더블7") {
                        setIsVisiblePlayer(true)
                        setVideoURL("https://www.youtube.com/embed/LhsplcD8yPg?si=z-v0B-uMJChw_E-I")
                    } else if (category === "Z시리즈" || category === "S시리즈") {
                        setIsVisiblePlayer(true)
                        setVideoURL("https://www.youtube.com/embed/Q3mIdoJgO50?si=C0jPKC4holLhz3zM")
                    }
                } else if (!brand) {
                    setIsVisiblePlayer(true)
                    setVideoURL("https://www.youtube.com/embed/FGWEE5IFu8I?si=NEx_8zBeMVLlKhET")
                }
                break
            case "etc":
                setIsVisiblePlayer(true)
                setVideoURL("https://www.youtube.com/embed/PUQfcMPfifw?si=bpGUIbDTRM17iEtY")
                break
        }

        // 필터링
        let result = [...products]
        let isSpecialPage = false

        if (lastPath === "iphone16") {
            isSpecialPage = true
            result = result.filter((p) => p.category_kr === "아이폰 16")
        } else if (lastPath === "iphone17") {
            isSpecialPage = true
            result = result.filter((p) => p.category_kr === "아이폰 17")
        } else if (lastPath === "foldable7") {
            isSpecialPage = true
            const codes = ["sm-f966", "sm-f766", "sm-f761"]
            result = result.filter((p) => codes.some((c) => p.category?.startsWith(c)))
        } else if (lastPath === "s25") {
            isSpecialPage = true
            const codes = ["sm-s931", "sm-s937", "sm-s731", "sm-s938", "sm-s942", "sm-s947", "sm-s948"]
            result = result.filter((p) => codes.some((c) => p.category?.startsWith(c)))
        }

        if (!isSpecialPage) {
            if (selectedBrand) {
                const en = brandMap[selectedBrand]
                result = result.filter((p) => p.company === en)
            }
            if (selectedCategory) {
                result = result.filter(
                    (p) =>
                        p.category_kr.replace(/\s+/g, "") ===
                        selectedCategory.replace(/\s+/g, "")
                )
            }
            if (selectedSubCategory) {
                const subCategoryFilterMap: Record<string, string[]> = {
                    폴더블7: ["sm-f966nk", "sm-f966nk512", "sm-f766nk", "sm-f766nk512"],
                    폴더블6: ["sm-f956nk", "sm-f741nk"],
                    폴더블5: ["sm-f946nk", "sm-f731nk"],
                    S25: ["sm-s931nk", "sm-s936nk", "sm-s938nk", "sm-s937nk", "sm-s942nk", "sm-s947nk", "sm-s948nk"],
                    S24: ["sm-s921nk", "sm-s926nk", "sm-s928nk", "sm-s721nk"],
                }
                const targets = subCategoryFilterMap[selectedSubCategory]
                if (targets) {
                    result = result.filter((p) => targets.includes(p.category))
                } else {
                    result = result.filter((p) => p.category === selectedSubCategory)
                }
            }
        }

        // 출시일 내림차순 정렬
        result.sort(
            (a, b) =>
                new Date(b.release_date).getTime() -
                new Date(a.release_date).getTime()
        )

        setFilteredProducts(result)
    }, [selectedBrand, selectedCategory, selectedSubCategory, products])

    return (
        <div style={{ fontFamily: FONT }}>
            {isClient && !hideFilter && (
                <BrandModelFilter
                    selectedBrand={selectedBrand}
                    setSelectedBrand={(brand) => {
                        setSelectedBrand(brand)
                        setSelectedCategory("")
                    }}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            )}

            {isVisibleMainBanner && mainBannerURL && (
                <a href="/form-iphone17/stock" style={{ display: "block" }}>
                    <img
                        src={mainBannerURL}
                        alt="배너"
                        style={{ width: "100%", objectFit: "cover" }}
                    />
                </a>
            )}

            {isVisiblePlayer && videoURL && (
                <div style={{ backgroundColor: "#000", padding: "40px 0" }}>
                    <div
                        style={{
                            position: "relative",
                            width: "90%",
                            margin: "0 auto",
                            paddingTop: "56.25%",
                        }}
                    >
                        <iframe
                            src={videoURL + "&modestbranding=1&rel=0&showinfo=0"}
                            title="YouTube video player"
                            style={{
                                position: "absolute",
                                top: 0, left: 0,
                                width: "100%", height: "100%",
                                border: "none",
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            <div>
                {products.length === 0 ? (
                    <SkeletonList />
                ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
                        해당 조건의 기기가 없습니다
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <ProductCard
                            key={product.model}
                            product={product}
                            onClick={() => handleOnClick(product)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

addPropertyControls(PhoneCatalogPage, {
    brand: {
        type: ControlType.Enum,
        title: "제조사",
        options: ["", "삼성", "애플", "기타"],
        optionTitles: ["선택 안 함", "삼성", "애플", "기타"],
    },
    category: {
        type: ControlType.String,
        title: "모델",
        placeholder: "예: S 시리즈",
    },
    subCategory: {
        type: ControlType.String,
        title: "세부 모델",
        placeholder: "예: S24",
    },
})

// ─── 브랜드/모델 필터 ─────────────────────────────────────────────────
function BrandModelFilter({ selectedBrand, setSelectedBrand, selectedCategory, setSelectedCategory }) {
    const brands = ["삼성", "애플", "기타"]
    const categories = categoryMap[selectedBrand] ?? []

    return (
        <div style={{ borderBottom: "1px solid #F1F3F5" }}>
            {/* 브랜드 탭 */}
            <div
                style={{
                    display: "flex",
                    gap: 0,
                    borderBottom: "1px solid #F1F3F5",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    padding: "0 16px",
                }}
            >
                <button
                    onClick={() => setSelectedBrand("")}
                    style={tabStyle(selectedBrand === "")}
                >
                    전체
                </button>
                {brands.map((brand) => (
                    <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        style={tabStyle(selectedBrand === brand)}
                    >
                        {brand}
                    </button>
                ))}
            </div>

            {/* 카테고리 탭 (브랜드 선택 시) */}
            {selectedBrand && categories.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        padding: "10px 16px",
                        overflowX: "auto",
                        scrollbarWidth: "none",
                    }}
                >
                    <button
                        onClick={() => setSelectedCategory("")}
                        style={chipStyle(selectedCategory === "")}
                    >
                        전체
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={chipStyle(selectedCategory === cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flexShrink: 0,
    background: "none",
    border: "none",
    borderBottom: isActive ? "2px solid #111827" : "2px solid transparent",
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: isActive ? 700 : 400,
    color: isActive ? "#111827" : "#9CA3AF",
    cursor: "pointer",
    fontFamily: FONT,
    transition: "color 0.15s",
    marginBottom: -1,
})

const chipStyle = (isActive: boolean): React.CSSProperties => ({
    flexShrink: 0,
    background: isActive ? "#111827" : "#F3F4F6",
    border: "none",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#FFFFFF" : "#374151",
    cursor: "pointer",
    fontFamily: FONT,
    transition: "background 0.15s, color 0.15s",
})

// ─── 상품 카드 ────────────────────────────────────────────────────────
function ProductCard({ product, onClick }) {
    const imageURL = (() => {
        const colorKey = product.thumbnail || product.colors_en?.[0] || "black"
        const imageList = product.images?.[colorKey] ?? []
        if (imageList.length === 0) return ""
        return `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${product.category}/${colorKey}/${imageList[0]}.png`
    })()

    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 20px",
                borderBottom: "1px solid #F4F4F5",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                fontFamily: FONT,
            }}
        >
            {/* 이미지 */}
            <div
                style={{
                    width: 100,
                    height: 100,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {imageURL ? (
                    <img
                        src={imageURL}
                        alt={product.pet_name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "#F3F4F6", borderRadius: 8 }} />
                )}
            </div>

            {/* 정보 */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                    {product.pet_name}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {product.category_kr}
                </div>

                {/* 색상 도트 */}
                {Array.isArray(product.colors_code) && product.colors_code.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                        {product.colors_code.slice(0, 6).map((code, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    backgroundColor: code,
                                    boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 화살표 */}
            <svg
                width={20} height={20}
                viewBox="0 0 24 24" fill="none"
                stroke="#D1D5DB" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}
            >
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </div>
    )
}

// ─── 스켈레톤 ─────────────────────────────────────────────────────────
function SkeletonList() {
    return (
        <>
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "18px 20px",
                        borderBottom: "1px solid #F4F4F5",
                    }}
                >
                    <div style={{ width: 100, height: 100, borderRadius: 8, backgroundColor: "#E5E7EB", flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ width: "60%", height: 16, borderRadius: 6, backgroundColor: "#E5E7EB" }} />
                        <div style={{ width: "40%", height: 12, borderRadius: 6, backgroundColor: "#E5E7EB" }} />
                        <div style={{ width: "30%", height: 10, borderRadius: 6, backgroundColor: "#E5E7EB" }} />
                    </div>
                </div>
            ))}
        </>
    )
}
