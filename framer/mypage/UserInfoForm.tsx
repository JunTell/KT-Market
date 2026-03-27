import { createClient } from "@supabase/supabase-js"
import { addPropertyControls, ControlType } from "framer"
import { checkAuth, userState } from "https://framer.com/m/AuthStore-jiikDX.js@QRzzhL7x0LkccW6oL0Cw"
import LoadingIndicator from "https://framer.com/m/LoadingIndicator-9X6k.js"
import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

// --- Supabase 설정 ---
const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Constants ---
const preorderModel = [
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

const s26OrderModel = [
    "sm-s942nk",
    "sm-s942nk512",
    "sm-s947nk",
    "sm-s947nk512",
    "sm-s948nk",
    "sm-s948nk512",
]

const aip17eOrderModel = ["aip17e-256", "aip17e-512"]

// --- Helpers ---
function normalizePhoneNumberWithHyphen(input?: string): string {
    if (typeof input !== "string" || input.trim() === "") return ""
    const digitsOnly = input.replace(/\D/g, "").slice(0, 11)
    if (digitsOnly.length <= 3) return digitsOnly
    else if (digitsOnly.length <= 7)
        return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`
    else
        return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`
}

function isAdultFromBirth6(birth6: string): boolean {
    if (!/^\d{6}$/.test(birth6)) return false
    const yy = parseInt(birth6.slice(0, 2), 10)
    const mm = parseInt(birth6.slice(2, 4), 10)
    const dd = parseInt(birth6.slice(4, 6), 10)
    const fullYear = yy <= 24 ? 2000 + yy : 1900 + yy
    const today = new Date()

    if (fullYear < 2006) return true
    if (fullYear > 2006) return false
    const birthdayThisYear = new Date(today.getFullYear(), mm - 1, dd)
    return today >= birthdayThisYear
}

const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

// --- Type Definitions ---
interface OrderData {
    deviceModel: string
    devicePetName: string
    deviceCapacity: string
    deviceColor: string
    imageUrl: string
    planName: string
    planPrice: number
    devicePrice: number
    monthlyPayment: number
    joinType: string
    discountType: string
    contract: number
    funnel: string
}

interface UserInputData {
    userName: string
    userDob: string
    userPhone: string
}

interface Props {
    nextPageUrl: string
    onSuccess?: () => void
}

export default function UserInfoForm(props: Props) {
    const [isMounted, setIsMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    const [orderData, setOrderData] = useState<OrderData | null>(null)
    const [_fullSheetData, setFullSheetData] = useState<any>(null)

    const [formData, setFormData] = useState<UserInputData>({
        userName: "",
        userDob: "",
        userPhone: "",
    })

    const [isEditing, setIsEditing] = useState(false)
    const [isInitialEntry, setIsInitialEntry] = useState(true)

    const [showTermsModal, setShowTermsModal] = useState(false)
    const [isTermExpanded, setIsTermExpanded] = useState(false)
    const [isAgreed, setIsAgreed] = useState(true)

    const [touched, setTouched] = useState({
        userName: false,
        userDob: false,
        userPhone: false,
    })

    const subscriberRef = useRef<HTMLDivElement>(null)
    const isProcessing = useRef(false)

    useEffect(() => {
        setIsMounted(true)
        loadSessionData()
    }, [])

    const loadSessionData = async () => {
        if (typeof window === "undefined") return

        try {
            await checkAuth()
            
            const sheetStr = sessionStorage.getItem("sheet")
            const dataStr = sessionStorage.getItem("data")
            const savedUserInfoStr = sessionStorage.getItem("user-info")

            let parsedSheet = null
            let parsedData = null

            if (sheetStr) parsedSheet = JSON.parse(sheetStr)
            if (dataStr) parsedData = JSON.parse(dataStr)

            setFullSheetData(parsedSheet)

            if (parsedSheet && parsedData) {
                setOrderData({
                    deviceModel: parsedData.device?.model || "",
                    devicePetName: parsedData.device?.pet_name || "기기명 없음",
                    deviceCapacity: parsedData.device?.capacity || "",
                    deviceColor: parsedData.color?.kr || "",
                    imageUrl: parsedData.color?.urls?.[0] || "",
                    joinType: parsedData.register || "기기변경",
                    planName: parsedSheet.planName || "",
                    planPrice: parsedSheet.planPrice || 0,
                    devicePrice: parsedSheet.devicePrice || 0,
                    monthlyPayment: parsedSheet.totalMonthPayment || 0,
                    discountType: parsedSheet.discount || "공통지원금",
                    contract: parsedSheet.installment || 24,
                    funnel: "ktmarket_web",
                })
            } else {
                setOrderData({
                    deviceModel: "test-device-01",
                    devicePetName: "아이폰 16 Pro (테스트)",
                    deviceCapacity: "256GB",
                    deviceColor: "내추럴 티타늄",
                    imageUrl: "",
                    planName: "5G 초이스 베이직",
                    planPrice: 90000,
                    devicePrice: 1550000,
                    monthlyPayment: 105240,
                    joinType: "기기변경",
                    discountType: "공통지원금",
                    contract: 24,
                    funnel: "test_mode",
                })
            }

            if (userState.isLoggedIn) {
                setFormData({
                    userName: userState.fullName || "",
                    userDob: "981128", // 예시로 설정된 생년월일 (스토어에 없을 시)
                    userPhone: formatPhoneNumber(userState.phoneNumber || ""),
                })
                setIsInitialEntry(false)
                setIsEditing(false)
            } else if (savedUserInfoStr) {
                const savedUser = JSON.parse(savedUserInfoStr)
                setFormData({
                    userName: savedUser.userName || "",
                    userDob: savedUser.userDob || "",
                    userPhone: formatPhoneNumber(savedUser.userPhone || ""),
                })
                setIsInitialEntry(false)
                setIsEditing(false)
            } else {
                setIsInitialEntry(true)
                setIsEditing(true)
            }

            setTimeout(() => {
                setIsInitialLoading(false)
            }, 300)
        } catch (e) {
            console.error("Session load error:", e)
            setIsInitialLoading(false)
        }
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("ko-KR").format(price)

    const isDobValid = formData.userDob.length === 6
    const isPhoneValid = formData.userPhone.replace(/-/g, "").length >= 10
    const isNameValid = formData.userName.trim().length > 0

    const isFormComplete = isNameValid && isDobValid && isPhoneValid
    const showInputForm = isEditing

    const handleInputChange = (field: keyof UserInputData, value: string) => {
        if (field === "userDob") {
            const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6)
            setFormData((prev) => ({ ...prev, [field]: numericValue }))
            return
        }
        if (field === "userPhone") {
            const formatted = formatPhoneNumber(value)
            setFormData((prev) => ({ ...prev, [field]: formatted }))
            return
        }
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleInputBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
    }

    const handleSaveInput = useCallback(() => {
        setTouched({ userName: true, userDob: true, userPhone: true })

        if (isFormComplete) {
            setIsEditing(false)
            setIsInitialEntry(false)
            sessionStorage.setItem("user-info", JSON.stringify(formData))
        } else {
            alert("이름, 생년월일, 연락처를 모두 올바르게 입력해주세요.")
        }
    }, [isFormComplete, formData])

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        if (isEditing && isFormComplete && isInitialEntry) {
            timer = setTimeout(() => {
                handleSaveInput()
            }, 1000)
        }
        return () => clearTimeout(timer)
    }, [isEditing, isFormComplete, isInitialEntry, handleSaveInput])

    const handleEditClick = () => {
        setIsEditing(true)
        setIsInitialEntry(false)
    }

    const handleApplyClick = () => {
        if (!isFormComplete) {
            setTouched({ userName: true, userDob: true, userPhone: true })
            if (subscriberRef.current) {
                subscriberRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                })
            }
            setIsEditing(true)
            return
        }

        if (!isAdultFromBirth6(formData.userDob)) {
            alert(
                "미성년자는 법정대리인 정보를 동반하여야 신청 하실 수 있습니다.\\n(현재 페이지에서는 미성년자 신청이 제한됩니다.)"
            )
            return
        }

        setShowTermsModal(true)
    }

    const handleFinalSubmit = async () => {
        if (isLoading || isProcessing.current) {
            return
        }

        if (!isAgreed) {
            alert("개인정보 수집 및 이용 동의는 필수입니다.")
            return
        }

        if (!formData.userName || formData.userName.trim() === "") {
            alert("이름을 입력해주세요.")
            return
        }

        if (!formData.userDob || formData.userDob.length !== 6) {
            alert("생년월일 6자리를 정확히 입력해주세요.")
            return
        }

        if (
            !formData.userPhone ||
            formData.userPhone.replace(/-/g, "").length < 10
        ) {
            alert("휴대폰 번호를 정확히 입력해주세요.")
            return
        }

        isProcessing.current = true
        setIsLoading(true)

        try {
            const storedData = sessionStorage.getItem("data")
            const parsedData = storedData ? JSON.parse(storedData) : null
            const storedSheet = sessionStorage.getItem("sheet")
            const parsedSheet = storedSheet ? JSON.parse(storedSheet) : null

            const isConsultation = false
            const profileId = userState.isLoggedIn ? userState.id : null

            // 1. 아이폰 17 분기
            if (
                parsedData?.device?.model &&
                preorderModel.includes(parsedData.device.model)
            ) {
                const { error } = await supabase.from("iphone17_order").insert([
                    {
                        profile_id: profileId,
                        model: parsedData?.device?.model,
                        capacity: parsedData?.device?.capacity ?? "",
                        color: parsedData?.color?.kr,
                        pet_name: parsedData?.device?.pet_name,
                        name: formData.userName,
                        phone: formData.userPhone,
                        birthday: formData.userDob,
                        register: parsedData?.register,
                        plan:
                            parsedData?.selectedPlan?.name ||
                            parsedSheet?.planName,
                        discount: parsedSheet?.discount,
                        carrier: parsedData?.carrier,
                        benefit: parsedSheet?.ktmarketSubsidy,
                        installment: parsedSheet?.installment,
                        form_link:
                            parsedData?.form_link || parsedSheet?.formLink,
                        freebie: parsedSheet?.freebie,
                        freebie_second: parsedData?.freebieSecond,
                        is_guaranteed_return:
                            parsedSheet?.isGuaranteedReturn ?? false,
                        installment_principal:
                            parsedSheet?.installmentPrincipal,
                        is_consultation: isConsultation,
                    },
                ])
                if (error) throw error
            }
            // 2. 갤럭시 S26 분기
            else if (
                parsedData?.device?.model &&
                s26OrderModel.includes(parsedData.device.model)
            ) {
                const row = {
                    profile_id: profileId,
                    petName: parsedData?.device?.pet_name,
                    device: parsedData?.device?.model,
                    capacity: parsedData?.device?.capacity ?? "",
                    color: parsedData?.color?.kr,
                    name: formData.userName,
                    phone: normalizePhoneNumberWithHyphen(formData.userPhone),
                    birthday: formData.userDob,
                    register: parsedData?.register,
                    plan: parsedSheet?.planName,
                    discount: parsedSheet?.discount,
                    carrier: parsedData?.carrier,
                    benefit:
                        parsedData?.ktmarketSubsidy ||
                        parsedSheet?.ktmarketSubsidy,
                    installment:
                        parsedData?.installment || parsedSheet?.installment,
                    freebie: parsedSheet?.freebie,
                    installment_principal: parsedSheet?.installmentPrincipal,
                    is_consultation: isConsultation,
                }

                const { error } = await supabase
                    .from("s26_orders")
                    .insert([row])

                if (error) {
                    if ((error as any).code === "23505") {
                        window.location.href = props.nextPageUrl
                        return
                    }
                    console.error("Supabase insert error:", error)
                    window.location.href = props.nextPageUrl
                    return
                }
            } else if (
                parsedData?.device?.model &&
                aip17eOrderModel.includes(parsedData.device.model)
            ) {
                const row = {
                    profile_id: profileId,
                    petName: parsedData?.device?.pet_name,
                    device: parsedData?.device?.category || "iPhone 17e", // 카테고리나 기본 기기명
                    model: parsedData?.device?.model,
                    capacity: parsedData?.device?.capacity ?? "",
                    color: parsedData?.color?.kr,
                    name: formData.userName,
                    phone: normalizePhoneNumberWithHyphen(formData.userPhone),
                    birthday: formData.userDob,
                    register: parsedData?.register,
                    plan: parsedSheet?.planName,
                    discount: parsedSheet?.discount,
                    carrier: parsedData?.carrier,
                    benefit:
                        parsedData?.ktmarketSubsidy ||
                        parsedSheet?.ktmarketSubsidy,
                    installment:
                        parsedData?.installment || parsedSheet?.installment,
                    installment_principal: parsedSheet?.installmentPrincipal,
                    freebie: parsedSheet?.freebie,
                    is_consultation: isConsultation,
                }

                const { error } = await supabase
                    .from("preorder_17e_orders")
                    .insert([row])

                if (error) {
                    if ((error as any).code === "23505") {
                        // 연락처 UNIQUE 제약 조건 위반 시(이미 신청한 번호) 부드럽게 다음 페이지로 이동
                        window.location.href = props.nextPageUrl
                        return
                    }
                    console.error("Supabase insert error (17e):", error)
                    window.location.href = props.nextPageUrl
                    return
                }
            }
            // 3. 그 외 기본 온라인 오더 분기
            else {
                const { error } = await supabase.from("online_order").insert([
                    {
                        profile_id: profileId,
                        petName: parsedData?.device?.pet_name,
                        device: parsedData?.device?.model,
                        capacity: parsedData?.device?.capacity ?? "",
                        color: parsedData?.color?.kr,
                        name: formData.userName,
                        phone: formData.userPhone,
                        birthday: formData.userDob,
                        register: parsedData?.register,
                        carrier: parsedData?.carrier,
                        plan: parsedSheet?.planName,
                        discount: parsedSheet?.discount,
                        benefit: parsedData?.ktmarketSubsidy,
                        installment: parsedData?.installment,
                        freebie: parsedSheet?.freebie,
                        installment_principal:
                            parsedSheet?.installmentPrincipal,
                        is_consultation: isConsultation,
                    },
                ])
                if (error) throw error
            }

            window.location.href = props.nextPageUrl
        } catch (e: any) {
            console.error("Submit error:", e)
            alert(`저장 중 오류가 발생했습니다: ${e.message}`)
            setIsLoading(false)
            isProcessing.current = false
        }
    }

    if (!isMounted) return null

    // --- 렌더링 영역 ---
    if (isInitialLoading) {
        return (
            <div style={{ ...containerStyle, ...animationStyle }}>
                <div style={{ padding: "0 20px 0px 20px" }}>
                    <SkeletonBox width="200px" height="26px" />
                    <div style={{ marginTop: "8px" }}>
                        <SkeletonBox width="150px" height="26px" />
                    </div>
                </div>
                <ProductCardSkeleton />
                <div style={dividerStyle} />
                <SectionSkeleton />
                <div style={dividerStyle} />
                <SectionSkeleton />
                <div style={dividerStyle} />
                <SectionSkeleton />
                <div style={bottomContainerStyle}>
                    <SkeletonBox
                        width="100%"
                        height="56px"
                        borderRadius="16px"
                    />
                </div>
            </div>
        )
    }

    return (
        <div style={{ ...containerStyle, ...animationStyle }}>
            {isLoading && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 99999,
                    }}
                >
                    {typeof LoadingIndicator !== "undefined" ? (
                        <LoadingIndicator />
                    ) : (
                        <div
                            style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#333",
                            }}
                        >
                            처리 중...
                        </div>
                    )}
                </div>
            )}

            <div style={{ padding: "0 20px 0px 20px" }}>
                <h2
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        margin: 0,
                        color: "#191F28",
                        lineHeight: "1.4",
                    }}
                >
                    아래 정보가 맞는지
                    <br />
                    확인해주세요
                </h2>
            </div>

            {orderData && (
                <div style={productCardStyle}>
                    <div style={productImageWrapperStyle}>
                        {orderData.imageUrl ? (
                            <img
                                src={orderData.imageUrl}
                                alt="Device"
                                style={imgStyle}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background: "#eee",
                                }}
                            />
                        )}
                    </div>
                    <div style={productInfoStyle}>
                        <div style={productTitleStyle}>
                            {orderData.devicePetName}
                        </div>
                        <div style={productSpecStyle}>
                            {orderData.deviceCapacity} · {orderData.deviceColor}
                        </div>
                    </div>
                </div>
            )}

            <div style={dividerStyle} />

            <div style={sectionHeaderStyle} ref={subscriberRef}>
                <div style={iconCircleStyle}>
                    <UserIcon />
                </div>
                <div style={headerTitleStyle}>가입자 정보</div>
            </div>

            <div style={listStyle}>
                {showInputForm ? (
                    <div
                        key="input-form"
                        style={{ animation: "fadeIn 0.4s ease" }}
                    >
                        <div>
                            <InputGroup
                                label="이름"
                                value={formData.userName}
                                onChange={(e: any) =>
                                    handleInputChange(
                                        "userName",
                                        e.target.value
                                    )
                                }
                                onBlur={() => handleInputBlur("userName")}
                                placeholder="실명 입력"
                                error={
                                    touched.userName && !isNameValid
                                        ? "이름을 입력해주세요"
                                        : undefined
                                }
                            />
                            <InputGroup
                                label="생년월일 (6자리)"
                                placeholder="예: 900101"
                                value={formData.userDob}
                                onChange={(e: any) =>
                                    handleInputChange("userDob", e.target.value)
                                }
                                onBlur={() => handleInputBlur("userDob")}
                                error={
                                    touched.userDob && !isDobValid
                                        ? "생년월일 6자리를 입력해주세요"
                                        : undefined
                                }
                            />
                            <InputGroup
                                label="휴대폰 번호"
                                placeholder="숫자만 입력"
                                value={formData.userPhone}
                                onChange={(e: any) =>
                                    handleInputChange(
                                        "userPhone",
                                        e.target.value
                                    )
                                }
                                onBlur={() => handleInputBlur("userPhone")}
                                error={
                                    touched.userPhone && !isPhoneValid
                                        ? "휴대폰 번호를 정확히 입력해주세요"
                                        : undefined
                                }
                            />
                            <button
                                style={{
                                    ...smallButtonStyle,
                                    width: "100%",
                                    marginTop: "20px",
                                    padding: "16px",
                                    backgroundColor: isFormComplete
                                        ? "#333D4B"
                                        : "#E5E8EB",
                                    color: isFormComplete
                                        ? "#FFFFFF"
                                        : "#B0B8C1",
                                    fontWeight: 700,
                                    fontSize: "15px",
                                    borderRadius: "12px",
                                    transition: "all 0.2s",
                                }}
                                onClick={handleSaveInput}
                            >
                                {isFormComplete && isInitialEntry
                                    ? "입력 완료 (자동 저장 중...)"
                                    : "입력 완료"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        key="summary-view"
                        style={{
                            animation: "fadeIn 0.4s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                        }}
                    >
                        <InfoRow
                            label="이름"
                            value={formData.userName}
                            hasButton={true}
                            buttonLabel="수정"
                            onEdit={handleEditClick}
                        />
                        <InfoRow label="생년월일" value={formData.userDob} />
                        <InfoRow label="연락처" value={formData.userPhone} />
                    </div>
                )}
            </div>

            <div style={dividerStyle} />

            <div style={sectionHeaderStyle}>
                <div style={{ ...iconCircleStyle, backgroundColor: "#8B5CF6" }}>
                    <PhoneIcon />
                </div>
                <div style={headerTitleStyle}>개통 정보</div>
            </div>
            <div style={listStyle}>
                <InfoRow label="가입유형" value={orderData?.joinType} />
                <InfoRow label="할인유형" value={orderData?.discountType} />
                <InfoRow
                    label="약정기간"
                    value={`${orderData?.contract || 24}개월`}
                />
            </div>

            <div style={dividerStyle} />

            <div style={sectionHeaderStyle}>
                <div style={{ ...iconCircleStyle, backgroundColor: "#22C55E" }}>
                    <PlanIcon />
                </div>
                <div style={headerTitleStyle}>요금제 정보</div>
            </div>
            <div style={listStyle}>
                <InfoRow label="요금제명" value={orderData?.planName} />
                <InfoRow
                    label="월 납부액"
                    value={`${formatPrice(orderData?.monthlyPayment || 0)}원`}
                />
            </div>

            <div style={warningBoxStyle}>
                <div style={warningIconStyle}>i</div>
                <div style={warningTextStyle}>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                        최소 6개월간 요금제를 유지해주세요.
                    </div>
                    <div style={{ color: "#4E5968", fontSize: "13px" }}>
                        6개월 뒤에는 LTE/5G 50,000원 이상 요금제로 변경할 수
                        있어요.
                    </div>
                </div>
            </div>

            <div style={bottomContainerStyle}>
                <button style={confirmButtonStyle} onClick={handleApplyClick}>
                    신청하기
                </button>
            </div>

            {showTermsModal && (
                <div style={overlayStyle}>
                    <div style={modalSheetStyle}>
                        <div
                            style={termHeaderContainerStyle}
                            onClick={() => setIsAgreed(!isAgreed)}
                        >
                            <Checkbox checked={isAgreed} />
                            <span style={termHeaderTitleStyle}>
                                개인정보 수집 및 이용 동의 (필수)
                            </span>
                            <div
                                style={termExpandIconStyle}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsTermExpanded(!isTermExpanded)
                                }}
                            >
                                <ChevronDown
                                    style={{
                                        transform: isTermExpanded
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                        transition: "transform 0.2s",
                                    }}
                                />
                            </div>
                        </div>

                        {isTermExpanded && (
                            <div style={termDetailContainerStyle}>
                                <div style={termDescriptionStyle}>
                                    고객님이 입력한 개인정보는 상담, 개통,
                                    배송을 위해 수집되며,
                                    <br />
                                    관계 법령에 따라 6개월간 보관 후 파기됩니다.
                                </div>
                                <div style={termTableStyle}>
                                    <div style={termTableRowStyle}>
                                        <div style={termTableHeaderStyle}>
                                            수집목적
                                        </div>
                                        <div style={termTableCellStyle}>
                                            가입상담, 개통, 배송
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            ...termTableRowStyle,
                                            borderBottom: "none",
                                        }}
                                    >
                                        <div style={termTableHeaderStyle}>
                                            수집항목
                                        </div>
                                        <div style={termTableCellStyle}>
                                            이름, 생년월일, 연락처
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: "30px" }}>
                            <button
                                style={{
                                    ...confirmButtonStyle,
                                    backgroundColor: isAgreed
                                        ? "#4285F4"
                                        : "#A0C3FF",
                                    cursor: isAgreed
                                        ? "pointer"
                                        : "not-allowed",
                                }}
                                onClick={handleFinalSubmit}
                                disabled={isLoading || !isAgreed}
                            >
                                {isLoading ? "접수 중..." : "동의하고 신청완료"}
                            </button>
                        </div>
                    </div>
                    <div
                        style={overlayBackgroundStyle}
                        onClick={() => !isLoading && setShowTermsModal(false)}
                    />
                </div>
            )}
        </div>
    )
}

