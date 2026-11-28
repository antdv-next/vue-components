import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import Image from '../src'

const ScopedDirectParent = Object.assign(defineComponent(() => () => (
  <div><Image src="image.png" preview={false} /></div>
)), { __scopeId: 'data-v-scoped' })

const ImageWrapper = defineComponent(() => () => <Image src="image.png" preview={false} />)
const ScopedWrapperParent = Object.assign(defineComponent(() => () => (
  <ImageWrapper />
)), { __scopeId: 'data-v-scoped' })

const ImageMiddle = defineComponent(() => () => (
  <div>
    <span />
    <Image src="image.png" preview={false} />
  </div>
))
const ScopedGrandParent = Object.assign(defineComponent(() => () => (
  <ImageMiddle />
)), { __scopeId: 'data-v-scoped' })

describe('scoped css id', () => {
  it('forwards the scope id when image is rendered inside a scoped component', () => {
    const wrapper = mount(ScopedDirectParent)

    expect(wrapper.get('.vc-image').attributes('data-v-scoped')).toBeDefined()
  })

  it('inherits the scope id through a wrapper component root', () => {
    const wrapper = mount(ScopedWrapperParent)

    expect(wrapper.get('.vc-image').attributes('data-v-scoped')).toBeDefined()
  })

  it('does not inherit a scoped ancestor outside the component root chain', () => {
    const wrapper = mount(ScopedGrandParent)

    expect(wrapper.get('.vc-image').attributes('data-v-scoped')).toBeUndefined()
    expect(wrapper.get('span').attributes('data-v-scoped')).toBeUndefined()
  })
})
