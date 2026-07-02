import type { BuildInPlacements } from '../src/interface.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref, shallowRef } from 'vue'
import useAlign from '../src/hooks/useAlign.ts'

interface RectOptions {
  x?: number
  y?: number
  width: number
  height: number
  rectWidth?: number
  rectHeight?: number
  rectX?: number
  rectY?: number
  offsetWidthValue?: number
  offsetHeightValue?: number
}

const viewport = {
  width: 200,
  height: 200,
}

function installViewportAccessors() {
  const docEl = document.documentElement as any
  Object.defineProperty(docEl, 'clientWidth', {
    configurable: true,
    get: () => viewport.width,
  })
  Object.defineProperty(docEl, 'clientHeight', {
    configurable: true,
    get: () => viewport.height,
  })
  Object.defineProperty(docEl, 'scrollWidth', {
    configurable: true,
    get: () => viewport.width,
  })
  Object.defineProperty(docEl, 'scrollHeight', {
    configurable: true,
    get: () => viewport.height,
  })
  Object.defineProperty(docEl, 'scrollLeft', {
    configurable: true,
    get: () => 0,
  })
  Object.defineProperty(docEl, 'scrollTop', {
    configurable: true,
    get: () => 0,
  })
}

function cleanupViewportAccessors() {
  const docEl = document.documentElement as any
  delete docEl.clientWidth
  delete docEl.clientHeight
  delete docEl.scrollWidth
  delete docEl.scrollHeight
  delete docEl.scrollLeft
  delete docEl.scrollTop
}

function createComputedStyle(overrides: Partial<CSSStyleDeclaration> = {}) {
  return {
    position: 'absolute',
    height: '30px',
    width: '80px',
    transformOrigin: '50% 50% 0px',
    overflow: 'visible',
    overflowX: 'visible',
    overflowY: 'visible',
    overflowClipMargin: '0px',
    borderTopWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    ...overrides,
  } as CSSStyleDeclaration
}

function setMockComputedStyle(element: Element, overrides?: Partial<CSSStyleDeclaration>) {
  ;(element as any).__vcComputedStyle = createComputedStyle(overrides || {})
}

function createRectElement(opts: RectOptions) {
  const {
    width,
    height,
    rectWidth,
    rectHeight,
    rectX,
    rectY,
    offsetWidthValue,
    offsetHeightValue,
  } = opts
  let { x = 0, y = 0 } = opts
  const element = document.createElement('div')
  element.style.position = 'absolute'
  element.style.left = `${x}px`
  element.style.top = `${y}px`

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(
      rectX ?? x,
      rectY ?? y,
      rectWidth ?? width,
      rectHeight ?? height,
    ),
  })
  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    get: () => offsetWidthValue ?? width,
  })
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    get: () => offsetHeightValue ?? height,
  })
  Object.defineProperty(element, 'offsetLeft', {
    configurable: true,
    get: () => x,
  })
  Object.defineProperty(element, 'offsetTop', {
    configurable: true,
    get: () => y,
  })

  return { element, updateX: (nextX: number) => (x = nextX) }
}

async function runAlign(triggerAlign: VoidFunction) {
  triggerAlign()
  await Promise.resolve()
  await vi.runAllTimersAsync()
  await nextTick()
}

