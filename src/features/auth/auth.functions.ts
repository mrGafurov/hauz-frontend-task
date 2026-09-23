import { createServerFn } from '@tanstack/react-start'

import { toAuthUser } from './auth-user'
import { createSessionAccount } from '../../server/appwrite'
import {
  clearSessionSecret,
  getSessionSecret,
} from '../../server/session'

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
