import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { CallbackHandler } from './callback-handler';

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
