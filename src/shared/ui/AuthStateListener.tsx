'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/src/shared/lib/supabase/client';
import { useUserStore } from '@/src/shared/stores/useUserStore';

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
        // 초기 로드시에도 프로필 정확하게 조회
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        const isAdmin = profile?.is_admin === true;

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
        // 프로필 정보 조회 (관리자 여부 확인)
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        const isAdmin = profile?.is_admin === true;

        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          isAdmin: isAdmin,
        });

        router.refresh();

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