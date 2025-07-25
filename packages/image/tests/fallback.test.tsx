import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Image from '../src'

// Mock the isImageValid function to simulate image loading failure
vi.mock('../src/util', () => ({
  isImageValid: vi.fn().mockImplementation(() => Promise.resolve(false)),
}))

describe('fallback', () => {
  it('image fallback', async () => {
    const fallback = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
    const wrapper = mount(() => <Image src="invalid-src" fallback={fallback} />)

    // Wait for the component to process the image validation
    await vi.waitFor(() => {
      // Re-find the img element to get the updated attributes
      const img = wrapper.find('img')
      return img.attributes('src') === fallback
    }, { timeout: 1000 })

    // Final assertion
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(fallback)
  })
})
