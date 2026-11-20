import { Suspense } from 'react'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Logo } from '@/components/logo'

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <Logo className="h-8" />
      {/* useSearchParams (?email=) needs a Suspense boundary for static rendering. */}
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  )
}