// --- Helper Components & Styles ---
const SkeletonBox = ({
    width = "100%",
    height = "20px",
    borderRadius = "8px",
}: any) => (
    <div
        style={{
            width,
            height,
            borderRadius,
            backgroundColor: "#F2F4F6",
            animation: "skeleton-loading 1.5s ease-in-out infinite",
        }}
    />
)

const ProductCardSkeleton = () => (
    <div style={productCardStyle}>
        <div style={productImageWrapperStyle}>
            <SkeletonBox width="100%" height="100%" borderRadius="12px" />
        </div>
        <div style={productInfoStyle}>
            <SkeletonBox width="150px" height="18px" />
            <SkeletonBox width="100px" height="14px" />
        </div>
    </div>
)

const SectionSkeleton = () => (
    <div>
        <div style={sectionHeaderStyle}>
            <SkeletonBox width="32px" height="32px" borderRadius="50%" />
            <SkeletonBox width="100px" height="18px" />
        </div>
        <div style={listStyle}>
            <div style={rowStyle}>
                <SkeletonBox width="80px" height="16px" />
                <SkeletonBox width="120px" height="16px" />
            </div>
            <div style={rowStyle}>
                <SkeletonBox width="80px" height="16px" />
                <SkeletonBox width="100px" height="16px" />
            </div>
            <div style={rowStyle}>
                <SkeletonBox width="80px" height="16px" />
                <SkeletonBox width="140px" height="16px" />
            </div>
        </div>
    </div>
)

