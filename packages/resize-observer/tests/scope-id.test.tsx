// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import ResizeObserver from '../src'

const ScopedParent = Object.assign(defineComponent({
  setup() {
    return () => (
      <ResizeObserver>
        <div class="resize-target" />
      </ResizeObserver>
    )
  },
}), { __scopeId: 'data-v-scoped' })

describe('scoped css id', () => {
  it('keeps a single child in the component root chain', () => {
    const wrapper = mount(ScopedParent)

    expect(wrapper.get('.resize-target').attributes('data-v-scoped')).toBeDefined()
  })
})
