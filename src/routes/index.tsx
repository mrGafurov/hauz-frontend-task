import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
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
            <a className="button button--primary" href="/sign-in">
              Sign in
            </a>
            <span className="hero-caption">Use your email to continue</span>
          </div>
        </div>
      </section>
    </main>
  )
}
