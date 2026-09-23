import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { useServerFn } from '@tanstack/react-start'

import {
  getPersonalAccount,
  updatePersonalAccount,
} from '../features/personal-account/personal-account.functions'

interface ProfileFieldProps {
  children: ReactNode
  id: string
  label: string
  optional?: boolean
}

function ProfileField({ children, id, label, optional = false }: ProfileFieldProps) {
  return (
    <div className="profile-field">
      <label htmlFor={id}>
        {label}
        {optional ? <span className="optional">Optional</span> : null}
      </label>
      {children}
    </div>
  )
}

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
    <main className="page-shell profile-page">
      <div className="profile-heading">
        <div>
          <Link className="back-link" to="/">
            <span aria-hidden="true">←</span> Back to home
          </Link>
          <h1>Your profile</h1>
        </div>
        <div className="profile-badge">
          <span className="status-dot" aria-hidden="true" />
          <span>{account.role === 'realtor' ? 'Realtor' : 'Property Owner'}</span>
        </div>
      </div>

      <section className="form-card profile-card">
        <div className="form-card__top">
          <span className="form-step">Personal details</span>
          <span className="form-note">Last updated when you save</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <ProfileField id="first-name" label="First name">
              <input
                id="first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
              />
            </ProfileField>
            <ProfileField id="last-name" label="Last name">
              <input
                id="last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                required
              />
            </ProfileField>
          </div>
          <ProfileField id="contact-email" label="Contact email" optional>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </ProfileField>
          <ProfileField id="bio" label="Bio" optional>
            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="A line or two about what you’re looking for..."
              rows={5}
            />
          </ProfileField>
          <button className="button button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        {saved ? <p className="form-success" role="status">Profile saved.</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </section>
    </main>
  )
}
