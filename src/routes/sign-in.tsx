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
    <main className="page-shell auth-page">
      <div className="page-intro">
        <Link className="back-link" to="/">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <h1>Sign in</h1>
        <p>Enter your email to receive a one-time sign-in code.</p>
      </div>

      <section className="form-card">
        <div className="form-card__top">
          <span className="form-step">{step === 'email' ? '01' : '02'} / 02</span>
          <span className="form-note">No password to remember</span>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </label>
            <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit}>
            <p className="form-lead">
              Enter the code sent to <strong>{email}</strong>.
            </p>
            <label>
              One-time code
              <input
                className="code-input"
                inputMode="numeric"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                autoComplete="one-time-code"
                placeholder="000000"
                required
                autoFocus
              />
            </label>
            <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Checking...' : 'Continue'}
            </button>
            <button className="text-button" type="button" onClick={startOver} disabled={isSubmitting}>
              Use another email
            </button>
          </form>
        )}

        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </section>
    </main>
  )
}