const InfoRow = ({
    label,
    value,
    hasButton = false,
    onEdit,
    buttonLabel = "입력",
}: any) => (
    <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <div style={valueContainerStyle}>
            <span style={valueStyle}>{value}</span>
            {hasButton && (
                <button style={smallButtonStyle} onClick={onEdit}>
                    {buttonLabel}
                </button>
            )}
        </div>
    </div>
)

const InputGroup = ({
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
}: any) => (
    <div style={{ marginBottom: "20px" }}>
        <div style={{ ...inputLabelStyle, marginBottom: "8px" }}>{label}</div>
        <input
            style={{
                ...inputStyle,
                padding: "16px",
                border: error ? "1px solid #FF3B30" : "1px solid #E5E8EB",
            }}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
        />
        {error && (
            <div
                style={{ color: "#FF3B30", fontSize: "13px", marginTop: "6px" }}
            >
                {error}
            </div>
        )}
    </div>
)

const Checkbox = ({ checked }: { checked: boolean }) => (
    <div
        style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            border: checked ? "none" : "1px solid #D1D6DB",
            backgroundColor: checked ? "#4285F4" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            flexShrink: 0,
            transition: "0.2s",
        }}
    >
        {checked && (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        )}
    </div>
)

// --- Icons ---
const ChevronDown = ({ style }: { style?: React.CSSProperties }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#191F28"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
)
const UserIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
)
const PhoneIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
)
const PlanIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
)

