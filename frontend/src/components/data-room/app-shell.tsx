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
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
                <path d="M1.5 10.143V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.143A4.483 4.483 0 0019.5 12h-15a4.483 4.483 0 00-3 1.143z" />
              </svg>
            </div>
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
