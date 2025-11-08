import { effectScope, nextTick, ref, shallowRef } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useAlign from '../src/hooks/useAlign.ts'
import type { BuildInPlacements } from '../src/interface.ts'

interface RectOptions {
  x?: number
  y?: number
  width: number
  height: number
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

function createRectElement(opts: RectOptions) {
  const { width, height } = opts
  let { x = 0, y = 0 } = opts
  const element = document.createElement('div')
  element.style.position = 'absolute'
  element.style.left = `${x}px`
  element.style.top = `${y}px`

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(x, y, width, height),
  })
  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    get: () => width,
  })
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    get: () => height,
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

let scope: ReturnType<typeof effectScope> | null = null

async function setupAlignCase(placements: BuildInPlacements) {
  const { element: target } = createRectElement({
    x: 160,
    y: 0,
    width: 30,
    height: 30,
  })
  const { element: popup } = createRectElement({
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
  let triggerAlign: VoidFunction

  scope.run(() => {
    ;[, , , , , , , , , alignInfo, triggerAlign] = useAlign(
      open,
      popupRef,
      targetRef,
      placement,
      builtinPlacements,
      ref(),
      undefined,
      ref(false),
    )
  })

  await nextTick()
  await runAlign(triggerAlign)

  return { alignInfo, triggerAlign }
}

describe('useAlign auto flip recovery', () => {
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
      .mockImplementation(() => {
        return {
          position: 'absolute',
          height: '30px',
          width: '80px',
          overflow: 'visible',
          overflowX: 'visible',
          overflowY: 'visible',
          overflowClipMargin: '0px',
          borderTopWidth: '0px',
          borderBottomWidth: '0px',
          borderLeftWidth: '0px',
          borderRightWidth: '0px',
        } as CSSStyleDeclaration
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

  it('restores preferred placement once space becomes available again (visibleFirst)', async () => {
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

    const { alignInfo, triggerAlign } = await setupAlignCase(placements)

    expect(alignInfo.value.points?.[0]).toBe('cr')

    viewport.width = 600
    await runAlign(triggerAlign)

    expect(alignInfo.value.points?.[0]).toBe('cl')
  })

  it('restores preferred placement for default visible region', async () => {
    const placements: BuildInPlacements = {
      right: {
        points: ['cl', 'cr'],
        offset: [4, 0],
        targetOffset: [0, 0],
        overflow: { adjustX: 1, shiftY: true },
      },
      left: {
        points: ['cr', 'cl'],
        offset: [-4, 0],
        targetOffset: [0, 0],
        overflow: { adjustX: 1, shiftY: true },
      },
    }

    const { alignInfo, triggerAlign } = await setupAlignCase(placements)

    expect(alignInfo.value.points?.[0]).toBe('cr')

    viewport.width = 600
    await runAlign(triggerAlign)

    expect(alignInfo.value.points?.[0]).toBe('cl')
  })
})
