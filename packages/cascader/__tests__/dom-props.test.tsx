import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Cascader from '../src'

const options = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      {
        label: 'Hangzhou',
        value: 'hangzhou',
      },
    ],
  },
]

describe('cascader dom props', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does not leak internal props to dropdown menu DOM', async () => {
    const wrapper = mount(Cascader, {
      attachTo: document.body,
      props: {
        open: true,
        options,
      },
    })

    await nextTick()

    const menu = document.body.querySelector('.vc-cascader-menu')

    expect(menu).toBeTruthy()
    expect(menu?.getAttribute('searchvalue')).toBeNull()
    expect(menu?.getAttribute('toggleopen')).toBeNull()

    wrapper.unmount()
  })

  it('does not leak internal props to panel menu DOM', async () => {
    const wrapper = mount(Cascader.Panel, {
      attachTo: document.body,
      props: {
        options,
      },
    })

    await nextTick()

    const menu = document.body.querySelector('.vc-cascader-menu')

    expect(menu).toBeTruthy()
    expect(menu?.getAttribute('searchvalue')).toBeNull()
    expect(menu?.getAttribute('toggleopen')).toBeNull()

    wrapper.unmount()
  })
})
