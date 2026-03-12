export function isImageValid(src: string) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false)
      return
    }

    // JSDOM does not load images, which would cause `onload` / `onerror` never fire.
    // Use a heuristic to avoid hanging tests.
    const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
    const isJSDomUA = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)
    const canUseDom = typeof document !== 'undefined' && typeof window !== 'undefined'
    if (isTestEnv || isJSDomUA || !canUseDom) {
      const isLikelyValid
        = /^(https?:)?\/\//.test(src)
          || /^(data|blob):/.test(src)
          || src.startsWith('/')
          || src.startsWith('./')
          || src.startsWith('../')
      resolve(isLikelyValid)
      return
    }

    const img = document.createElement('img')
    img.onerror = () => resolve(false)
    img.onload = () => resolve(true)
    img.src = src
  })
}

// ============================= Legacy =============================
export function getClientSize() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
    }
  }

  const width = document.documentElement.clientWidth
  const height = window.innerHeight || document.documentElement.clientHeight
  return {
    width,
    height,
  }
}
