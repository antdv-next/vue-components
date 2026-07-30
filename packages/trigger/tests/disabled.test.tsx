import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import Trigger from '../src'

const placements = {
  top: { points: ['bc', 'tc'] },
}

function mountTrigger(props: Record<string, any> = {}) {
  return mount(
    defineComponent({
      setup() {
        return () => (
          <Trigger
            popupAlign={{ points: ['bc', 'tc'] }}
            builtinPlacements={placements}
            popupPlacement="top"
            popup={<div class="popup-content">popup</div>}
            {...props}
          >
            <span class="target">target</span>
          </Trigger>
        )
      },
    }),
    { attachTo: document.body },
  )
}

function popupVisible() {
  const popup = document.querySelector('.vc-trigger-popup')
  return !!popup && !popup.classList.contains('vc-trigger-popup-hidden')
}

describe('trigger disabled', () => {
  it('suppresses the popup when disabled, even if open', async () => {
    const wrapper = mountTrigger({ popupVisible: true, disabled: true })
    await nextTick()

    expect(popupVisible()).toBe(false)

    wrapper.unmount()
  })

  it('shows the popup once disabled is lifted', async () => {
    const wrapper = mountTrigger({ popupVisible: true, disabled: true })
    await nextTick()
    expect(popupVisible()).toBe(false)

    await wrapper.setProps({})
    wrapper.unmount()

    const enabled = mountTrigger({ popupVisible: true, disabled: false })
    await nextTick()
    expect(popupVisible()).toBe(true)

    enabled.unmount()
  })

  it('reports both open and close transitions while disabled', async () => {
    // Regression guard for #641. `disabled` pins the rendered open state to
    // false, so comparing the next value against it lets the open transition
    // through but permanently swallows the close one — the underlying state
    // gets stuck on, and the popup springs open the moment `disabled` is
    // lifted. Comparing against the raw state keeps both directions flowing.
    //
    // Driven by hover rather than click: click derives its next value from the
    // (suppressed) rendered state, so it can only ever ask to open here.
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const wrapper = mountTrigger({
      disabled: true,
      action: 'hover',
      mouseEnterDelay: 0,
      mouseLeaveDelay: 0,
      onOpenChange,
    })
    await nextTick()

    await wrapper.find('.target').trigger('mouseenter')
    vi.runAllTimers()
    await nextTick()

    await wrapper.find('.target').trigger('mouseleave')
    vi.runAllTimers()
    await nextTick()

    expect(onOpenChange.mock.calls.map(([open]) => open)).toEqual([true, false])

    wrapper.unmount()
    vi.useRealTimers()
  })
})
