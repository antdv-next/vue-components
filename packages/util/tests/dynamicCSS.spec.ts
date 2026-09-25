import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearContainerCache, injectCSS, removeCSS, updateCSS } from '../src/Dom/dynamicCSS'

const TEST_STYLE = '.bamboo { context: "light" }'

// Detach `<head>` / `<body>` so `getContainer` resolves to nothing.
function withoutContainers(fn: () => void) {
  const { head, body } = document
  head.remove()
  body.remove()
  try {
    fn()
  }
  finally {
    document.documentElement.append(head, body)
  }
}

describe('dynamicCSS', () => {
  afterEach(() => {
    document.querySelectorAll('style').forEach(style => style.remove())
    clearContainerCache()
  })

  it('injectCSS does not throw when the document has no style container', () => {
    withoutContainers(() => {
      expect(injectCSS(TEST_STYLE)).toBeNull()
    })
  })

  it('updateCSS does not throw when the document has no style container', () => {
    withoutContainers(() => {
      expect(updateCSS(TEST_STYLE, 'unique')).toBeNull()
    })
  })

  it('can remove styles while the default container is unavailable', () => {
    const { head } = document
    const style = updateCSS(TEST_STYLE, 'detached')!
    withoutContainers(() => {
      expect(() => removeCSS('detached')).not.toThrow()
      expect(style.parentNode).toBe(head)
    })
    removeCSS('detached')
    expect(style.parentNode).toBeNull()
  })

  it('returns null when the document containers disappear during style creation', () => {
    const { head, body } = document
    const createElement = document.createElement.bind(document)
    const spy = vi
      .spyOn(document, 'createElement')
      .mockImplementationOnce((tagName: string) => {
        head.remove()
        body.remove()
        return createElement(tagName)
      })
    try {
      expect(updateCSS(TEST_STYLE, 'transient')).toBeNull()
      expect(head.querySelector('style')).toBeNull()
    }
    finally {
      spy.mockRestore()
      document.documentElement.append(head, body)
      clearContainerCache()
    }

    const restored = updateCSS(TEST_STYLE, 'transient')!
    expect(restored.parentNode).toBe(head)
  })
})
