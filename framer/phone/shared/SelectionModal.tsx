function SelectionModal({ isOpen, onClose, onConfirm }) {
    const [selectedType, setSelectedType] = useState("app") // 'app' | 'consultation'

    if (!isOpen) return null

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 99999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: '"Pretendard", sans-serif',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    // [수정] 너비를 화면 꽉 차게 변경 (좌우 여백 20px씩만 남김)
                    width: "calc(100%)",
                    maxWidth: "440px",
                    height: "540px", // 높이 460px 고정
                    borderRadius: "20px",
                    padding: "24px 20px",
                    position: "relative",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    display: "flex",
                    flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <div
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        cursor: "pointer",
                        padding: "8px",
                        zIndex: 10,
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="#24292E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* 타이틀 */}
                <h2
                    style={{
                        fontSize: "22px",
                        fontWeight: "700",
                        color: "#24292E",
                        marginTop: "20px",
                        marginBottom: "24px",
                        textAlign: "left",
                        flexShrink: 0,
                        letterSpacing: -0.44,
                        lineHeight: 1.2,
                    }}
                >
                    함께 하면 더 좋아요
                </h2>

                {/* 카드 선택 영역 */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "20px",
                        flexShrink: 0,
                    }}
                >
                    <SelectCard
                        selected={selectedType === "app"}
                        onClick={() => setSelectedType("app")}
                        title="휴대폰만 신청"
                        desc={`3분만에 온라인신청서 작성하고\n휴대폰 배송 받기`}
                        iconType="phone"
                        hasLightning={true}
                    />
                    <SelectCard
                        selected={selectedType === "consultation"}
                        onClick={() => setSelectedType("consultation")}
                        title={`휴대폰 신청 후\n인터넷·TV 상담`}
                        desc={`상담 후 신청 시\n현금 지원금 추가 제공`}
                        iconType="chat"
                        hasLightning={false}
                    />
                </div>

                {/* 하단 안내 문구 */}
                <div
                    style={{
                        textAlign: "left",
                        marginBottom: "10px",
                        paddingTop: "4px",
                        flexGrow: 1,
                    }}
                >
                    <p
                        style={{
                            fontSize: "13px",
                            color: "#3B72F2",
                            fontWeight: "600",
                            lineHeight: "1.5",
                            letterSpacing: -0.24,
                            margin: 0,
                            wordBreak: "keep-all",
                        }}
                    >
                        ※ 인터넷·TV 상담은 선택 사항이에요.
                        <br />
                        휴대폰 신청과는 무관해요.
                    </p>
                </div>

                {/* 다음 버튼 */}
                <button
                    onClick={() => onConfirm(selectedType)}
                    style={{
                        width: "100%", // 컨테이너 너비 가득 채움
                        padding: "18px",
                        backgroundColor: "#446DF6",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "17px",
                        fontWeight: "600",
                        letterSpacing: -0.34,
                        lineHeight: 1.4,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(68, 109, 246, 0.2)",
                        marginTop: "auto",
                    }}
                >
                    다음
                </button>
            </div>
        </div>
    )
}


is_consultation: isConsultation, // [추가] 상담 여부 저장