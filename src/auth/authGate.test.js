import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveAuthGate } from './authGate.js'

describe('resolveAuthGate', () => {
  it('avoids redirects while authentication is loading', () => {
    assert.equal(resolveAuthGate({ status: 'loading', mode: 'protected' }), 'loading')
    assert.equal(resolveAuthGate({ status: 'loading', mode: 'guest' }), 'loading')
  })

  it('sends unauthenticated users to login for protected routes', () => {
    assert.equal(resolveAuthGate({ status: 'unauthenticated', mode: 'protected' }), 'login')
  })

  it('allows authenticated users into the app', () => {
    assert.equal(resolveAuthGate({ status: 'authenticated', mode: 'protected' }), 'allow')
  })

  it('redirects authenticated guests away from login/register', () => {
    assert.equal(resolveAuthGate({ status: 'authenticated', mode: 'guest' }), 'app')
  })

  it('allows guests onto login/register when unauthenticated', () => {
    assert.equal(resolveAuthGate({ status: 'unauthenticated', mode: 'guest' }), 'allow')
  })
})
