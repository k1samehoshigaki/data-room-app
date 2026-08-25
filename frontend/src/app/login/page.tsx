import { LoginForm } from '@/components/auth/login-form';
import { Shield, Lock, Users } from 'lucide-react';

export const metadata = { title: 'Sign In — DataRoom' };

const features = [
  { icon: Shield, text: 'Bank-grade encrypted storage' },
  { icon: Lock, text: 'Granular access controls' },
  { icon: Users, text: 'Secure team collaboration' },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel — branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-mesh bg-dots flex-col justify-between p-10 lg:p-14 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
              <path d="M1.5 10.143V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.143A4.483 4.483 0 0019.5 12h-15a4.483 4.483 0 00-3 1.143z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">DataRoom</span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h1 className="text-white text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Your documents,<br />
            always <span className="text-white/70">secure</span>.
          </h1>
          <p className="text-white/60 text-base mb-8 max-w-xs">
            The virtual data room built for teams that take security seriously.
          </p>
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

        {/* Decorative card mockup */}
        <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-72 h-72 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm rotate-12 hidden lg:block" />
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/3 w-56 h-56 rounded-3xl bg-white/8 border border-white/10 backdrop-blur-sm rotate-6 hidden lg:block" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
              <path d="M1.5 10.143V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.143A4.483 4.483 0 0019.5 12h-15a4.483 4.483 0 00-3 1.143z" />
            </svg>
          </div>
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
