import assert from 'node:assert/strict'
import test from 'node:test'

import { getSafeRedirect } from '../src/features/auth/redirect.ts'

test('keeps a same-origin redirect path', () => {
  assert.equal(getSafeRedirect('/profile?tab=about#bio'), '/profile?tab=about#bio')
})

test('rejects an external redirect', () => {
  assert.equal(getSafeRedirect('https://evil.example/steal'), '/')
})

test('rejects a protocol-relative redirect', () => {
  assert.equal(getSafeRedirect('//evil.example/steal'), '/')
})
