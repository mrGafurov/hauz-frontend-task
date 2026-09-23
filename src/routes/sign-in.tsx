import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  completeEmailLogin,
  requestEmailCode,
} from '../features/auth/auth.functions'
import { getPersonalAccount } from '../features/personal-account/personal-account.functions'
import { getSafeRedirect } from '../features/auth/redirect'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: searchSchema,
  component: SignInPage,
})

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

function SignInPage() {
  const router = useRouter()
  const { redirect } = Route.useSearch()
  const requestCode = useServerFn(requestEmailCode)
  const completeLogin = useServerFn(completeEmailLogin)
  const loadPersonalAccount = useServerFn(getPersonalAccount)
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await requestCode({ data: { email } })
      setStep('code')
    } catch (submissionError) {
      setError(getErrorMessage(submissionError))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCodeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await completeLogin({ data: { secret } })
      const personalAccount = await loadPersonalAccount()
      await router.invalidate()

      const destination = personalAccount
        ? getSafeRedirect(redirect)
        : `/onboarding?redirect=${encodeURIComponent(getSafeRedirect(redirect))}`

      window.location.assign(destination)
    } catch (submissionError) {
      setError(getErrorMessage(submissionError))
    } finally {
      setIsSubmitting(false)
    }
  }

  function startOver() {
    setSecret('')
    setError(null)
    setStep('email')
  }

  return (
    <main>
      <p>
        <Link to="/">Back to home</Link>
      </p>
      <h1>Sign in</h1>

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              autoFocus
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCodeSubmit}>
          <p>Enter the code sent to {email}.</p>
          <label>
            Code
            <input
              inputMode="numeric"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              autoComplete="one-time-code"
              required
              autoFocus
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Checking...' : 'Continue'}
          </button>
          <button type="button" onClick={startOver} disabled={isSubmitting}>
            Use another email
          </button>
        </form>
      )}

      {error ? <p role="alert">{error}</p> : null}
    </main>
  )
}
