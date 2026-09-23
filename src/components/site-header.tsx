import { Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'

import type { AuthUser } from '../features/auth/auth-user'
import { logout } from '../features/auth/auth.functions'

interface SiteHeaderProps {
  user: AuthUser | null
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const router = useRouter()
  const logoutFn = useServerFn(logout)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logoutFn()
      await router.invalidate()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-header__brand">
        HAUZ
      </Link>

      {user ? (
        <div className="site-header__account">
          <span>{user.name || user.email}</span>
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      ) : (
        <a href="/sign-in">Sign in</a>
      )}
    </header>
  )
}
