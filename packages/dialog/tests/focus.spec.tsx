import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Trigger from '../../trigger/src'
import Dialog from '../src'

describe('@v-c/dialog focus boundary', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps focus on a body-mounted popup input', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        visible: true,
        getContainer: false,
        styles: {
          wrapper: {
            position: 'fixed',
          },
        },
      },
      slots: {
        default: () => (
          <Trigger
            popupVisible
            popup={<input id="dialog-portal-input" />}
          >
            <button id="dialog-trigger" type="button">
              trigger
            </button>
          </Trigger>
        ),
      },
    })

    await nextTick()
    await nextTick()

    const popupInput = document.getElementById('dialog-portal-input') as HTMLInputElement | null
    const dialogElement = document.querySelector('.vc-dialog')

    expect(popupInput).not.toBeNull()
    expect(dialogElement?.contains(popupInput!)).toBe(false)

    popupInput!.focus()
    await nextTick()

    expect(document.activeElement).toBe(popupInput)

    wrapper.unmount()
  })
})
