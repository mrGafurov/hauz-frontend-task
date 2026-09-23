import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { createPersonalAccount } from '../features/personal-account/personal-account.functions'
import { getSafeRedirect } from '../features/auth/redirect'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/onboarding')({
  validateSearch: searchSchema,
  component: OnboardingPage,
})

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

function OnboardingPage() {
  const router = useRouter()
  const { redirect } = Route.useSearch()
  const createAccount = useServerFn(createPersonalAccount)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'property_owner' | 'realtor'>('property_owner')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await createAccount({ data: { firstName, lastName, role } })
      await router.invalidate()
      window.location.assign(getSafeRedirect(redirect))
    } catch (submissionError) {
      setError(getErrorMessage(submissionError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-shell auth-page">
      <div className="page-intro">
        <Link className="back-link" to="/">
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <h1>Set up your account</h1>
        <p>Add a few details so we can create your HAUZ profile.</p>
      </div>

      <section className="form-card">
        <div className="form-card__top">
          <span className="form-step">02 / 02</span>
          <span className="form-note">You can edit your name later</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <label>
              First name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                placeholder="Aziza"
                required
                autoFocus
              />
            </label>
            <label>
              Last name
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                placeholder="Karimova"
                required
              />
            </label>
          </div>
          <label>
            I’m here as a...
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as 'property_owner' | 'realtor')
              }
            >
              <option value="property_owner">Property Owner</option>
              <option value="realtor">Realtor</option>
            </select>
          </label>
          <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Continue'}
          </button>
        </form>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </section>
    </main>
  )
}
