'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { supabaseClient } from '@/src/shared/lib/supabase/client';
import { useUserStore } from '@/src/shared/stores/useUserStore';

export default function AuthStateListener() {
  const { user, setUser, clearUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. 현재 세션 체크 및 스토어 동기화
    const syncAuthState = async () => {
      try {
        // getUser()는 서버 검증을 포함하므로 getSession()보다 신뢰성 높음
        const {
          data: { user: authUser },
        } = await supabaseClient.auth.getUser();

        if (authUser) {
          // 이미 스토어에 같은 유저가 있다면 스킵 (불필요한 리프레시 방지)
          if (user?.id === authUser.id) return;

          // 프로필 정보 조회
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('is_admin')
            .eq('id', authUser.id)
            .single();

          const isAdmin = profile?.is_admin === true;

          setUser({
            id: authUser.id,
            email: authUser.email ?? '',
            isAdmin: isAdmin,
          });

          // [핵심] 로그인 직후(또는 페이지 이동 시) 서버 상태와 불일치 시 강제 리프레시
          router.refresh();
        } else {
          // 비로그인 상태인데 스토어에는 유저가 있다면 로그아웃 처리
          if (user) {
            clearUser();
            router.refresh();
          } else {
            // 단순히 비로그인 상태 유지 중
            clearUser();
          }
        }
      } catch (error) {
        console.error('Auth sync error:', error);
        clearUser();
      }
    };

    syncAuthState();

    // 2. 로그인/로그아웃 이벤트 구독
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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
  }, [pathname, setUser, clearUser, router]);

  return null;
}