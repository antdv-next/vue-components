import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, shallowRef } from 'vue'
import Image from '../src'

async function flushPreview() {
  await vi.runAllTimersAsync()
  await nextTick()
  await nextTick()
}

describe('previewGroup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('group preview={false} should disable preview', async () => {
    const wrapper = mount(() => (
      <Image.PreviewGroup preview={false}>
        <Image src="src1" alt="group image" />
      </Image.PreviewGroup>
    ), {
      attachTo: document.body,
    })

    const root = wrapper.find('.vc-image')
    expect(root.attributes('role')).toBeUndefined()

    await root.trigger('click')
    await flushPreview()

    expect(document.body.querySelector('.vc-image-preview')).toBeNull()
    expect(document.body.querySelector('.vc-image-cover')).toBeNull()

    wrapper.unmount()
  })

  it('group preview={null} should disable preview', async () => {
    const wrapper = mount(() => (
      <Image.PreviewGroup preview={null as any}>
        <Image src="src1" alt="group image" />
      </Image.PreviewGroup>
    ), {
      attachTo: document.body,
    })

    const root = wrapper.find('.vc-image')
    expect(root.attributes('role')).toBeUndefined()
    expect(document.body.querySelector('.vc-image-cover')).toBeNull()

    await root.trigger('click')
    await flushPreview()

    expect(document.body.querySelector('.vc-image-preview')).toBeNull()

    wrapper.unmount()
  })

  it('should not reopen preview after disable and re-enable', async () => {
    const previewProp = shallowRef<boolean | { getContainer: boolean } | null | undefined>(undefined)
    const Demo = defineComponent(() => () => (
      <Image.PreviewGroup preview={previewProp.value as any}>
        <Image src="src1" />
      </Image.PreviewGroup>
    ))
    const wrapper = mount(Demo, {
      attachTo: document.body,
    })

    // `getContainer: false` keeps the portal inline; jsdom cannot measure
    // scrollbars for the body scroll locker (same as dialog/drawer tests)
    previewProp.value = { getContainer: false }
    await flushPreview()

    await wrapper.find('.vc-image').trigger('click')
    await flushPreview()
    expect(document.body.querySelector('.vc-image-preview')).toBeTruthy()

    previewProp.value = false
    await flushPreview()
    expect(document.body.querySelector('.vc-image-preview')).toBeNull()

    previewProp.value = { getContainer: false }
    await flushPreview()
    expect(document.body.querySelector('.vc-image-preview')).toBeNull()

    await wrapper.find('.vc-image').trigger('click')
    await flushPreview()
    expect(document.body.querySelector('.vc-image-preview')).toBeTruthy()

    wrapper.unmount()
  })
})
