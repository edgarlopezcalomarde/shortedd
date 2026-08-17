import { describe, expect, it } from 'vitest'
import { checkConfusableHostname } from '@/security/confusables'
import { decodePunycodeLabel } from '@/security/punycode'

describe('decodePunycodeLabel', () => {
  it('decodes "münchen" correctly (real-world IDN example)', () => {
    const punycodeHost = new URL('https://münchen.de').hostname
    expect(punycodeHost).toBe('xn--mnchen-3ya.de')
    expect(decodePunycodeLabel('mnchen-3ya')).toBe('münchen')
  })

  it('round-trips every fixture Unicode hostname through native URL + our decoder', () => {
    const cases = ['münchen.de', 'пример.рф']
    for (const host of cases) {
      const punycodeHostname = new URL(`https://${host}`).hostname
      const decodedLabels = punycodeHostname
        .split('.')
        .map((label) =>
          label.startsWith('xn--')
            ? decodePunycodeLabel(label.slice(4))
            : label,
        )
      expect(decodedLabels.join('.').toLowerCase()).toBe(host.toLowerCase())
    }
  })
})

describe('checkConfusableHostname', () => {
  it('flags a Cyrillic/Latin mixed-script homograph label', () => {
    // "аpple.com" con la primera letra en cirílico (U+0430) en vez de latina.
    const mixedHostname = new URL('https://аpple.com').hostname
    const result = checkConfusableHostname(mixedHostname)
    expect(result.suspicious).toBe(true)
    expect(result.reason).toMatch(/alfabetos/i)
  })

  it('does not flag a normal ASCII hostname', () => {
    expect(checkConfusableHostname('example.com').suspicious).toBe(false)
  })

  it('does not flag a fully non-Latin hostname (single script)', () => {
    const hostname = new URL('https://пример.рф').hostname
    expect(checkConfusableHostname(hostname).suspicious).toBe(false)
  })

  it('does not flag a legitimate accented IDN like münchen.de', () => {
    const hostname = new URL('https://münchen.de').hostname
    expect(checkConfusableHostname(hostname).suspicious).toBe(false)
  })
})
