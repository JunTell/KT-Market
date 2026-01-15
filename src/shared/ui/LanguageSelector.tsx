'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

type Language = {
  code: string; 
  label: string;
  locale: string;
};

const LANGUAGES: Language[] = [
  { code: 'KO', label: '한국어', locale: 'ko' },
  { code: 'EN', label: 'English', locale: 'en' },
  { code: 'JP', label: '日本語', locale: 'ja' },
  { code: 'CN', label: '中文', locale: 'zh' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname?.split('/')[1] || 'ko';
  
  const currentLang = LANGUAGES.find(l => l.locale === currentLocale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setIsOpen(false);
    
    if (!pathname) return;

    const segments = pathname.split('/');
  
    segments[1] = lang.locale; 
    
    const newPath = segments.join('/');
    
    router.push(newPath);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* 선택 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2
          bg-background border border-line-200
          rounded-md transition-all duration-200
          hover:bg-background-alt
          ${isOpen ? 'ring-2 ring-primary border-transparent' : ''}
        `}
      >
        <span className="text-[14px] font-medium text-label-900">
          {currentLang.code}
        </span>
        
        {/* 화살표 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 text-label-700 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32">
          <ul className="
            bg-background 
            border border-line-200 
            rounded-md 
            shadow-lg overflow-hidden
          ">
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleSelect(lang)}
                  className={`
                    w-full text-left px-4 py-2.5 text-[14px] transition-colors
                    hover:bg-background-alt
                    ${
                      currentLang.locale === lang.locale
                        ? 'text-primary font-semibold bg-background-alt'
                        : 'text-label-800'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{lang.label}</span>
                    {/* 선택된 항목 체크 표시 */}
                    {currentLang.locale === lang.locale && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}