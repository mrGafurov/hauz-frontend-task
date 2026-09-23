import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'

import {
  getPersonalAccount,
  updatePersonalAccount,
} from '../features/personal-account/personal-account.functions'

export const Route = createFileRoute('/profile')({
  loader: async () => {
    const account = await getPersonalAccount()

    if (!account) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: '/profile' },
      })
    }

    return account
  },
  component: ProfilePage,
})

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

function ProfilePage() {
  const router = useRouter()
  const account = Route.useLoaderData()
  const updateAccount = useServerFn(updatePersonalAccount)
  const [firstName, setFirstName] = useState(account.firstName)
  const [lastName, setLastName] = useState(account.lastName)
  const [contactEmail, setContactEmail] = useState(account.contactEmail ?? '')
  const [bio, setBio] = useState(account.bio ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setIsSubmitting(true)

    try {
      const updated = await updateAccount({
        data: {
          firstName,
          lastName,
          contactEmail: contactEmail.trim() || null,
          bio: bio.trim() || null,
        },
      })

      setFirstName(updated.firstName)
      setLastName(updated.lastName)
      setContactEmail(updated.contactEmail ?? '')
      setBio(updated.bio ?? '')
      await router.invalidate()
      setSaved(true)
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
      <h1>Profile</h1>
      <p>Role: {account.role === 'realtor' ? 'Realtor' : 'Property Owner'}</p>

      <form onSubmit={handleSubmit}>
        <label>
          First name
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            required
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
          Contact email
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Bio
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {saved ? <p role="status">Profile saved.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </main>
  )
}
