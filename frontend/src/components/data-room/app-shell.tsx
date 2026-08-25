'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Database } from 'lucide-react';
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
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    await authApi.logout().catch(() => null);
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
        <Link href="/rooms" className="flex items-center gap-2 font-semibold text-sm">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground">
            <Database className="h-4 w-4" />
          </div>
          DataRoom
        </Link>

        <div className="flex items-center gap-1">
          {mounted && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign out</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container max-w-5xl mx-auto py-6 px-4 md:px-6">
        {children}
      </main>

      {/* Global modals */}
      <ShareModal />
      <PdfViewerModal />
      <UploadDrawer />
    </div>
  );
}
