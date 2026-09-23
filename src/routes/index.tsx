import { createFileRoute, Link, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const user = useLoaderData({ from: '__root__' })

  return (
    <main className="landing-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Real estate made simple</p>
          <h1>Find your place with HAUZ.</h1>
          <p className="hero-description">
            A simple place to manage your personal details and stay connected
            to the homes you care about.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link className="button button--primary" to="/profile">
                Open profile
              </Link>
            ) : (
              <Link className="button button--primary" to="/sign-in">
                Sign in
              </Link>
            )}
            <span className="hero-caption">
              {user ? 'You are signed in' : 'Use your email to continue'}
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
