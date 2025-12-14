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
    if (isTestEnv || isJSDomUA) {
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
  const width = document.documentElement.clientWidth
  const height = window.innerHeight || document.documentElement.clientHeight
  return {
    width,
    height,
  }
}
