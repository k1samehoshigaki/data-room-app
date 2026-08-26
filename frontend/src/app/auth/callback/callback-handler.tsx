'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    // Store token first so the axios interceptor can attach it to /me request.
    setToken(token);

    fetch('/api/auth/set-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(() => authApi.me())
      .then((res) => {
        setUser(res.data);
        router.replace('/rooms');
      })
      .catch(() => {
        setToken(null);
        router.replace('/login');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />;
}
