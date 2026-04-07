import { addPropertyControls, ControlType } from "framer"
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Box,
    Button,
    Stack,
    Select,
    Input,
    Flex,
} from "@chakra-ui/react"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { createClient } from "@supabase/supabase-js"
import React, { useEffect, useState } from "react"

const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Color {
    kr: string
    en: string
    code: string
    isSoldOut: boolean
    urls: []
}

interface DevicePlan {
    name: string // 요금제 이름
    plan_id: string // 요금제 ID
    model_price: number // 모델 가격
    device_model: string // 모델 ID
    migration_subsidy: number // 이동 지원금
    disclosure_subsidy: number // 공시 지원금
}

interface Product {
    model: string // 모델 ID
    category: string // 카테고리
    category_kr: string // 카테고리 KR
    company: string // 제조사
    pet_name: string // 제품 이름
    colors_kr: string[] // 한국어 색상명 배열
    colors_en: string[] // 영어 색상명 배열
    colors_code: string[] // 색상 코드 배열
    device_plans: DevicePlan[] // 요금제 배열
    subsidy: number
}

export default function PhoneCatalogPage(props) {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])

    const [selectedBrand, setSelectedBrand] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedSubCategory, setSelectedSubCategory] = useState("")

    const [isClient, setIsClient] = useState(false)
    const [hideFilter, setHideFilter] = useState(false)
    const [isVisiblePlayer, setIsVisiblePlayer] = useState(true)
    const [isVisibleMainBanner, setIsVisibleMainBanner] = useState(false)
    const [mainBannerURL, setMainBannerURL] = useState("")
    const [bannerURL, setBannerURL] = useState("")
    const [videoURL, setVideoURL] = useState("")

    const brandMap = {
        삼성: "samsung",
        애플: "apple",
        기타: "etc",
    }

    const DB_NAME_DEVICES = "devices"
    const planId = "ppllistobj_0808"

    const handleOnClick = (product) => {
        const url = `/phone/${product.model}`
        window.location.href = url
    }

    const filterLowestDevices = (products) => {
        const filtered = products.filter((product) => {
            return (
                product.capacities?.[0] === product.capacity &&
                product.is_available === true
            )
        })

        return filtered
    }

    const fetchDevices = async () => {
        const deviceChoicePlanId = "ppllistobj_0808"
        const samsungChoicePlanId = "ppllistobj_0808"

        try {
            let { data: devices, error } = await supabase
                .from("devices")
                .select(
                    `
    *,
    device_plans_chg (model, model_price, plan_id, name, disclosure_subsidy)
  `
                )
                .eq("device_plans_chg.plan_id", samsungChoicePlanId)

            console.log("============")
            console.log(devices)

            const storageKeywords = ["128GB", "256GB", "512GB", "1TB"]
            devices.forEach((product) => {
                if (typeof product.pet_name === "string") {
                    storageKeywords.forEach((keyword) => {
                        product.pet_name = product.pet_name
                            .replace(keyword, "")
                            .trim()
                    })
                }
            })

            setProducts(filterLowestDevices(devices) ?? [])
            if (error) throw error
        } catch (error) {
            console.log("Fetched Devices with Plans: ", error)
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

            if (brand && category) {
                setHideFilter(true)
            }
        }
    }, [])

    // ✅ 필터링 로직
    useEffect(() => {
        const lastPath =
            typeof window !== "undefined"
                ? window.location.pathname.split("/").filter(Boolean).pop()
                : ""
        const queryParams = new URLSearchParams(window.location.search)
        const brand = queryParams.get("brand")
        const category = queryParams.get("category")
        const subCategory = queryParams.get("sub-category")

        switch (lastPath) {
            case "samsung":
                setIsVisiblePlayer(false)
                break
            case "apple":
                setIsVisiblePlayer(false)
                setIsVisibleMainBanner(false)
                setMainBannerURL(
                    "https://framerusercontent.com/images/hQqRf9KXTIIjEexGc76ihqzSfo.jpeg?scale-down-to=1024&width=3942&height=864"
                )
                break
            case "iphone17":
            case "iphone16":
            case "foldable7":
            case "s25":
                setHideFilter(true)
                setIsVisiblePlayer(false)
                setIsVisibleMainBanner(false)
                break
            case "etc":
                setVideoURL(
                    "https://www.youtube.com/embed/PUQfcMPfifw?si=bpGUIbDTRM17iEtY"
                )
                break
            case "phone":
                if (brand === "애플") {
                    setIsVisiblePlayer(false)
                    if (category === "아이폰 17") {
                        setIsVisibleMainBanner(true)
                        setMainBannerURL(
                            "https://framerusercontent.com/images/hQqRf9KXTIIjEexGc76ihqzSfo.jpeg?scale-down-to=1024&width=3942&height=864"
                        )
                    }
                } else if (brand === "삼성") {
                    if (category === "Z시리즈") {
                        if (subCategory === "폴더블7") {
                            setIsVisiblePlayer(false)
                            setVideoURL(
                                "https://www.youtube.com/embed/LhsplcD8yPg?si=z-v0B-uMJChw_E-I"
                            )
                        } else {
                            setVideoURL(
                                "https://www.youtube.com/embed/Q3mIdoJgO50?si=C0jPKC4holLhz3zM"
                            )
                            setIsVisiblePlayer(true)
                        }
                    } else if (category === "S시리즈") {
                        setVideoURL(
                            "https://www.youtube.com/embed/Q3mIdoJgO50?si=C0jPKC4holLhz3zM"
                        )
                        setIsVisiblePlayer(true)
                    } else {
                        setIsVisiblePlayer(false)
                    }
                } else {
                    setVideoURL(
                        "https://www.youtube.com/embed/FGWEE5IFu8I?si=NEx_8zBeMVLlKhET"
                    )
                    setIsVisiblePlayer(true)
                }
                break
        }

        let filtered = products

        let isSpecialPage = false

        if (lastPath === "iphone16") {
            isSpecialPage = true
            filtered = filtered.filter(
                (product) => product.category_kr === "아이폰 16"
            )
        } else if (lastPath === "foldable7") {
            isSpecialPage = true
            const targetCodes = ["sm-f966", "sm-f766", "sm-f761"]
            filtered = filtered.filter((product) =>
                targetCodes.some((code) => product.category?.startsWith(code))
            )
        } else if (lastPath === "s25") {
            isSpecialPage = true
            const targetCodes = [
                "sm-s931",
                "sm-s937",
                "sm-s731",
                "sm-s938",
                "sm-s942",
                "sm-s947",
                "sm-s948",
            ]
            filtered = filtered.filter((product) =>
                targetCodes.some((code) => product.category?.startsWith(code))
            )
        } else if (lastPath === "iphone17") {
            isSpecialPage = true
            filtered = filtered.filter(
                (product) => product.category_kr === "아이폰 17"
            )
        }

        if (!isSpecialPage) {
            if (selectedBrand) {
                const englishBrand = brandMap[selectedBrand]
                filtered = filtered.filter((product) => {
                    if (product.company === englishBrand) return true

                    if (product.category === "aip16e") {
                        return englishBrand === "apple"
                    }
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
                    filtered = filtered.filter(
                        (product) =>
                            product.category === "sm-f966nk" ||
                            product.category === "sm-f966nk512" ||
                            product.category === "sm-f766nk" ||
                            product.category === "sm-f766nk512"
                    )
                } else if (selectedSubCategory === "폴더블6") {
                    filtered = filtered.filter(
                        (product) =>
                            product.category === "sm-f956nk" ||
                            product.category === "sm-f741nk"
                    )
                } else if (selectedSubCategory === "폴더블5") {
                    filtered = filtered.filter(
                        (product) =>
                            product.category === "sm-f946nk" ||
                            product.category === "sm-f731nk"
                    )
                } else if (selectedSubCategory === "S25") {
                    filtered = filtered.filter(
                        (product) =>
                            product.category === "sm-s931nk" ||
                            product.category === "sm-s936nk" ||
                            product.category === "sm-s938nk" ||
                            product.category === "sm-s937nk" ||
                            product.category === "sm-s942nk" ||
                            product.category === "sm-s947nk" ||
                            product.category === "sm-s948nk"
                    )
                } else if (selectedSubCategory === "S24") {
                    filtered = filtered.filter(
                        (product) =>
                            product.category === "sm-s921nk" ||
                            product.category === "sm-s926nk" ||
                            product.category === "sm-s928nk" ||
                            product.category === "sm-s721nk"
                    )
                } else {
                    filtered = filtered.filter(
                        (product) => product.category === selectedSubCategory
                    )
                }
            }
        }

        const fixedTopList = []

        filtered.sort((a, b) => {
            const getPriority = (prod) => {
                let idx = fixedTopList.indexOf(prod.category)
                if (idx === -1) idx = fixedTopList.indexOf(prod.model)
                return idx
            }

            const priorityA = getPriority(a)
            const priorityB = getPriority(b)

            if (priorityA !== -1 && priorityB !== -1) {
                return priorityA - priorityB
            }
            if (priorityA !== -1) return -1
            if (priorityB !== -1) return 1

            return (
                new Date(b.release_date).getTime() -
                new Date(a.release_date).getTime()
            )
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
            <div
                style={{
                    display: "grid",
                    gap: "8px",
                }}
            >
                {isVisibleMainBanner && mainBannerURL && (
                    <a href="/form-iphone17/stock" style={{ display: "block" }}>
                        <img
                            src={mainBannerURL}
                            alt="아이폰16"
                            style={{
                                width: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </a>
                )}
                {isVisiblePlayer && (
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0,
                        }}
                    >
                        {bannerURL && (
                            <img
                                src={bannerURL}
                                alt="아이폰16"
                                style={{
                                    width: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        )}

                        <div
                            style={{
                                backgroundColor: "#000",
                                padding: "40px 0",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "90%",
                                    margin: "0 auto",
                                    paddingTop: "56.25%",
                                }}
                            >
                                <iframe
                                    src={
                                        videoURL +
                                        "&modestbranding=1&rel=0&showinfo=0"
                                    }
                                    title="YouTube video player"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        border: "none",
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    {products.length === 0 ? (
                        <p>Loading...</p>
                    ) : (
                        filteredProducts.map((product, index) => (
                            <ProductCard
                                key={index}
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

function BrandModelFilter({
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
}) {
    const brands = ["삼성", "애플", "기타"]

    const categories = {
        삼성: ["S 시리즈", "Z 시리즈", "A 시리즈"],
        애플: ["아이폰 17", "아이폰 16", "아이폰 15", "아이폰 14"],
        기타: ["Mi 시리즈", "A 시리즈", "Redmi 시리즈"],
    }

    const [isBrandOpen, setIsBrandOpen] = useState(false)
    const [isModelOpen, setIsModelOpen] = useState(false)
    const [openBrandAccordionIndex, setOpenBrandAccordionIndex] = useState<
        number | null
    >(null)

    const [openModelAccordionIndex, setOpenModelAccordionIndex] = useState<
        number | null
    >(null)

    return (
        <Flex width="100%">
            {/* 제조사 선택 */}
            <Accordion
                index={openBrandAccordionIndex}
                onChange={(index) => setOpenBrandAccordionIndex(index)}
                flex="1"
            >
                <AccordionItem border="none" bg="white">
                    <AccordionButton
                        bg="white"
                        h="40px"
                        fontSize="12px"
                        width="100%"
                        border="none"
                        padding="0px 20px"
                        borderBottom="1px solid #F4F4F5"
                        borderRight="1px solid #F4F4F5"
                        onClick={() => setIsBrandOpen(!isBrandOpen)}
                    >
                        <Box flex="1" textAlign="left">
                            {selectedBrand || "제조사 선택"}
                        </Box>
                        <ChevronDownIcon
                            boxSize={20}
                            transform={
                                isBrandOpen ? "rotate(180deg)" : "rotate(0deg)"
                            }
                            transition="transform 0.3s ease-in-out"
                        />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                        <Stack spacing={0} width="100%">
                            {brands.map((brand) => (
                                <Button
                                    justifyContent="flex-start"
                                    bg="white"
                                    border="none"
                                    key={brand}
                                    onClick={() => {
                                        setSelectedBrand(brand)
                                        setSelectedCategory("") // 모델 초기화
                                        setOpenBrandAccordionIndex(null) // 아코디언 닫기
                                    }}
                                    colorScheme={
                                        selectedBrand === brand
                                            ? "blue"
                                            : "gray"
                                    }
                                    width="100%"
                                    fontSize="12px"
                                    h="40px"
                                    pl="20px"
                                    borderBottom="1px solid #F4F4F5"
                                    borderRight="1px solid #F4F4F5"
                                >
                                    {brand}
                                </Button>
                            ))}
                        </Stack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            {/* 모델 선택 */}
            <Accordion
                index={openModelAccordionIndex}
                onChange={(index) => setOpenModelAccordionIndex(index)}
                flex="1"
            >
                <AccordionItem border="none" bg="white">
                    <AccordionButton
                        bg="white"
                        h="40px"
                        fontSize="12px"
                        width="100%"
                        border="none"
                        padding="0px 20px"
                        borderBottom="1px solid #F4F4F5"
                        onClick={() => setIsModelOpen(!isModelOpen)}
                    >
                        <Box flex="1" textAlign="left">
                            {selectedCategory || "모델 선택"}
                        </Box>
                        <ChevronDownIcon
                            boxSize={20}
                            transform={
                                isModelOpen ? "rotate(180deg)" : "rotate(0deg)"
                            }
                            transition="transform 0.3s ease-in-out"
                        />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                        <Stack spacing={0} width="100%">
                            {/* 제조사가 선택되지 않았을 경우 "제조사를 먼저 선택해주세요" 메시지 표시 */}
                            {!selectedBrand && (
                                <Button
                                    justifyContent="flex-start"
                                    bg="white"
                                    border="none"
                                    key={"none"}
                                    colorScheme={"gray"}
                                    width="100%"
                                    fontSize="12px"
                                    h="40px"
                                    pl="20px"
                                    borderBottom="1px solid #F4F4F5"
                                    borderRight="1px solid #F4F4F5"
                                >
                                    {" "}
                                    제조사를 먼저 선택해주세요
                                </Button>
                            )}
                            {/* "그 외" 선택 시 Input 필드 표시 */}
                            {selectedBrand &&
                                categories[selectedBrand].map((model) => (
                                    <Button
                                        justifyContent="flex-start"
                                        bg="white"
                                        border="none"
                                        key={model}
                                        onClick={() => {
                                            setSelectedCategory(model)
                                            setOpenModelAccordionIndex(null) // 아코디언 닫기
                                        }}
                                        colorScheme={
                                            selectedCategory === model
                                                ? "blue"
                                                : "gray"
                                        }
                                        width="100%"
                                        fontSize="12px"
                                        h="40px"
                                        pl="20px"
                                        borderBottom="1px solid #F4F4F5"
                                        borderRight="1px solid #F4F4F5"
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

function ProductCard({ product, onClick }) {
    // const isPreorderModel =
    //     product.model == "sm-f966nk512" || product.model == "sm-f766nk512"
    const isIPhone16e = product.category === "aip16e"

    const DB_NAME_KTMARKET_SUBSIDY = "ktmarket_subsidy"
    const planName = () => {
        if (isIPhone16e) {
            return "스페셜 초이스 요금제"
        }
        return "5G 심플 110GB"
        // return product.company === "apple"
        //     ? "디바이스 초이스 스페셜"
        //     : "삼성 초이스 스페셜"
    }

    // const discount: string = "공시지원금"

    // const discount = (model) => {
    //     if (model == "sm-f966nk512" || model == "sm-f766nk512") {
    //         return "미리보상"
    //     } else {
    //         return "+ 월요금에서 25% 할인"
    //     }
    // }

    // const [ktmarketSubsidies, setKtmarketSubsidies] = useState()
    const [ktmarketSubsidies, setKtmarketSubsidies] = useState(null)

    useEffect(() => {
        const fetchSubsidy = async () => {
            try {
                const { data, error } = await supabase
                    .from("ktmarket_subsidy")
                    .select("*")
                    .eq("model", product.model)
                if (error) throw error
                setKtmarketSubsidies(data[0])
            } catch (err) {
                console.error(err)
            }
        }

        fetchSubsidy()
    }, [product.model])

    const ArrowIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#37383C4D" // 8자리 16진수 색상
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    )

    const foldable7StorageUpPromotionPrice = (model) => {
        if (model == "sm-f966nk512") {
            return 158400 + 1268850
        } else if (model == "sm-f766nk512") {
            return 158400 + 821700
        } else {
            return 0
        }
    }

    const calcPrice = () => {
        if (isIPhone16e) {
            return "0"
        }

        if (!ktmarketSubsidies) return product.price.toLocaleString()
        const ktmarketSubsidy = calcKTmarketSubsidy(product, ktmarketSubsidies)
        // let promotionDiscount = 0

        const promotionDiscount = 0

        const disclosure_subsidy =
            product.device_plans_chg?.[0]?.disclosure_subsidy ?? 0

        console.log("===프로덕트=====")
        console.log(product)
        console.log(disclosure_subsidy)

        console.log(
            `${product.model} : ${disclosure_subsidy} : ${ktmarketSubsidy}`
        )

        let discountPrice = 0

        discountPrice =
            product.price -
            disclosure_subsidy -
            ktmarketSubsidy -
            promotionDiscount

        // if (discount(product.model) == "미리보상") {
        //     if (product.model == "sm-f966nk512") {
        //         discountPrice = 428450
        //     } else {
        //         discountPrice = 0
        //     }
        //     // discountPrice =
        //     //     product.price -
        //     //     disclosure_subsidy -
        //     //     ktmarketSubsidy -
        //     //     foldable7StorageUpPromotionPrice(product.model)
        // } else {
        //     discountPrice =
        //         product.price -
        //         disclosure_subsidy -
        //         ktmarketSubsidy -
        //         promotionDiscount -
        //         foldable7StorageUpPromotionPrice(product.model)
        // }

        const price = discountPrice < 0 ? 0 : discountPrice
        return price.toLocaleString()
    }

    const getOriginalPrice = () => {
        if (isIPhone16e) {
            return "990,000"
        }
        return product.price.toLocaleString()
    }

    const buildImageUrl = (
        category: string,
        color: string,
        imageKey: string
    ) => {
        return `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${category}/${color}/${imageKey}.png`
    }

    const DEFAULT_IMAGE_URL = "https://example.com/default-image.png"

    const imageURL = (product) => {
        console.log(product)
        const colorKey = product.thumbnail || product.colors_en?.[0] || "black"
        const imageList = product.images?.[colorKey] ?? []
        const imageKey = imageList.length > 0 ? imageList[0] : null

        if (!imageKey) {
            console.warn(
                `❌ ${product.category} - ${colorKey} 색상에 대한 이미지가 없습니다.`
            )
            return DEFAULT_IMAGE_URL
        }

        return buildImageUrl(product.category, colorKey, imageKey)
    }

    const cardStyles = {
        card: {
            display: "flex",
            alignItems: "center",
            border: "none",
            // 아래쪽만 테두리 추가
            borderBottom: "1px solid #F4F4F5",
            // borderRadius: "8px",
            padding: "20px 20px",
            // margin: "16px auto",
            width: "auto", // 카드 폭 설정
            height: "150px",
            backgroundColor: "white",
            cursor: "pointer",
            gap: "12px",
        },
        leftContainer: {
            width: "108px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            // backgroundColor: "white",
            // gap: "10px",
        },
        image: {
            width: "auto", // 이미지 크기 제한
            height: "108px",
            objectFit: "cover",
            borderRadius: "8px",
        },
        colors: {
            display: "flex",
            gap: "8px",
        },
        colorCircle: {
            width: "10px",
            height: "10px",
            borderRadius: "50%",
        },

        rightContainer: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "start",
            // backgroundColor: "blue",
            // paddingLeft: "10px",
        },
        rightInfoContainer: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            // alignItems: "start",
            // backgroundColor: "red",
            gap: "2px",
            // color: "red",
            // flex: 1, // 부모의 남은 공간을 모두 차지
        },
        petName: {
            width: "100%",
            height: "auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            // alignItems: "start",
        },
        priceContainer: {
            width: "100%",
            height: "auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            alignItems: "center",
            gap: "20px",
        },
        planName: {
            fontSize: "11px",
            fontFamily: "Pretendard Medium, sans-serif",
            color: "rgba(123, 123, 123, 0.7)",
        },
        priceTitle: {
            fontSize: "13px",
            fontFamily: "Pretendard Medium, sans-serif",
            color: "rgba(123, 123, 123, 0.7)",
        },
        price: {
            fontSize: "13px",
            fontFamily: "Pretendard Medium, sans-serif",
            color: "rgba(123, 123, 123, 0.7)",
            textDecoration: "line-through",
        },
        salePriceTitle: {
            fontSize: "13px",
            fontFamily: "Pretendard Medium, sans-serif",
            // color: "rgba(123, 123, 123, 0.7)",
        },
        benefit: {
            fontSize: "10px",
            fontFamily: "Pretendard Medium, sans-serif",
            color: "#696969", // 글자 색
            backgroundColor: "#F7F7F7", // 배경색
            // border: "1px solid #E5E5E5", // 외곽선
            borderRadius: "6px", // 둥근 테두리
            padding: "4px 4px", // 내부 여백
            display: "inline-block", // 콘텐츠 크기만큼만 보이도록
            width: "fit-content", // ✅ 콘텐츠 넓이만큼만 영역 차지
            marginTop: "8px", // ✅ 상단 마진 추가
        },
        salePrice: {
            fontSize: "15px",
            fontFamily: "Pretendard Semibold, sans-serif",
        },
        title: {
            fontSize: "16px",
            fontFamily: "Pretendard Semibold, sans-serif",
            padding: "0", // 내부 여백 제거
            margin: "0", // 외부 여백 제거
        },
    }

    return (
        <div style={cardStyles.card} onClick={onClick}>
            {/* 왼쪽 이미지 */}
            <div style={cardStyles.leftContainer}>
                <img
                    src={imageURL(product)}
                    alt={product.colors_en[0]}
                    style={cardStyles.image}
                />
            </div>
            {/* 오른쪽 텍스트 정보 */}
            <div style={cardStyles.rightContainer}>
                <div style={cardStyles.rightInfoContainer}>
                    <h3 style={cardStyles.title}>{product.pet_name}</h3>
                    <div style={cardStyles.planName}>{planName()} 기준</div>
                    <div style={{ height: "10px" }}></div>

                    <div style={cardStyles.priceContainer}>
                        <span style={cardStyles.priceTitle}>출고가</span>
                        <span style={cardStyles.price}>
                            {getOriginalPrice()}원
                        </span>
                    </div>

                    <div style={cardStyles.priceContainer}>
                        <span style={cardStyles.salePriceTitle}>판매가</span>
                        <span style={cardStyles.salePrice}>
                            {calcPrice()}원
                        </span>
                    </div>
                    <span style={cardStyles.benefit}>{"공통지원금"}</span>
                </div>
            </div>
            <div style={{ width: "auto" }}>
                <ArrowIcon />{" "}
            </div>
        </div>
    )
}

//  <div style={cardStyles.colors}>
//     {product.colors_code.map((color, index) => (
//         <div
//             key={index}
//             style={{
//                 ...cardStyles.colorCircle,
//                 backgroundColor: color,
//             }}
//         ></div>
//     ))}
// </div>

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

function calcKTmarketSubsidy(product, ktmarketSubsidies): number {
    const discount = "device"
    const register = "chg"
    const planPrice = 69000
    const planId = "ppllistobj_0957"

    console.log("===========================")
    console.log(`${discount} : ${register} : ${planPrice}`)
    console.log(ktmarketSubsidies)
    console.log("===========================")

    if (planPrice <= 0) return 0

    if (!ktmarketSubsidies || typeof ktmarketSubsidies !== "object") {
        console.warn("KT 마켓 지원금 데이터가 비정상입니다.")
        return 0
    }

    // ✅ 예외 조건 적용: 특정 plan_id는 강제 티어 적용
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

    console.log(matchedKey)
    const value = ktmarketSubsidies[matchedKey] ?? 0
    console.log("calcKTmarketSubsidy result:", value)
    return value
}
