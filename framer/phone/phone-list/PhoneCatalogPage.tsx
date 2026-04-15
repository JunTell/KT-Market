import { addPropertyControls, ControlType } from "framer"
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Box,
    Button,
    Stack,
    Flex,
} from "@chakra-ui/react"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { createClient } from "@supabase/supabase-js"
import React, { useEffect, useState } from "react"

const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 표시하지 않을 모델 목록
const OBSOLETE_MODELS = new Set([
    "aip16-128", "aip16-256", "aip16-512",
    "aip16p-128", "aip16p-256", "aip16p-512",
    "aip16pm-256", "aip16pm-512",
    "aip16ps-128", "aip16ps-256", "aip16ps-512",
    "aip15-512",
    "aip15p-128", "aip15p-512",
    "aip15pm-256", "aip15pm-512",
    "aip15ps-128", "aip15ps-256", "aip15ps-512",
    "aip13-128",
    "sm-s931nk", "sm-s931nk512",
    "sm-s721nk",
    "sm-s928nk",
])

// model 또는 category 어느 쪽이든 매칭되면 인식
const matchesApple = (s: string, prefix: string) =>
    s.startsWith(prefix)

// 모델별 명시적 정렬 우선순위 (숫자 낮을수록 상단)
const getModelPriority = (prod, brand = ""): number => {
    const model = (prod.model ?? "").toLowerCase()
    const cat   = (prod.category ?? "").toLowerCase()

    // model / category 둘 중 하나라도 매칭되면 Apple 계열로 인식
    const isAip = (prefix: string) =>
        matchesApple(model, prefix) || matchesApple(cat, prefix)

    // 애플 단독 선택 시: 17e → 17 → 17Pro → 17ProMax → 16e → 16 → ...
    if (brand === "애플") {
        if (isAip("aip17e"))  return 1
        if (isAip("aip17pm")) return 4   // Pro Max — aip17p- 보다 먼저 체크
        if (isAip("aip17p-")) return 3
        if (isAip("aip17-"))  return 2
        if (model === "aip16e" || cat === "aip16e") return 10
        if (isAip("aip16pm")) return 13
        if (isAip("aip16p-")) return 12
        if (isAip("aip16-"))  return 11
        return 99
    }

    // 전체 / 삼성: S26 → S26 Ultra → S26+ → iPhone 17 → 17e → 17Pro → 17ProMax → S25 계열 ...
    if (model.startsWith("sm-s942")) return 1   // S26
    if (model.startsWith("sm-s948")) return 2   // S26 Ultra
    if (model.startsWith("sm-s947")) return 3   // S26+
    if (isAip("aip17e"))             return 5   // iPhone 17e
    if (isAip("aip17pm"))            return 7   // iPhone 17 Pro Max — 반드시 aip17p- 앞에
    if (isAip("aip17p-"))            return 6   // iPhone 17 Pro
    if (isAip("aip17-"))             return 4   // iPhone 17
    if (model.startsWith("sm-s731")) return 10  // S25 FE
    if (model.startsWith("sm-s928")) return 11  // S25 Ultra
    if (model.startsWith("sm-s926")) return 12  // S25+
    if (model.startsWith("sm-s931")) return 13  // S25
    if (model.startsWith("sm-s937")) return 14  // S25 Edge
    if (model.startsWith("sm-f9"))   return 20
    if (model.startsWith("sm-f7"))   return 21
    if (model.startsWith("sm-a"))    return 40
    if (model === "aip16e" || cat === "aip16e") return 30
    if (isAip("aip16pm"))            return 33
    if (isAip("aip16p-"))            return 32
    if (isAip("aip16-"))             return 31
    return 99
}

