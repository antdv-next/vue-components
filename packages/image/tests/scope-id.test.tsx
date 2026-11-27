import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import Image from '../src'

const ScopedParent = Object.assign(defineComponent({
  setup(_, { slots }) {
    return () => slots.default?.()
  },
}), { __scopeId: 'data-v-scoped' })

describe('scoped css id', () => {
  it('forwards the parent scope id to the image root', () => {
    const wrapper = mount(() => (
      <ScopedParent>
        <Image src="image.png" preview={false} />
      </ScopedParent>
    ))

    expect(wrapper.get('.vc-image').attributes('data-v-scoped')).toBeDefined()
  })
})
