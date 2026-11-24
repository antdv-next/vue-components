import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Tour from '../src'

// ref: react-component/tour#112
describe('tour close icon renderability', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  async function render(node: () => any) {
    const wrapper = mount(node, { attachTo: document.body })
    await nextTick()
    await nextTick()
    return wrapper
  }

  it('uses the zero step icon instead of the root icon', async () => {
    const wrapper = await render(() => (
      <Tour open closeIcon="ROOT" steps={[{ title: 'Step', closeIcon: 0 as any }]} />
    ))
    expect(document.querySelector('.vc-tour-close')?.textContent).toBe('0')
    wrapper.unmount()
  })

  it('lets a configured zero icon override closeIcon=false', async () => {
    const wrapper = await render(() => (
      <Tour open steps={[{ title: 'Step', closeIcon: false, closable: { closeIcon: 0 as any } }]} />
    ))
    expect(document.querySelector('.vc-tour-close')?.textContent).toBe('0')
    wrapper.unmount()
  })

  it('preserves closable=false even with a zero icon', async () => {
    const wrapper = await render(() => (
      <Tour open steps={[{ title: 'Step', closable: false, closeIcon: 0 as any }]} />
    ))
    expect(document.querySelector('.vc-tour-close')).toBeNull()
    wrapper.unmount()
  })
})
