import { afterEach, describe, expect, it, vi } from 'vitest'
import { decideBootstrap, runBootstrap } from '@/routing/bootstrap'
import { encodeToWebFragment } from '@/codec/v1/registry'
import { normalizeUrl } from '@/codec/v1/normalize'

const ORIGIN = 'https://short.example'

describe('decideBootstrap (pure)', () => {
  it('mounts the app when there is no payload', () => {
    expect(decideBootstrap(null, ORIGIN)).toEqual({ action: 'mount' })
  })

  it('redirects for a valid web payload', () => {
    const normalized = normalizeUrl('https://example.com/target')
    const payload = encodeToWebFragment(normalized)
    expect(decideBootstrap({ kind: 'web', raw: payload }, ORIGIN)).toEqual({
      action: 'redirect',
      url: normalized,
    })
  })

  it('errors (never redirects) for an invalid payload', () => {
    const decision = decideBootstrap(
      { kind: 'web', raw: 'v1.not-valid!!' },
      ORIGIN,
    )
    expect(decision.action).toBe('error')
  })

  it('errors for an unknown version', () => {
    const decision = decideBootstrap({ kind: 'qr', raw: 'V9.ABC' }, ORIGIN)
    expect(decision.action).toBe('error')
  })

  it('confirms (does not silently redirect) for a confusable homograph hostname', () => {
    const normalized = normalizeUrl('https://аpple.com/login') // 'а' cirílico
    const payload = encodeToWebFragment(normalized)
    const decision = decideBootstrap({ kind: 'web', raw: payload }, ORIGIN)
    expect(decision).toEqual({
      action: 'confirm',
      url: normalized,
      reason: expect.stringMatching(/alfabetos/i),
    })
  })

  it('errors (never redirects) when the destination points back at the current origin', () => {
    const normalized = normalizeUrl(`${ORIGIN}/#v1.somethingelse`)
    const payload = encodeToWebFragment(normalized)
    const decision = decideBootstrap({ kind: 'web', raw: payload }, ORIGIN)
    expect(decision.action).toBe('error')
  })
})

describe('runBootstrap (side effects)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })

  it('calls location.replace only for a valid payload', () => {
    const replaceSpy = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {})

    const normalized = normalizeUrl('https://example.com/target')
    window.location.hash = `#${encodeToWebFragment(normalized)}`

    const decision = runBootstrap()

    expect(decision).toEqual({ action: 'redirect', url: normalized })
    expect(replaceSpy).toHaveBeenCalledTimes(1)
    expect(replaceSpy).toHaveBeenCalledWith(normalized)
  })

  it('never calls location.replace for an invalid payload', () => {
    const replaceSpy = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {})

    window.location.hash = '#v1.definitely-not-valid'

    const decision = runBootstrap()

    expect(decision.action).toBe('error')
    expect(replaceSpy).not.toHaveBeenCalled()
  })

  it('never calls location.replace for a confusable hostname (shows the interstitial instead)', () => {
    const replaceSpy = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {})

    const normalized = normalizeUrl('https://аpple.com/login')
    window.location.hash = `#${encodeToWebFragment(normalized)}`

    const decision = runBootstrap()

    expect(decision.action).toBe('confirm')
    expect(replaceSpy).not.toHaveBeenCalled()
  })

  it('never calls location.replace for a self-referential (loop) destination', () => {
    const replaceSpy = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {})

    const selfUrl = normalizeUrl(`${window.location.origin}/#v1.xyz`)
    window.location.hash = `#${encodeToWebFragment(selfUrl)}`

    const decision = runBootstrap()

    expect(decision.action).toBe('error')
    expect(replaceSpy).not.toHaveBeenCalled()
  })
})
