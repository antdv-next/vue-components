import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import Tooltip from '../src'

/** Let the portal mount and the align pass settle. */
async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await nextTick()
  }
  await new Promise(resolve => setTimeout(resolve, 50))
}

/** Tooltip overrides Trigger's prefixCls, so the popup renders as `.vc-tooltip`. */
function popupVisible() {
  const popup = document.querySelector('.vc-tooltip')
  return !!popup && !popup.classList.contains('vc-tooltip-hidden')
}

function mountTooltip(props: Record<string, any> = {}) {
  return mount(
    defineComponent({
      setup() {
        return () => (
          <Tooltip overlay={<span>tip</span>} {...props}>
            <span class="target">target</span>
          </Tooltip>
        )
      },
    }),
    { attachTo: document.body },
  )
}

function mountDescribedTooltip(visible = false) {
  return mount(
    defineComponent({
      props: {
        visible: Boolean,
      },
      setup(props) {
        return () => (
          <Tooltip id="tooltip-description" visible={props.visible} overlay={<span>tip</span>}>
            <span class="target" aria-describedby="existing-description">target</span>
          </Tooltip>
        )
      },
    }),
    {
      attachTo: document.body,
      props: { visible },
    },
  )
}

describe('tooltip disabled', () => {
  it('forwards `disabled` to Trigger so the tooltip stays hidden', async () => {
    const wrapper = mountTooltip({ visible: true, disabled: true })
    await settle()

    expect(popupVisible()).toBe(false)

    wrapper.unmount()
  })

  it('shows the tooltip when not disabled', async () => {
    const wrapper = mountTooltip({ visible: true })
    await settle()

    expect(popupVisible()).toBe(true)

    wrapper.unmount()
  })
})

describe('tooltip accessibility', () => {
  it('opens on focus by default', async () => {
    const wrapper = mountTooltip()

    await wrapper.find('.target').trigger('focus')
    await settle()

    expect(popupVisible()).toBe(true)

    wrapper.unmount()
  })

  it('preserves the child aria-describedby across visibility changes', async () => {
    const wrapper = mountDescribedTooltip()

    expect(wrapper.find('.target').attributes('aria-describedby'))
      .toBe('existing-description')

    await wrapper.setProps({ visible: true })
    expect(wrapper.find('.target').attributes('aria-describedby'))
      .toBe('existing-description tooltip-description')

    await wrapper.setProps({ visible: false })
    expect(wrapper.find('.target').attributes('aria-describedby'))
      .toBe('existing-description')

    wrapper.unmount()
  })
})
