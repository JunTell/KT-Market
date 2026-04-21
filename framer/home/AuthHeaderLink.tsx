import { addPropertyControls, ControlType, RenderTarget } from 'framer'
import { checkAuth, loginWithKakao, userState } from 'https://framer.com/m/AuthStore-jiikDX.js'
import { useEffect, useState } from 'react'

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

interface Props {
  loggedOutLabel?: string
  loggedInLabel?: string
  textColor?: string
  fontSize?: number
  fontWeight?: number
}

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function AuthHeaderLink({
  loggedOutLabel = '로그인 / 회원가입',
  loggedInLabel = '마이페이지',
  textColor = '#24292E',
  fontSize = 15,
  fontWeight = 600,
}: Props) {
  const isCanvas = RenderTarget.current() === RenderTarget.canvas
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (isCanvas) {
      setIsLoading(false)
      return
    }
    checkAuth().finally(() => {
      setIsLoggedIn(userState.isLoggedIn ?? false)
      setIsLoading(false)
    })
  }, [isCanvas])

  const handleClick = () => {
    if (isCanvas) return
    if (isLoggedIn) {
      window.location.href = '/mypage'
    } else {
      loginWithKakao()
    }
  }

  const label = isLoading ? ' ' : isLoggedIn ? loggedInLabel : loggedOutLabel

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'none',
        border: 'none',
        padding: '8px 4px',
        cursor: isCanvas ? 'default' : 'pointer',
        fontFamily: FONT,
        fontSize: `${fontSize}px`,
        fontWeight,
        color: textColor,
        letterSpacing: -0.3,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

addPropertyControls(AuthHeaderLink, {
  loggedOutLabel: {
    type: ControlType.String,
    title: 'Logged Out Label',
    defaultValue: '로그인 / 회원가입',
  },
  loggedInLabel: {
    type: ControlType.String,
    title: 'Logged In Label',
    defaultValue: '마이페이지',
  },
  textColor: {
    type: ControlType.Color,
    title: 'Text Color',
    defaultValue: '#24292E',
  },
  fontSize: {
    type: ControlType.Number,
    title: 'Font Size',
    defaultValue: 15,
    min: 10,
    max: 24,
    step: 1,
  },
  fontWeight: {
    type: ControlType.Enum,
    title: 'Font Weight',
    options: [400, 500, 600, 700],
    optionTitles: ['Regular', 'Medium', 'Semibold', 'Bold'],
    defaultValue: 600,
  },
})
