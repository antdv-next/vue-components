import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Tour from '../src'

describe('tour closable', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('forwards aria and data attributes from closable to the close button', async () => {
    const wrapper = mount(() => (
      <Tour
        open
        steps={[{
          title: 'step',
          closable: {
            'aria-label': 'Close tour',
            'data-testid': 'tour-close',
            'data-track-id': 'close-1',
          },
        }]}
      />
    ), { attachTo: document.body })

    await nextTick()
    await nextTick()

    const closeButton = document.querySelector<HTMLButtonElement>('.vc-tour-close')!
    expect(closeButton).toBeTruthy()
    expect(closeButton.getAttribute('aria-label')).toBe('Close tour')
    expect(closeButton.getAttribute('data-testid')).toBe('tour-close')
    expect(closeButton.getAttribute('data-track-id')).toBe('close-1')
    wrapper.unmount()
  })
})
