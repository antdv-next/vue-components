import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import Select from '../src/Select'

const ScopedParent = Object.assign(defineComponent({
  setup(_, { slots }) {
    return () => slots.default?.()
  },
}), { __scopeId: 'data-v-scoped' })

describe('scoped css id', () => {
  it('forwards the parent scope id to the select root', () => {
    const wrapper = mount(() => (
      <ScopedParent>
        <Select options={[{ value: 'a', label: 'a' }]} />
      </ScopedParent>
    ))

    expect(wrapper.get('.vc-select').attributes('data-v-scoped')).toBeDefined()
  })
})
