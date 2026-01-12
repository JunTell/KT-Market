import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t border-line-200 bg-background-alt">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12">
        <nav aria-label="Footer" className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-label-900 mb-4">
              KT Market
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  회사 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  채용
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  보도자료
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="text-sm font-semibold text-label-900 mb-4">
              고객 지원
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  고객센터
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* 정책 */}
          <div>
            <h3 className="text-sm font-semibold text-label-900 mb-4">정책</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  환불 정책
                </Link>
              </li>
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="text-sm font-semibold text-label-900 mb-4">
              소셜 미디어
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.facebook.com/ktmarket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/ktmarket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/ktmarket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-label-700 hover:text-label-900 transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mt-12 border-t border-line-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-label-500">
              © {new Date().getFullYear()} KT Market. All rights reserved.
            </p>
            <p className="text-sm text-label-500">
              대표: 홍길동 | 사업자등록번호: 123-45-67890
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
