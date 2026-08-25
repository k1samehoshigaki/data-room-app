import type { LucideIcon } from 'lucide-react';
import { DataRoomLogoIcon } from '@/components/ui/data-room-logo';

interface Feature {
  icon: LucideIcon;
  text: string;
}

interface AuthLeftPanelProps {
  headline: React.ReactNode;
  subtitle: string;
  features: Feature[];
}

export function AuthLeftPanel({ headline, subtitle, features }: AuthLeftPanelProps) {
  return (
    <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-mesh bg-dots flex-col justify-between p-10 lg:p-14 relative overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <DataRoomLogoIcon
          size="w-9 h-9"
          iconSize="w-5 h-5"
          fill="white"
          className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl"
        />
        <span className="text-white font-semibold text-lg tracking-tight">DataRoom</span>
      </div>

      {/* Headline + features */}
      <div className="relative z-10">
        <h1 className="text-white text-3xl lg:text-4xl font-bold leading-tight mb-4">
          {headline}
        </h1>
        <p className="text-white/60 text-base mb-8 max-w-xs">{subtitle}</p>
        <div className="space-y-3">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 border border-white/15">
                <Icon className="h-3.5 w-3.5 text-white/80" />
              </div>
              <span className="text-white/70 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative cards */}
      <div className="absolute -right-15 top-1/2 -translate-y-1/2 w-72 h-72 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm rotate-12 hidden lg:block" />
      <div className="absolute -right-5 top-1/2 -translate-y-1/3 w-56 h-56 rounded-3xl bg-white/8 border border-white/10 backdrop-blur-sm rotate-6 hidden lg:block" />
    </div>
  );
}
