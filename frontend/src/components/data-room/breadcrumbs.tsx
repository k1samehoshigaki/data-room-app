'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Breadcrumb } from '@/hooks/use-folder';

interface BreadcrumbsProps {
  roomId: string;
  roomName?: string;
  breadcrumbs: Breadcrumb[];
  currentFolderId?: string | null;
  className?: string;
}

export function Breadcrumbs({ roomId, roomName, breadcrumbs, currentFolderId, className }: BreadcrumbsProps) {
  const items = [
    { id: null, name: roomName ?? 'Root', href: `/rooms/${roomId}` },
    ...breadcrumbs.map((b) => ({
      id: b.id,
      name: b.name,
      href: `/rooms/${roomId}/folder/${b.id}`,
    })),
  ];

  return (
    <nav className={cn('flex items-center gap-1 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isCurrent = item.id === currentFolderId || (currentFolderId == null && i === 0 && items.length === 1);
        return (
          <span key={item.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            {isLast || isCurrent ? (
              <span className={cn('font-medium truncate max-w-[160px]', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                {i === 0 && <Home className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />}
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground truncate max-w-[160px] transition-colors"
              >
                {i === 0 && <Home className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />}
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
