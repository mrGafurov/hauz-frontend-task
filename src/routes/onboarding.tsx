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
    <main>
      <p>
        <Link to="/">Back to home</Link>
      </p>
      <h1>Tell us about yourself</h1>
      <form onSubmit={handleSubmit}>
        <label>
          First name
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
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
            required
          />
        </label>
        <label>
          Role
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
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Continue'}
        </button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
    </main>
  )
}
