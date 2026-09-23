import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'

const SESSION_COOKIE = 'hauz_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7
const LOGIN_USER_COOKIE = 'hauz_login_user'
const LOGIN_MAX_AGE = 60 * 15

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}

export function getSessionSecret(): string | undefined {
  return getCookie(SESSION_COOKIE)
}

export function setSessionSecret(secret: string): void {
  setCookie(SESSION_COOKIE, secret, cookieOptions(SESSION_MAX_AGE))
}

export function clearSessionSecret(): void {
  deleteCookie(SESSION_COOKIE, cookieOptions(0))
}

export function getPendingLoginUserId(): string | undefined {
  return getCookie(LOGIN_USER_COOKIE)
}

export function setPendingLoginUserId(userId: string): void {
  setCookie(LOGIN_USER_COOKIE, userId, cookieOptions(LOGIN_MAX_AGE))
}

export function clearPendingLoginUserId(): void {
  deleteCookie(LOGIN_USER_COOKIE, cookieOptions(0))
}