// --- Styles ---
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes skeleton-loading {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
        }
    `
    if (!document.getElementById("framer-custom-styles")) {
        styleSheet.id = "framer-custom-styles"
        document.head.appendChild(styleSheet)
    }
}

const animationStyle: React.CSSProperties = {
    animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
}
const containerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    paddingTop: "20px",
    backgroundColor: "#FFFFFF",
    paddingBottom: "40px",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    // ❌ fontFamily 선언 삭제됨
}

// Product Card
const productCardStyle: React.CSSProperties = {
    width: "100%",
    paddingTop: "20px",
    paddingBottom: "20px",
    paddingLeft: "20px",
    paddingRight: "20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxSizing: "border-box",
}

const productImageWrapperStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}

const imgStyle: React.CSSProperties = {
    width: "90%",
    height: "90%",
    objectFit: "contain",
}

const productInfoStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "4px",
}

const productTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1d1d1f",
}

const productSpecStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#86868b",
    fontWeight: 500,
}

// Common Headers
const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    padding: "0 20px",
}
const iconCircleStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#4285F4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}
const headerTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#191F28",
}

// List Items
const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "0 20px",
}
const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "24px",
}
const labelStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#8B95A1",
    width: "80px",
    fontWeight: 500,
}
const valueContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    justifyContent: "space-between",
}
const valueStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 500,
    color: "#333D4B",
}

// Buttons
const smallButtonStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: "13px",
    color: "#4E5968",
    backgroundColor: "#F2F4F6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
    // ❌ fontFamily 선언 삭제됨
}
const confirmButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px",
    backgroundColor: "#4285F4",
    color: "white",
    fontSize: "17px",
    fontWeight: 700,
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "background 0.2s",
    // ❌ fontFamily 선언 삭제됨
}

const dividerStyle: React.CSSProperties = {
    width: "100%",
    height: "2px",
    backgroundColor: "#F2F4F6",
    margin: "30px 0",
}

// Form Inputs
const inputLabelStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#8B95A1",
    fontWeight: 500,
}
const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid #E5E8EB",
    backgroundColor: "#FFFFFF",
    color: "#191F28",
    outline: "none",
    boxSizing: "border-box",
    // ❌ fontFamily 선언 삭제됨
}
const bottomContainerStyle: React.CSSProperties = {
    paddingTop: "40px",
    marginTop: "auto",
    padding: "20px 20px 40px 20px",
}

// Modal
const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
}
const overlayBackgroundStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1,
}
const modalSheetStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    padding: "30px 24px 40px 24px",
    zIndex: 2,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    position: "relative",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
}
const termHeaderContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    cursor: "pointer",
}
const termHeaderTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#191F28",
    flex: 1,
}
const termExpandIconStyle: React.CSSProperties = {
    padding: "8px",
    cursor: "pointer",
}
const termDetailContainerStyle: React.CSSProperties = { padding: "0 0 20px 0" }
const termDescriptionStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#6B7280",
    lineHeight: "1.5",
    marginBottom: "20px",
}
const termTableStyle: React.CSSProperties = {
    border: "1px solid #E5E8EB",
    borderRadius: "8px",
    overflow: "hidden",
}
const termTableRowStyle: React.CSSProperties = {
    display: "flex",
    borderBottom: "1px solid #E5E8EB",
}
const termTableHeaderStyle: React.CSSProperties = {
    width: "100px",
    backgroundColor: "#F9FAFB",
    padding: "12px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#333D4B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRight: "1px solid #E5E8EB",
    boxSizing: "border-box",
}
const termTableCellStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px",
    fontSize: "13px",
    color: "#333D4B",
    lineHeight: "1.5",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
}

// Warning Box
const warningBoxStyle: React.CSSProperties = {
    backgroundColor: "#F2F4F6",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    gap: "12px",
    margin: "10px 20px 0 20px",
}
const warningIconStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#4E5968",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "serif",
    flexShrink: 0,
    marginTop: "2px",
}
const warningTextStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#191F28",
    lineHeight: "1.5",
}

addPropertyControls(UserInfoForm, {
    nextPageUrl: {
        type: ControlType.String,
        title: "이동 경로",
        defaultValue: "/phone/write/gate",
        description: "신청 완료 후 이동할 페이지 경로입니다.",
    },
})
