import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

describe('image ssr guards', () => {
  afterEach(() => {
    vi.doUnmock('@v-c/util/dist/Dom/canUseDom')
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('util helpers should be safe without window and document', async () => {
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('document', undefined)

    const { getClientSize, isImageValid } = await import('../src/util.ts')

    await expect(isImageValid('/demo.png')).resolves.toBe(true)
    expect(getClientSize()).toEqual({
      width: 0,
      height: 0,
    })
  })

  it('preview hooks should not bind global listeners when dom is unavailable', async () => {
    vi.doMock('@v-c/util/dist/Dom/canUseDom', () => ({
      default: () => false,
    }))

    const { default: useTouchEvent } = await import('../src/hooks/useTouchEvent.ts')
    const { default: useMouseEvent } = await import('../src/hooks/useMouseEvent.ts')

    const wrapper = mount(defineComponent({
      setup() {
        const imgRef = ref({} as HTMLImageElement)
        const boolRef = ref(true)
        const numRef = ref(1)
        const transform = ref({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
        })

        useTouchEvent(
          imgRef,
          boolRef,
          boolRef,
          numRef,
          transform,
          () => {},
          () => {},
        )

        useMouseEvent(
          imgRef,
          boolRef,
          boolRef,
          numRef,
          transform,
          () => {},
          () => {},
        )

        return () => null
      },
    }))

    wrapper.unmount()
  })
})
