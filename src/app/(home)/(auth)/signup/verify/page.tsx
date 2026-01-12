import Link from 'next/link'

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { email } = await searchParams
    const emailStr = typeof email === 'string' ? email : ''

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
            <div className="w-full max-w-[420px] bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                {/* Animated Icon Container */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse"></div>
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Mail Icon */}
                        <svg className="w-10 h-10 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {/* Checkmark Badge */}
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">메일함을 확인해주세요</h1>

                <p className="text-gray-500 text-sm mb-6 leading-relaxed break-keep">
                    인증 링크가 아래 이메일로 발송되었습니다.<br />
                    링크를 클릭하시면 가입이 완료됩니다.
                </p>

                {/* Email Box */}
                {emailStr && (
                    <div className="bg-gray-50 rounded-lg py-3 px-4 mb-8 border border-gray-100">
                        <div className="text-xs text-gray-400 mb-1">발송된 이메일</div>
                        <span className="text-[#0066FF] font-semibold text-base break-all">{emailStr}</span>
                    </div>
                )}

                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="block w-full py-4 bg-[#0066FF] text-white rounded-xl font-bold text-[15px] hover:bg-[#0052cc] transition-all shadow-md shadow-blue-100"
                    >
                        로그인 페이지로 이동
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 text-gray-500 text-sm hover:text-gray-900 transition-colors bg-white hover:bg-gray-50 rounded-lg"
                    >
                        메인으로 돌아가기
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-center max-w-xs mx-auto">
                <p className="text-xs text-gray-400 leading-relaxed">
                    메일이 도착하지 않았나요? <br />
                    스팸 메일함을 확인하거나 잠시 후 다시 시도해주세요.
                </p>
            </div>
        </div>
    )
}
