import { Zap, FileCheck, BarChart3 } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';
import { AuthLeftPanel } from '@/components/auth/auth-left-panel';
import { DataRoomLogoIcon } from '@/components/ui/data-room-logo';

export const metadata = { title: 'Create Account — DataRoom' };

const perks = [
  { icon: Zap, text: 'Up and running in minutes' },
  { icon: FileCheck, text: 'Unlimited file versions' },
  { icon: BarChart3, text: 'Detailed access analytics' },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AuthLeftPanel
        headline={<>Start managing<br />documents <span className="text-white/70">smarter</span>.</>}
        subtitle="Join thousands of teams who trust DataRoom for their sensitive documents."
        features={perks}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-10">
          <DataRoomLogoIcon className="bg-primary text-primary-foreground" />
          <span className="font-semibold text-base">DataRoom</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="text-muted-foreground text-sm mt-1">Free to start, no credit card required</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
