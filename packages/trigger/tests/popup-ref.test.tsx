import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import Trigger, { UniqueProvider } from '../src/index'

async function flush() {
  await nextTick()
  vi.runAllTimers()
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

const placements = {
  top: {
    points: ['bc', 'tc'],
    overflow: { adjustX: 1, adjustY: 1 },
  },
}

describe('trigger popup ref', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('captures popup element on the first open', async () => {
    const triggerRef = ref<any>(null)

    const Demo = defineComponent({
      setup() {
        return () =>
          h(
            Trigger as any,
            {
              ref: triggerRef,
              action: 'click',
              popupPlacement: 'top',
              builtinPlacements: placements,
              popup: () => h('div', { class: 'my-popup' }, 'popup content'),
            },
            {
              default: () => h('button', { class: 'my-target' }, 'target'),
            },
          )
      },
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    // Open on the first click
    await wrapper.find('.my-target').trigger('click')
    await flush()

    const popupElement = triggerRef.value?.popupElement
    expect(popupElement).toBeTruthy()
    expect(popupElement).toBeInstanceOf(HTMLDivElement)

    wrapper.unmount()
  })

  it('aligns the popup on the first open (unique mode)', async () => {
    const Demo = defineComponent({
      setup() {
        return () =>
          h(UniqueProvider as any, null, {
            default: () =>
              h(
                Trigger as any,
                {
                  action: 'click',
                  unique: true,
                  popupPlacement: 'top',
                  builtinPlacements: placements,
                  popup: () => h('div', { class: 'my-popup' }, 'popup content'),
                },
                {
                  default: () => h('button', { class: 'my-target' }, 'target'),
                },
              ),
          })
      },
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    // Open on the first click
    await wrapper.find('.my-target').trigger('click')
    await flush()

    // The popup element should be present and positioned (ready => not offscreen)
    const popup = document.querySelector('.my-popup') as HTMLElement | null
    expect(popup).toBeTruthy()
    const holder = popup?.closest('[style]') as HTMLElement | null
    // When ready=false the offset style pins the popup at -1000vw/-1000vh.
    expect(holder?.style.left).not.toBe('-1000vw')

    wrapper.unmount()
  })
})
