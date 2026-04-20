// Dead click 자동 감지 + 레이블링
// Clarity 히트맵 보완: 비시맨틱 요소 클릭을 로깅
// 월간 회귀 체크용 — Sentry/GA4에 이벤트 전송

interface DeadClickEvent {
    element: string
    selector: string
    pageUrl: string
    timestamp: number
    x: number
    y: number
}

const DEAD_CLICK_EVENTS: DeadClickEvent[] = []
const FLUSH_INTERVAL = 10000 // 10초마다 배치 전송
const MAX_BUFFER = 50

// 클릭된 요소가 인터랙티브한지 판별
function isInteractive(el: HTMLElement): boolean {
    const tag = el.tagName.toLowerCase()
    if (["a", "button", "input", "select", "textarea", "label"].includes(tag)) return true
    if (el.getAttribute("role") === "button") return true
    if (el.getAttribute("tabindex") != null) return true
    if (el.onclick != null) return true
    if (el.closest("a, button, [role='button'], [onclick]")) return true

    // Framer motion 요소 체크
    const style = window.getComputedStyle(el)
    if (style.cursor === "pointer") return true

    return false
}

// CSS 셀렉터 생성
function getSelector(el: HTMLElement): string {
    const parts: string[] = []
    let current: HTMLElement | null = el
    let depth = 0

    while (current && depth < 5) {
        let selector = current.tagName.toLowerCase()
        if (current.id) {
            selector += `#${current.id}`
            parts.unshift(selector)
            break
        }
        if (current.className && typeof current.className === "string") {
            const classes = current.className.split(/\s+/).filter(c => c && !c.startsWith("framer-")).slice(0, 2)
            if (classes.length > 0) {
                selector += `.${classes.join(".")}`
            }
        }
        parts.unshift(selector)
        current = current.parentElement
        depth++
    }

    return parts.join(" > ")
}

// Dead click 이벤트 배치 전송
function flushEvents() {
    if (DEAD_CLICK_EVENTS.length === 0) return

    const events = [...DEAD_CLICK_EVENTS]
    DEAD_CLICK_EVENTS.length = 0

    // Clarity custom tag (if available)
    const clarity = (window as any).clarity
    if (typeof clarity === "function") {
        clarity("set", "dead_click_count", String(events.length))
        events.forEach(e => {
            clarity("set", "dead_click_element", e.selector)
        })
    }

    // GA4 (if available)
    const gtag = (window as any).gtag
    if (typeof gtag === "function") {
        events.forEach(e => {
            gtag("event", "dead_click", {
                element_selector: e.selector,
                page_url: e.pageUrl,
                click_x: e.x,
                click_y: e.y,
            })
        })
    }

    // Console log for debugging
    if (process.env.NODE_ENV === "development") {
        console.warn(`[DeadClick] ${events.length} dead clicks detected:`, events)
    }
}

// 초기화 — 페이지 로드 시 1회 호출
export function initDeadClickTracker() {
    if (typeof window === "undefined") return

    document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement
        if (!target || !target.tagName) return

        // 인터랙티브 요소가 아닌 곳에서 클릭 발생
        if (!isInteractive(target)) {
            const event: DeadClickEvent = {
                element: target.tagName.toLowerCase(),
                selector: getSelector(target),
                pageUrl: window.location.pathname,
                timestamp: Date.now(),
                x: e.clientX,
                y: e.clientY,
            }

            DEAD_CLICK_EVENTS.push(event)

            // 버퍼 초과 시 즉시 전송
            if (DEAD_CLICK_EVENTS.length >= MAX_BUFFER) {
                flushEvents()
            }
        }
    }, { passive: true, capture: true })

    // 주기적 전송
    setInterval(flushEvents, FLUSH_INTERVAL)

    // 페이지 떠날 때 전송
    window.addEventListener("beforeunload", flushEvents)
}
