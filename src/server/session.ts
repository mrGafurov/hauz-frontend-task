import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'

const SESSION_COOKIE = 'hauz_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  }
}

export function getSessionSecret(): string | undefined {
  return getCookie(SESSION_COOKIE)
}

export function setSessionSecret(secret: string): void {
  setCookie(SESSION_COOKIE, secret, cookieOptions())
}

export function clearSessionSecret(): void {
  deleteCookie(SESSION_COOKIE, cookieOptions())
}
