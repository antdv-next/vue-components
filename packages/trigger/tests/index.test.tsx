import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Trigger from '../src'

describe('Trigger', () => {
  it('waits for target ref before rendering default open popup', async () => {
    const wrapper = mount(Trigger, {
      attachTo: document.body,
      props: {
        popupVisible: true,
        action: [],
        popup: 'popup',
      },
      slots: {
        default: () => <button type="button">target</button>,
      },
    })

    expect(document.body.querySelector('.vc-trigger-popup')).toBeNull()

    await nextTick()

    expect(document.body.querySelector('.vc-trigger-popup')).toBeTruthy()

    wrapper.unmount()
  })
})
