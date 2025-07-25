import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Image from '../src'

describe('basic', () => {
  it('with click', async () => {
    const mockClick = vi.fn()
    const wrapper = mount(() => <Image src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" onClick={mockClick} />)
    await wrapper.find('.vc-image').trigger('click')
    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('with click when disable preview', async () => {
    const mockClick = vi.fn()
    const wrapper = mount(() => <Image src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" onClick={mockClick} preview={false} />)
    await wrapper.find('.vc-image').trigger('click')
    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('class should work on img element', () => {
    const wrapper = mount(() => <Image src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" class="img" />)
    expect(wrapper.findComponent('.img')).toBeTruthy()
  })
  it('cover placement should work', () => {
    // Test center placement
    const wrapperCenter = mount(() => (
      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        preview={{
          cover: {
            coverNode: 'Click to Preview',
            placement: 'center',
          },
        }}
      />
    ))
    expect(wrapperCenter.find('.vc-image-cover.vc-image-cover-center').exists()).toBe(true)
    expect(wrapperCenter.find('.vc-image-cover.vc-image-cover-top').exists()).toBe(false)
    expect(wrapperCenter.find('.vc-image-cover.vc-image-cover-bottom').exists()).toBe(false)

    // Test top placement
    const wrapperTop = mount(() => (
      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        preview={{
          cover: {
            coverNode: 'Click to Preview',
            placement: 'top',
          },
        }}
      />
    ))
    expect(wrapperTop.find('.vc-image-cover.vc-image-cover-top').exists()).toBe(true)
    expect(wrapperTop.find('.vc-image-cover.vc-image-cover-center').exists()).toBe(false)
    expect(wrapperTop.find('.vc-image-cover.vc-image-cover-bottom').exists()).toBe(false)

    // Test bottom placement
    const wrapperBottom = mount(() => (
      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        preview={{
          cover: {
            coverNode: 'Click to Preview',
            placement: 'bottom',
          },
        }}
      />
    ))
    expect(wrapperBottom.find('.vc-image-cover.vc-image-cover-bottom').exists()).toBe(true)
    expect(wrapperBottom.find('.vc-image-cover.vc-image-cover-center').exists()).toBe(false)
    expect(wrapperBottom.find('.vc-image-cover.vc-image-cover-top').exists()).toBe(false)
  })
})