export default function PhoneListPage(props) {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [selectedBrand, setSelectedBrand] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedSubCategory, setSelectedSubCategory] = useState("")

    const [isClient, setIsClient] = useState(false)
    const [hideFilter, setHideFilter] = useState(false)
    const [isVisibleMainBanner, setIsVisibleMainBanner] = useState(false)
    const [mainBannerURL, setMainBannerURL] = useState("")

    const brandMap = {
        삼성: "samsung",
        애플: "apple",
        기타: "etc",
    }

    const handleOnClick = (product) => {
        window.location.href = `/phone/${product.model}`
    }

    const filterLowestDevices = (products) => {
        return products.filter((product) =>
            product.capacities?.[0] === product.capacity &&
            product.is_available === true &&
            !OBSOLETE_MODELS.has(product.model)
        )
    }

    const fetchDevices = async () => {
        const samsungChoicePlanId = "ppllistobj_0937"

        try {
            const { data: devices, error } = await supabase
                .from("devices")
                .select(`*, device_plans_chg (model, model_price, plan_id, name, disclosure_subsidy)`)
                .eq("device_plans_chg.plan_id", samsungChoicePlanId)

            const storageKeywords = ["128GB", "256GB", "512GB", "1TB"]
            devices.forEach((product) => {
                if (typeof product.pet_name === "string") {
                    storageKeywords.forEach((keyword) => {
                        product.pet_name = product.pet_name.replace(keyword, "").trim()
                    })
                }
            })

            setProducts(filterLowestDevices(devices) ?? [])
            if (error) throw error
        } catch (error) {
            console.log("Fetched Devices with Plans: ", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setIsClient(true)

        if (props.brand) {
            setSelectedBrand(props.brand)
        } else {
            const queryParams = new URLSearchParams(window.location.search)
            const brand = queryParams.get("brand")
            const category = queryParams.get("category")
            const subCategory = queryParams.get("sub-category")

            if (brand) setSelectedBrand(brand)
            if (category) setSelectedCategory(category)
            if (subCategory) setSelectedSubCategory(subCategory)
            if (brand && category) setHideFilter(true)
        }
    }, [])

    // 필터링 + 배너
    useEffect(() => {
        const lastPath =
            typeof window !== "undefined"
                ? window.location.pathname.split("/").filter(Boolean).pop()
                : ""
        const queryParams = new URLSearchParams(window.location.search)
        const brand = queryParams.get("brand")
        const category = queryParams.get("category")
        const subCategory = queryParams.get("sub-category")

        // 특수 페이지 설정 (유튜브 제거)
        switch (lastPath) {
            case "iphone17":
            case "iphone16":
            case "foldable7":
            case "s25":
                setHideFilter(true)
                break
            case "apple":
                break
            case "phone":
                break
        }

        let filtered = products
        let isSpecialPage = false

        if (lastPath === "iphone16") {
            isSpecialPage = true
            filtered = filtered.filter((product) => product.category_kr === "아이폰 16")
        } else if (lastPath === "foldable7") {
            isSpecialPage = true
            const targetCodes = ["sm-f966", "sm-f766", "sm-f761"]
            filtered = filtered.filter((product) =>
                targetCodes.some((code) => product.category?.startsWith(code))
            )
        } else if (lastPath === "s25") {
            isSpecialPage = true
            const targetCodes = ["sm-s931", "sm-s937", "sm-s731", "sm-s938", "sm-s942", "sm-s947", "sm-s948"]
            filtered = filtered.filter((product) =>
                targetCodes.some((code) => product.category?.startsWith(code))
            )
        } else if (lastPath === "iphone17") {
            isSpecialPage = true
            filtered = filtered.filter((product) => product.category_kr === "아이폰 17")
        }

        if (!isSpecialPage) {
            if (selectedBrand) {
                const englishBrand = brandMap[selectedBrand]
                filtered = filtered.filter((product) => {
                    if (product.company === englishBrand) return true
                    if (product.category === "aip16e") return englishBrand === "apple"
                    return false
                })
            }
            if (selectedCategory) {
                filtered = filtered.filter(
                    (product) =>
                        product.category_kr.replace(/\s+/g, "") ===
                        selectedCategory.replace(/\s+/g, "")
                )
            }
            if (selectedSubCategory) {
                if (selectedSubCategory === "폴더블7") {
                    filtered = filtered.filter((product) =>
                        product.category === "sm-f966nk" ||
                        product.category === "sm-f966nk512" ||
                        product.category === "sm-f766nk" ||
                        product.category === "sm-f766nk512"
                    )
                } else if (selectedSubCategory === "폴더블6") {
                    filtered = filtered.filter((product) =>
                        product.category === "sm-f956nk" || product.category === "sm-f741nk"
                    )
                } else if (selectedSubCategory === "폴더블5") {
                    filtered = filtered.filter((product) =>
                        product.category === "sm-f946nk" || product.category === "sm-f731nk"
                    )
                } else if (selectedSubCategory === "S25") {
                    filtered = filtered.filter((product) =>
                        product.category === "sm-s931nk" ||
                        product.category === "sm-s936nk" ||
                        product.category === "sm-s938nk" ||
                        product.category === "sm-s937nk" ||
                        product.category === "sm-s942nk" ||
                        product.category === "sm-s947nk" ||
                        product.category === "sm-s948nk"
                    )
                } else if (selectedSubCategory === "S24") {
                    filtered = filtered.filter((product) =>
                        product.category === "sm-s921nk" ||
                        product.category === "sm-s926nk" ||
                        product.category === "sm-s928nk" ||
                        product.category === "sm-s721nk"
                    )
                } else {
                    filtered = filtered.filter((product) => product.category === selectedSubCategory)
                }
            }
        }

        // 모델 우선순위 정렬 → 동일 티어 내 출시일 최신순
        filtered.sort((a, b) => {
            const pa = getModelPriority(a, selectedBrand)
            const pb = getModelPriority(b, selectedBrand)
            if (pa !== pb) return pa - pb
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        })

        setFilteredProducts(filtered)
    }, [selectedBrand, selectedCategory, selectedSubCategory, products])

    useEffect(() => {
        fetchDevices()
    }, [])

    return (
        <div>
            {isClient && !hideFilter && (
                <BrandModelFilter
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            )}
            <div style={{ display: "grid", gap: "8px" }}>
                {isVisibleMainBanner && mainBannerURL && (
                    <a href="/form-iphone17/stock" style={{ display: "block" }}>
                        <img src={mainBannerURL} alt="배너" style={{ width: "100%", objectFit: "cover" }} />
                    </a>
                )}
                <div>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))
                    ) : (
                        filteredProducts.map((product, index) => (
                            <ProductCard
                                key={index}
                                rank={index + 1}
                                product={product}
                                onClick={() => handleOnClick(product)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(PhoneListPage, {
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

function BrandModelFilter({ selectedBrand, setSelectedBrand, selectedCategory, setSelectedCategory }) {
    const brands = ["삼성", "애플", "기타"]
    const categories = {
        삼성: ["S 시리즈", "Z 시리즈", "A 시리즈"],
        애플: ["아이폰 17", "아이폰 16", "아이폰 15", "아이폰 14"],
        기타: ["Mi 시리즈", "A 시리즈", "Redmi 시리즈"],
    }

    const [openBrandAccordionIndex, setOpenBrandAccordionIndex] = useState<number>(-1)
    const [openModelAccordionIndex, setOpenModelAccordionIndex] = useState<number>(-1)

    const isBrandOpen = openBrandAccordionIndex === 0
    const isModelOpen = openModelAccordionIndex === 0

    return (
        <Flex width="100%">
            <Accordion
                allowToggle
                index={openBrandAccordionIndex}
                onChange={(index) => {
                    const idx = index as number
                    setOpenBrandAccordionIndex(idx)
                    if (idx === 0) setOpenModelAccordionIndex(-1)
                }}
                flex="1"
            >
                <AccordionItem border="none" bg="white">
                    <AccordionButton
                        bg="white" h="40px" fontSize="12px" width="100%"
                        border="none" padding="0px 20px"
                        borderBottom="1px solid #F4F4F5" borderRight="1px solid #F4F4F5"
                    >
                        <Box flex="1" textAlign="left">{selectedBrand || "제조사 선택"}</Box>
                        <ChevronDownIcon
                            boxSize={20}
                            transform={isBrandOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            transition="transform 0.3s ease-in-out"
                        />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <Stack spacing={0} width="100%">
                            {brands.map((brand) => (
                                <Button
                                    key={brand}
                                    justifyContent="flex-start" bg="white" border="none"
                                    onClick={() => {
                                        setSelectedBrand(brand)
                                        setSelectedCategory("")
                                        setOpenBrandAccordionIndex(-1)
                                    }}
                                    colorScheme={selectedBrand === brand ? "blue" : "gray"}
                                    width="100%" fontSize="12px" h="40px" pl="20px"
                                    borderBottom="1px solid #F4F4F5" borderRight="1px solid #F4F4F5"
                                >
                                    {brand}
                                </Button>
                            ))}
                        </Stack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            <Accordion
                allowToggle
                index={openModelAccordionIndex}
                onChange={(index) => {
                    const idx = index as number
                    setOpenModelAccordionIndex(idx)
                    if (idx === 0) setOpenBrandAccordionIndex(-1)
                }}
                flex="1"
            >
                <AccordionItem border="none" bg="white">
                    <AccordionButton
                        bg="white" h="40px" fontSize="12px" width="100%"
                        border="none" padding="0px 20px"
                        borderBottom="1px solid #F4F4F5"
                    >
                        <Box flex="1" textAlign="left">{selectedCategory || "모델 선택"}</Box>
                        <ChevronDownIcon
                            boxSize={20}
                            transform={isModelOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            transition="transform 0.3s ease-in-out"
                        />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                        <Stack spacing={0} width="100%">
                            {!selectedBrand && (
                                <Button
                                    justifyContent="flex-start" bg="white" border="none"
                                    colorScheme="gray" width="100%" fontSize="12px"
                                    h="40px" pl="20px"
                                    borderBottom="1px solid #F4F4F5" borderRight="1px solid #F4F4F5"
                                >
                                    제조사를 먼저 선택해주세요
                                </Button>
                            )}
                            {selectedBrand && categories[selectedBrand].map((model) => (
                                <Button
                                    key={model}
                                    justifyContent="flex-start" bg="white" border="none"
                                    onClick={() => {
                                        setSelectedCategory(model)
                                        setOpenModelAccordionIndex(-1)
                                    }}
                                    colorScheme={selectedCategory === model ? "blue" : "gray"}
                                    width="100%" fontSize="12px" h="40px" pl="20px"
                                    borderBottom="1px solid #F4F4F5" borderRight="1px solid #F4F4F5"
                                >
                                    {model}
                                </Button>
                            ))}
                        </Stack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Flex>
    )
}

function ProductCardSkeleton() {
    return (
        <>
            <style>{`
                @keyframes kt-shimmer {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
                .kt-skeleton {
                    background: linear-gradient(90deg, #F4F5F7 25%, #EAECEF 50%, #F4F5F7 75%);
                    background-size: 800px 100%;
                    animation: kt-shimmer 1.4s infinite linear;
                    border-radius: 8px;
                }
            `}</style>
            <div style={{
                display: "flex", alignItems: "center",
                gap: "clamp(10px, 2.5vw, 16px)",
                padding: "16px clamp(12px, 3vw, 20px)",
                backgroundColor: "white", borderBottom: "1px solid #F4F4F5",
                width: "100%", boxSizing: "border-box",
            }}>
                <div className="kt-skeleton" style={{
                    width: "clamp(88px, 22vw, 110px)", height: "clamp(88px, 22vw, 110px)",
                    minWidth: "clamp(88px, 22vw, 110px)", borderRadius: "14px", flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="kt-skeleton" style={{ width: "55%", height: "14px" }} />
                    <div className="kt-skeleton" style={{ width: "70%", height: "24px", marginTop: "2px" }} />
                    <div className="kt-skeleton" style={{ width: "20%", height: "26px", borderRadius: "8px", marginTop: "2px" }} />
                </div>
                <div className="kt-skeleton" style={{ flexShrink: 0, width: "72px", height: "38px", borderRadius: "12px" }} />
            </div>
        </>
    )
}

function ProductCard({ product, onClick, rank }) {
    const isIPhone16e = product.category === "aip16e"
    const [ktmarketSubsidies, setKtmarketSubsidies] = useState(null)

    useEffect(() => {
        const fetchSubsidy = async () => {
            try {
                const { data, error } = await supabase
                    .from("ktmarket_subsidy").select("*").eq("model", product.model)
                if (error) throw error
                setKtmarketSubsidies(data[0])
            } catch (err) { console.error(err) }
        }
        fetchSubsidy()
    }, [product.model])

    const calcPrice = () => {
        if (isIPhone16e) return "0"
        if (!ktmarketSubsidies) return product.price.toLocaleString()
        const ktmarketSubsidy = calcKTmarketSubsidy(product, ktmarketSubsidies)
        const disclosure_subsidy = product.device_plans_chg?.[0]?.disclosure_subsidy ?? 0
        const discountPrice = product.price - disclosure_subsidy - ktmarketSubsidy
        return (discountPrice < 0 ? 0 : discountPrice).toLocaleString()
    }

    const buildImageUrl = (category: string, color: string, imageKey: string) =>
        `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${category}/${color}/${imageKey}.png`

    const imageURL = (product) => {
        const colorKey = product.thumbnail || product.colors_en?.[0] || "black"
        const imageList = product.images?.[colorKey] ?? []
        const imageKey = imageList.length > 0 ? imageList[0] : null
        if (!imageKey) return "https://example.com/default-image.png"
        return buildImageUrl(product.category, colorKey, imageKey)
    }

    const calcDiscountRate = () => {
        const originalPrice = isIPhone16e ? 990000 : product.price
        if (!originalPrice || originalPrice === 0) return 0
        const finalPrice = parseInt(calcPrice().replace(/,/g, ""), 10)
        const rate = Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
        return rate > 0 ? rate : 0
    }

    const discountRate = calcDiscountRate()

    return (
        <div
            style={{
                display: "flex", alignItems: "center",
                gap: "clamp(10px, 2.5vw, 16px)",
                padding: "16px clamp(12px, 3vw, 20px)",
                backgroundColor: "white", cursor: "pointer",
                borderBottom: "1px solid #F4F4F5",
                width: "100%", boxSizing: "border-box", overflow: "hidden",
            }}
            onClick={onClick}
        >
            {/* 이미지 */}
            <div style={{
                width: "clamp(88px, 22vw, 110px)", height: "clamp(88px, 22vw, 110px)",
                minWidth: "clamp(88px, 22vw, 110px)", borderRadius: "14px",
                backgroundColor: "#F4F5F7",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", flexShrink: 0,
            }}>
                <img
                    src={imageURL(product)} alt={product.colors_en?.[0]}
                    style={{
                        width: "clamp(70px, 18vw, 90px)",
                        height: "clamp(70px, 18vw, 90px)",
                        objectFit: "contain",
                    }}
                />
            </div>

            {/* 텍스트 */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{
                    fontSize: "clamp(12px, 3.2vw, 14px)",
                    fontFamily: "Pretendard Medium, sans-serif",
                    color: "#9CA3AF",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                    {product.pet_name}
                </span>
                <span style={{
                    fontSize: "clamp(18px, 5vw, 22px)",
                    fontFamily: "Pretendard Bold, sans-serif",
                    fontWeight: 700, color: "#111827", letterSpacing: "-0.5px",
                }}>
                    {calcPrice()}원
                </span>
                {discountRate > 0 && (
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        backgroundColor: "#FEE2E2", borderRadius: "8px",
                        padding: "4px 8px", width: "fit-content", marginTop: "2px",
                    }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M5 8L0 0H10L5 8Z" fill="#EF4444" />
                        </svg>
                        <span style={{
                            fontSize: "clamp(11px, 3vw, 13px)",
                            fontFamily: "Pretendard Bold, sans-serif",
                            fontWeight: 700, color: "#EF4444",
                        }}>
                            {discountRate}%
                        </span>
                    </div>
                )}
            </div>

            {/* 보러가기 버튼 */}
            <div style={{

                flexShrink: 0,

                padding: "9px clamp(10px, 3vw, 16px)",

                borderRadius: "12px",

                backgroundColor: "#EFF6FF", color: "#3B82F6",

                fontSize: "clamp(12px, 3.2vw, 14px)",

                fontFamily: "Pretendard Medium, sans-serif",

                fontWeight: 600, textAlign: "center", whiteSpace: "nowrap",

            }}>

                보러가기

            </div>
        </div>
    )
}

const YOUTUBE_PLAN_PIDS_CATALOG = new Set([
    "ppllistobj_0937",
    "ppllistobj_0938",
    "ppllistobj_0939",
])

function calcKTmarketSubsidy(product, ktmarketSubsidies): number {
    const discount = "device"
    const register = "chg"
    const planPrice = 90000
    const planId = "ppllistobj_0937"

    if (planPrice <= 0) return 0
    if (!ktmarketSubsidies || typeof ktmarketSubsidies !== "object") return 0

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

    const value = ktmarketSubsidies[matchedKey] ?? 0
    const youtubeBonus = YOUTUBE_PLAN_PIDS_CATALOG.has(planId) ? 30000 : 0
    return value + youtubeBonus
}
