'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataRoomLogoIcon } from '@/components/ui/data-room-logo';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';
import { ShareModal } from '@/components/modals/share-modal';
import { PdfViewerModal } from '@/components/modals/pdf-viewer-modal';
import { UploadDrawer } from '@/components/upload/upload-drawer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // After Google OAuth, the cookie is set but the Zustand store is empty.
    // Fetch /me to hydrate the store with full user data (incl. avatarUrl).
    if (!user) {
      authApi.me()
        .then((res) => setUser(res.data))
        .catch(() => null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await authApi.logout().catch(() => null);
    await fetch('/api/auth/clear-token', { method: 'POST' }).catch(() => null);
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/rooms" className="flex items-center gap-2.5 shrink-0 group">
            <DataRoomLogoIcon
              fill="white"
              className="bg-primary shadow-sm shadow-primary/30 group-hover:shadow-primary/50 transition-shadow"
            />
            <span className="font-semibold text-sm tracking-tight hidden sm:block">DataRoom</span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {mounted && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2.5 border-b border-border/60">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent h-8 px-3"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        {children}
      </main>

      {/* Global modals */}
      <ShareModal />
      <PdfViewerModal />
      <UploadDrawer />
    </div>
  );
}
