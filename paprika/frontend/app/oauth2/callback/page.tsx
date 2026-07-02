'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

function OAuth2CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      refreshUser().then(() => router.replace('/'));
    } else {
      router.replace('/login?error=oauth2');
    }
  }, [refreshUser, router, searchParams]);

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>로그인 처리 중...</p>
    </main>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense
      fallback={
        <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>로그인 처리 중...</p>
        </main>
      }
    >
      <OAuth2CallbackContent />
    </Suspense>
  );
}
