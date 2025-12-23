'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/src/lib/supabase/client'; 
import { useUserStore } from '@/src/stores/useUserStore'; 

export default function AuthStateListener() {
  const { setUser, clearUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // 1. 현재 세션 체크 및 스토어 초기화 함수
    const initializeUser = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (session?.user) {
        // useUserStore의 UserData 타입에 맞춰서 변환
        const isAdmin = 
          session.user.email === 'admin@ktmarket.co.kr' || 
          session.user.app_metadata?.role === 'admin';

        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          isAdmin: isAdmin,
        });
      } else {
        clearUser();
      }
    };

    initializeUser();

    // 2. 로그인/로그아웃 상태 실시간 감지
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth State Change:', event); // 디버깅용

      if (event === 'SIGNED_IN' && session?.user) {
        const isAdmin = 
          session.user.email === 'admin@ktmarket.co.kr' || 
          session.user.app_metadata?.role === 'admin';

        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          isAdmin: isAdmin,
        });
        
        router.refresh(); // UI 갱신
        
      } else if (event === 'SIGNED_OUT') {
        clearUser();
        router.refresh();
        router.push('/'); 
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, router]);

  return null;
}