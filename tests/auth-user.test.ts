import assert from 'node:assert/strict'
import test from 'node:test'

import { toAuthUser } from '../src/features/auth/auth-user.ts'

test('maps an Appwrite user to the safe identity sent to the browser', () => {
  const user = toAuthUser({
    $id: 'user-123',
    email: 'person@example.com',
    name: 'Person Example',
  })

  assert.deepEqual(user, {
    id: 'user-123',
    email: 'person@example.com',
    name: 'Person Example',
  })
})
