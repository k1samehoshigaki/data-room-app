import { LoginForm } from '@/components/auth/login-form';

export const metadata = { title: 'Sign In — DataRoom' };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
              <path d="M1.5 10.143V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.143A4.483 4.483 0 0019.5 12h-15a4.483 4.483 0 00-3 1.143z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your DataRoom</p>
        </div>
        <div className="bg-background border rounded-xl p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
