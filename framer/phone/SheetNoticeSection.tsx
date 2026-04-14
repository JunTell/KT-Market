import { addPropertyControls, ControlType } from "framer"

const FONT = '"Pretendard", "Inter", sans-serif'

/**
 * @framerIntrinsicWidth 350
 * @framerIntrinsicHeight 100
 */
export function SheetNoticeSection(props) {
    return (
        <div
            style={{
                backgroundColor: "#F2F4F6",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "12px",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                fontFamily: FONT,
                ...props.style,
            }}
        >
            {/* 아이콘 영역 */}
            <div
                style={{
                    minWidth: "20px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#191F28",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                    fontFamily: FONT,
                    marginTop: "2px",
                }}
            >
                i
            </div>

            {/* 텍스트 영역 */}
            <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
                <div
                    style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#4E5968",
                        textAlign: "left",
                        lineHeight: "1.4",
                        fontFamily: FONT,
                    }}
                >
                    {props.title}
                </div>
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: "400",
                        color: "#9CA3AF",
                        textAlign: "left",
                        lineHeight: "1.5",
                        whiteSpace: "pre-line",
                        fontFamily: FONT,
                    }}
                >
                    {props.description}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(SheetNoticeSection, {
    title: {
        type: ControlType.String,
        title: "제목",
        defaultValue: "최소 6개월간 요금제를 유지해주세요.",
    },
    description: {
        type: ControlType.String,
        title: "내용",
        displayTextArea: true,
        defaultValue:
            "6개월 뒤에는 LTE/5G 50,000원 이상 요금제로 변경할 수 있어요.",
    },
})
