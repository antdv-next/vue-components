import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Cascader from '../src'

describe('cascader checkStrictly', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('selects child options independently', async () => {
    const onChange = vi.fn()
    const wrapper = mount(Cascader, {
      attachTo: document.body,
      props: {
        open: true,
        checkable: true,
        checkStrictly: true,
        onChange,
        options: [
          {
            label: 'Parent',
            value: 'parent',
            children: [{ label: 'Child', value: 'child' }],
          },
        ],
      },
    })

    await nextTick()
    const parent = document.body.querySelector<HTMLElement>('[data-path-key="parent"]')!
    parent.click()
    await nextTick()

    const child = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]')]
      .find(item => item.textContent?.includes('Child'))!
    child.querySelector<HTMLElement>('.vc-cascader-checkbox')!.click()
    await nextTick()

    expect(onChange).toHaveBeenCalledWith(
      [['parent', 'child']],
      [[expect.objectContaining({ value: 'parent' }), expect.objectContaining({ value: 'child' })]],
    )

    wrapper.unmount()
  })
})