describe('useAlign', () => {
  let scope: ReturnType<typeof effectScope> | null = null
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>
  let rafSpy: ReturnType<typeof vi.spyOn>
  let cafSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    viewport.width = 200
    viewport.height = 200
    installViewportAccessors()

    getComputedStyleSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((node: Element) => {
        return (
          ((node as any).__vcComputedStyle as CSSStyleDeclaration)
          || createComputedStyle()
        )
      })

    rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => setTimeout(cb, 16) as any)
    cafSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(id => clearTimeout(id as any))
  })

  afterEach(() => {
    scope?.stop()
    scope = null
    getComputedStyleSpy.mockRestore()
    rafSpy.mockRestore()
    cafSpy.mockRestore()
    cleanupViewportAccessors()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('restores preferred placement once space becomes available again', async () => {
    const placements: BuildInPlacements = {
      right: {
        points: ['cl', 'cr'],
        offset: [4, 0],
        targetOffset: [0, 0],
        overflow: { adjustX: 1, shiftY: true },
        htmlRegion: 'visibleFirst',
      },
      left: {
        points: ['cr', 'cl'],
        offset: [-4, 0],
        targetOffset: [0, 0],
        overflow: { adjustX: 1, shiftY: true },
        htmlRegion: 'visibleFirst',
      },
    }

    const { element: target } = createRectElement({
      x: 160,
      y: 0,
      width: 30,
      height: 30,
    })
    const { element: popup, updateX: updatePopupX } = createRectElement({
      x: 0,
      y: 0,
      width: 80,
      height: 30,
    })
    document.body.appendChild(target)
    document.body.appendChild(popup)

    const open = ref(true)
    const targetRef = shallowRef(target)
    const popupRef = shallowRef(popup)
    const placement = ref('right')
    const builtinPlacements = ref(placements)

    scope = effectScope()
    let alignInfo: ReturnType<typeof useAlign>[9]
    let offsetXRef!: ReturnType<typeof useAlign>[1]
    let triggerAlign: VoidFunction

    scope.run(() => {
      const result = useAlign(
        open,
        popupRef,
        targetRef,
        placement,
        builtinPlacements,
        ref(),
        undefined,
        ref(false),
      )
      alignInfo = result[9]
      offsetXRef = result[1]
      triggerAlign = result[10]
    })

    await nextTick()
    await runAlign(triggerAlign)

    expect(alignInfo.value.points?.[0]).toBe('cr')

    updatePopupX(offsetXRef.value)

    viewport.width = 600
    await runAlign(triggerAlign)

    expect(alignInfo.value.points?.[0]).toBe('cl')
  })

  it('ignores popup scale transforms when computing offsets', async () => {
    const placements: BuildInPlacements = {
      right: {
        points: ['tl', 'tr'],
        offset: [0, 0],
        targetOffset: [0, 0],
        overflow: {},
      },
    }

    const { element: target } = createRectElement({
      x: 100,
      y: 0,
      width: 20,
      height: 20,
    })
    setMockComputedStyle(target, { width: '20px', height: '20px' })

    const popupWidth = 80
    const popupHeight = 40
    const scale = 0.8
    const deltaX = (1 - scale) * (popupWidth / 2)
    const deltaY = (1 - scale) * (popupHeight / 2)
    const { element: popup } = createRectElement({
      x: 0,
      y: 0,
      width: popupWidth,
      height: popupHeight,
      rectWidth: popupWidth * scale,
      rectHeight: popupHeight * scale,
      rectX: deltaX,
      rectY: deltaY,
    })
    setMockComputedStyle(popup, {
      width: `${popupWidth}px`,
      height: `${popupHeight}px`,
      transform: `matrix(${scale}, 0, 0, ${scale}, 0, 0)`,
      // computed style resolves percentages to px: center of 80x40
      transformOrigin: `${popupWidth / 2}px ${popupHeight / 2}px`,
    })

    document.body.appendChild(target)
    document.body.appendChild(popup)

    const open = ref(true)
    const targetRef = shallowRef(target)
    const popupRef = shallowRef(popup)
    const placement = ref('right')
    const builtinPlacements = ref(placements)

    scope = effectScope()
    let offsetXRef!: ReturnType<typeof useAlign>[1]
    let scaleXRef!: ReturnType<typeof useAlign>[7]
    let triggerAlign!: VoidFunction

    scope.run(() => {
      const result = useAlign(
        open,
        popupRef,
        targetRef,
        placement,
        builtinPlacements,
        ref(),
        undefined,
        ref(false),
      )
      offsetXRef = result[1]
      scaleXRef = result[7]
      triggerAlign = result[10]
    })

    await nextTick()
    await runAlign(triggerAlign)

    // The popup's own transform is factored out — no ancestor scale remains
    expect(scaleXRef.value).toBeCloseTo(1, 3)
    expect(offsetXRef.value).toBeCloseTo(target.getBoundingClientRect().right, 3)
  })

  it('does not compensate the popup own motion transform (ant-slide-up scaleY)', async () => {
    // Models antdv-next select: ant-slide-up holds `scaleY(0.8)` with
    // transform-origin top at keyframe 0. When stuck motion classes (from an
    // interrupted enter) leave that transform applied at align time, offsets
    // must NOT be divided by 0.8 — the bug placed the dropdown 25% lower
    // (inset 508px -> 635px).
    const placements: BuildInPlacements = {
      bottomLeft: {
        points: ['tl', 'bl'],
        offset: [0, 4],
        targetOffset: [0, 0],
        overflow: {},
      },
    }

    const { element: target } = createRectElement({
      x: 50,
      y: 100,
      width: 120,
      height: 32,
    })
    setMockComputedStyle(target, { width: '120px', height: '32px' })

    const popupWidth = 120
    const popupHeight = 136
    const motionScaleY = 0.8
    const { element: popup } = createRectElement({
      x: 0,
      y: 0,
      width: popupWidth,
      height: popupHeight,
      rectWidth: popupWidth,
      // transform-origin is top: y stays, height shrinks
      rectHeight: popupHeight * motionScaleY,
      rectX: 0,
      rectY: 0,
    })
    setMockComputedStyle(popup, {
      width: `${popupWidth}px`,
      height: `${popupHeight}px`,
      transform: `matrix(1, 0, 0, ${motionScaleY}, 0, 0)`,
      transformOrigin: '0% 0%',
    })

    document.body.appendChild(target)
    document.body.appendChild(popup)

    const open = ref(true)
    const targetRef = shallowRef(target)
    const popupRef = shallowRef(popup)
    const placement = ref('bottomLeft')
    const builtinPlacements = ref(placements)

    scope = effectScope()
    let offsetYRef!: ReturnType<typeof useAlign>[2]
    let scaleYRef!: ReturnType<typeof useAlign>[8]
    let triggerAlign!: VoidFunction

    scope.run(() => {
      const result = useAlign(
        open,
        popupRef,
        targetRef,
        placement,
        builtinPlacements,
        ref(),
        undefined,
        ref(false),
      )
      offsetYRef = result[2]
      scaleYRef = result[8]
      triggerAlign = result[10]
    })

    await nextTick()
    await runAlign(triggerAlign)

    // Self transform factored out: no ancestor scale detected
    expect(scaleYRef.value).toBeCloseTo(1, 3)
    // offsetY = target bottom (132) + offset (4) = 136, NOT 136 / 0.8 = 170
    expect(offsetYRef.value).toBeCloseTo(136, 3)
  })
})
