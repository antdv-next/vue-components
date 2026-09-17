import { afterEach, describe, expect, it } from 'vitest'
import { getShadowRoot, inShadow } from '../src/Dom/shadow'

describe('shadow', () => {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'ShadowRoot')

  afterEach(() => {
    if (desc)
      Object.defineProperty(globalThis, 'ShadowRoot', desc)
    else
      delete (globalThis as any).ShadowRoot
  })

  it('detects a node inside a shadow root', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const inner = document.createElement('span')
    shadowRoot.appendChild(inner)

    expect(inShadow(inner)).toBe(true)
    expect(inShadow(host)).toBe(false)
    expect(getShadowRoot(inner)).toBe(shadowRoot)
    expect(getShadowRoot(host)).toBe(null)
  })

  it('returns false/null when the node is not in the document', () => {
    expect(inShadow(document.createElement('div'))).toBe(false)
    expect(getShadowRoot(null)).toBe(null)
    expect(getShadowRoot(undefined)).toBe(null)
  })

  it('does not throw when the ShadowRoot global is absent', () => {
    delete (globalThis as any).ShadowRoot
    expect(() => inShadow(document.createElement('div'))).not.toThrow()
    expect(() => getShadowRoot(document.createElement('div'))).not.toThrow()
    expect(inShadow(document.createElement('div'))).toBe(false)
    expect(getShadowRoot(document.createElement('div'))).toBe(null)
  })
})
