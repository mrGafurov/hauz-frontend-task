import { createServerFn } from '@tanstack/react-start'
import { ID } from 'node-appwrite'
import { z } from 'zod'

import { toAuthUser } from './auth-user'
import {
  createAdminAccount,
  createSessionAccount,
} from '../../server/appwrite'
import {
  clearSessionSecret,
  clearPendingLoginUserId,
  getSessionSecret,
  getPendingLoginUserId,
  setPendingLoginUserId,
  setSessionSecret,
} from '../../server/session'

const emailInput = z.object({
  email: z.string().trim().email(),
})

const codeInput = z.object({
  secret: z.string().trim().min(1),
})

export const requestEmailCode = createServerFn({ method: 'POST' })
  .validator(emailInput)
  .handler(async ({ data }) => {
    try {
      const token = await createAdminAccount().createEmailToken({
        userId: ID.unique(),
        email: data.email,
      })

      setPendingLoginUserId(token.userId)
      return { ok: true }
    } catch {
      throw new Error('Could not send the sign-in code. Please try again.')
    }
  })

export const completeEmailLogin = createServerFn({ method: 'POST' })
  .validator(codeInput)
  .handler(async ({ data }) => {
    const userId = getPendingLoginUserId()

    if (!userId) {
      throw new Error('This sign-in code has expired. Please request a new one.')
    }

    try {
      const session = await createAdminAccount().createSession({
        userId,
        secret: data.secret,
      })

      if (!session.secret) {
        throw new Error('Appwrite did not return a session secret.')
      }

      const user = await createSessionAccount(session.secret).get()

      setSessionSecret(session.secret)
      clearPendingLoginUserId()

      return toAuthUser(user)
    } catch {
      throw new Error('The sign-in code is invalid or expired.')
    }
  })

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const sessionSecret = getSessionSecret()

    if (!sessionSecret) {
      return null
    }

    try {
      const user = await createSessionAccount(sessionSecret).get()
      return toAuthUser(user)
    } catch {
      clearSessionSecret()
      return null
    }
  },
)

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const sessionSecret = getSessionSecret()

  if (sessionSecret) {
    try {
      await createSessionAccount(sessionSecret).deleteSession('current')
    } catch {
      // The local cookie must still be cleared if Appwrite already expired it.
    }
  }

  clearSessionSecret()
  return { ok: true }
})
