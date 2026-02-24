import { removeCSS, updateCSS } from './Dom/dynamicCSS'

type ScrollBarSize = { width: number, height: number }

type ExtendCSSStyleDeclaration = CSSStyleDeclaration & {
  scrollbarColor?: string
  scrollbarWidth?: string
}

let cached: ScrollBarSize

function measureScrollbarSize(ele?: HTMLElement): ScrollBarSize {
  const randomId = `rc-scrollbar-measure-${Math.random()
    .toString(36)
    .substring(7)}`
  const measureEle = document.createElement('div')
  measureEle.id = randomId

  const measureStyle: ExtendCSSStyleDeclaration = measureEle.style
  measureStyle.position = 'absolute'
  measureStyle.left = '0'
  measureStyle.top = '0'
  measureStyle.width = '100px'
  measureStyle.height = '100px'
  measureStyle.overflow = 'scroll'

  let fallbackWidth: number
  let fallbackHeight: number
  if (ele) {
    const targetStyle: ExtendCSSStyleDeclaration = getComputedStyle(ele)
    measureStyle.scrollbarColor = targetStyle.scrollbarColor
    measureStyle.scrollbarWidth = targetStyle.scrollbarWidth

    const webkitScrollbarStyle = getComputedStyle(ele, '::-webkit-scrollbar')
    const width = Number.parseInt(webkitScrollbarStyle.width, 10)
    const height = Number.parseInt(webkitScrollbarStyle.height, 10)

    try {
      const widthStyle = width ? `width: ${webkitScrollbarStyle.width};` : ''
      const heightStyle = height ? `height: ${webkitScrollbarStyle.height};` : ''

      updateCSS(
        `
#${randomId}::-webkit-scrollbar {
${widthStyle}
${heightStyle}
}`,
        randomId,
      )
    }
    catch {
      fallbackWidth = width
      fallbackHeight = height
    }
  }

  document.body.appendChild(measureEle)

  const scrollWidth = ele && fallbackWidth && !Number.isNaN(fallbackWidth)
    ? fallbackWidth
    : measureEle.offsetWidth - measureEle.clientWidth

  const scrollHeight = ele && fallbackHeight && !Number.isNaN(fallbackHeight)
    ? fallbackHeight
    : measureEle.offsetHeight - measureEle.clientHeight

  document.body.removeChild(measureEle)
  removeCSS(randomId)

  return {
    width: scrollWidth,
    height: scrollHeight,
  }
}

export default function getScrollBarSize(fresh?: boolean): number {
  if (typeof document === 'undefined')
    return 0

  if (fresh || cached === undefined)
    cached = measureScrollbarSize()

  return cached.width
}

export function getTargetScrollBarSize(target: HTMLElement) {
  if (typeof document === 'undefined' || !target || !(target instanceof Element))
    return { width: 0, height: 0 }

  return measureScrollbarSize(target)
}
