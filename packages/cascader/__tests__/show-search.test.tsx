/* @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Cascader from '../src'

describe('cascader showSearch', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('searches by input and shows empty when no result', async () => {
    const wrapper = mount(Cascader, {
      attachTo: document.body,
      props: {
        open: true,
        showSearch: true,
        options: [
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
          {
            label: 'Jiangsu',
            value: 'jiangsu',
            children: [
              {
                label: 'Nanjing',
                value: 'nanjing',
              },
            ],
          },
        ],
      },
    })

    await nextTick()

    await wrapper.find('input').setValue('hang')
    await nextTick()

    const searchResult = document.body.querySelector('.vc-cascader-menu-item-content')
    expect(searchResult?.textContent?.trim()).toBe('Zhejiang / Hangzhou')

    await wrapper.find('input').setValue('not-exist')
    await nextTick()

    const menu = document.body.querySelector('.vc-cascader-menus')
    const emptyItem = document.body.querySelector('.vc-cascader-menu-item-content')

    expect(menu?.classList.contains('vc-cascader-menu-empty')).toBe(true)

    expect(emptyItem?.textContent?.trim()).toBe('Not Found')

    wrapper.unmount()
  })
})
