import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Image from '../src'
import { isImageValid } from '../src/util'

// We need to control the image loading state
vi.mock('../src/util', () => ({
  isImageValid: vi.fn(),
}))

describe('placeholder', () => {
  it('should show placeholder while image is loading', async () => {
    // Mock image loading in progress (not resolved yet)
    const imageValidPromise = new Promise<boolean>(() => {
      // This promise intentionally never resolves to simulate loading
    });
    (isImageValid as any).mockReturnValue(imageValidPromise)

    const wrapper = mount(Image, {
      props: {
        src: 'https://example.com/image.png',
        placeholder: true,
      },
    })

    await wrapper.vm.$nextTick()

    // Verify placeholder is shown during loading
    expect(wrapper.find('.vc-image-img-placeholder').exists()).toBe(true)
  })
})
