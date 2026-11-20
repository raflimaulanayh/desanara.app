import { Suspense } from 'react'
import { LoginForm } from '@/components/login-form'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
      <Logo className="h-12" />
      {/* useSearchParams (?next=) needs a Suspense boundary for static rendering. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}
