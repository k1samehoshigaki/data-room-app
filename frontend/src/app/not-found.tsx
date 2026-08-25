import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: '404 — Page Not Found' };

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh bg-dots">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-150 h-150 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 rounded-full bg-indigo-400/10 blur-[80px]" />
      </div>

      {/* Floating decorative cards */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute top-16 left-12 w-40 h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm rotate-[-8deg] shadow-xl" />
        <div className="absolute top-32 left-28 w-28 h-20 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm rotate-[-4deg]" />
        <div className="absolute bottom-24 right-16 w-44 h-32 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm rotate-10 shadow-xl" />
        <div className="absolute bottom-40 right-36 w-32 h-24 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm rotate-[5deg]" />
        <div className="absolute top-1/3 right-12 w-20 h-20 rounded-xl bg-primary/20 border border-primary/20 backdrop-blur-sm rotate-15" />
        <div className="absolute bottom-1/3 left-14 w-16 h-16 rounded-lg bg-violet-500/20 border border-violet-400/20 backdrop-blur-sm -rotate-12" />
      </div>

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-lg mx-auto">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-black/20">
            <FileQuestion className="h-10 w-10 text-white/80" strokeWidth={1.5} />
          </div>
          {/* Glowing ring */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 blur-sm" />
        </div>

        {/* 404 */}
        <p className="text-8xl font-black text-white/10 select-none leading-none mb-2 tracking-tighter">
          404
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Page not found
        </h1>
        <p className="text-white/55 text-sm md:text-base leading-relaxed mb-10 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or you may not have access to it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            asChild
            variant="ghost"
            className="border border-white/25 bg-white/8 text-white/85 hover:bg-white/18 hover:border-white/50 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-sm h-11 px-6 transition-all duration-200"
          >
            <Link href="/rooms">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
