import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import Image from '../src'

async function flushPreview() {
  await vi.runAllTimersAsync()
  await nextTick()
  await nextTick()
}

describe('preview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should not expose preview keyboard semantics or open preview when preview is disabled', async () => {
    const wrapper = mount(() => (
      <Image src="src" alt="disabled preview" preview={false} />
    ), {
      attachTo: document.body,
    })

    const root = wrapper.find('.vc-image')

    expect(root.attributes('role')).toBeUndefined()
    expect(root.attributes('tabindex')).toBeUndefined()

    await root.trigger('keydown', { key: 'Enter' })
    await flushPreview()

    expect(document.body.querySelector('.vc-image-preview')).toBeNull()

    wrapper.unmount()
  })

  it('should not close on mask click when maskClosable is false', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mount(() => (
      <Image
        src="src"
        alt="mask closable"
        preview={{ open: true, getContainer: false, maskClosable: false, onOpenChange } as any}
      />
    ), {
      attachTo: document.body,
    })

    await flushPreview()

    const mask = document.body.querySelector('.vc-image-preview-mask') as HTMLElement
    const close = document.body.querySelector('.vc-image-preview-close') as HTMLElement

    mask.click()
    await flushPreview()
    expect(onOpenChange).not.toHaveBeenCalled()

    close.click()
    expect(onOpenChange).toHaveBeenCalledWith(false)

    wrapper.unmount()
  })

  it('should not trap focus when focusTrap is false', async () => {
    const Demo = defineComponent(() => () => (
      <div>
        <button class="outside" type="button">outside</button>
        <Image
          src="src"
          alt="focus trap"
          preview={{ open: true, getContainer: false, focusTrap: false } as any}
        />
      </div>
    ))

    const wrapper = mount(Demo, {
      attachTo: document.body,
    })

    await flushPreview()

    const outside = wrapper.find('.outside').element as HTMLButtonElement
    outside.focus()
    await nextTick()

    expect(document.activeElement).toBe(outside)

    wrapper.unmount()
  })

  it('should set alt on preview img', async () => {
    const wrapper = mount(() => (
      <Image
        src="src"
        alt="preview alt"
        preview={{ open: true, getContainer: false } as any}
      />
    ), {
      attachTo: document.body,
    })

    await flushPreview()

    const previewImg = document.body.querySelector('.vc-image-preview-img') as HTMLImageElement | null
    expect(previewImg?.getAttribute('alt')).toBe('preview alt')

    wrapper.unmount()
  })
})
