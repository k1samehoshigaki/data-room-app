import { Shield, Lock, Users } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { AuthLeftPanel } from '@/components/auth/auth-left-panel';
import { DataRoomLogoIcon } from '@/components/ui/data-room-logo';

export const metadata = { title: 'Sign In — DataRoom' };

const features = [
  { icon: Shield, text: 'Bank-grade encrypted storage' },
  { icon: Lock, text: 'Granular access controls' },
  { icon: Users, text: 'Secure team collaboration' },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AuthLeftPanel
        headline={<>Your documents,<br />always <span className="text-white/70">secure</span>.</>}
        subtitle="The virtual data room built for teams that take security seriously."
        features={features}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-10">
          <DataRoomLogoIcon className="bg-primary text-primary-foreground" />
          <span className="font-semibold text-base">DataRoom</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to continue to your workspace</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
