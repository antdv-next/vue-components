// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, ref } from 'vue'

describe('portal ssr guards', () => {
  afterEach(() => {
    vi.doUnmock('@v-c/util/dist/Dom/canUseDom')
    vi.resetModules()
  })

  it('useDom should be safe when dom is unavailable', async () => {
    vi.doMock('@v-c/util/dist/Dom/canUseDom', () => ({
      default: () => false,
    }))

    const { default: useDom } = await import('../src/useDom.tsx')

    const wrapper = mount(defineComponent({
      setup() {
        const render = computed(() => true)
        const [ele] = useDom(render)

        expect(ele).toBeNull()
        return () => null
      },
    }))

    wrapper.unmount()
  })

  it('useEscKeyDown should not touch window when dom is unavailable', async () => {
    vi.doMock('@v-c/util/dist/Dom/canUseDom', () => ({
      default: () => false,
    }))

    const { default: useEscKeyDown, _test } = await import('../src/useEscKeyDown.ts')

    const wrapper = mount(defineComponent({
      setup() {
        useEscKeyDown(ref(true))
        return () => null
      },
    }))

    expect(_test?.().stack).toEqual([])
    wrapper.unmount()
  })
})
