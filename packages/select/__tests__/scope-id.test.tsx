import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createVNode, defineComponent, Fragment, Suspense } from 'vue'
import Select from '../src/Select'

const STABLE_FRAGMENT = 1 << 11
const options = [{ value: 'a', label: 'a' }]

const ScopedDirectParent = Object.assign(defineComponent(() => () => (
  <div><Select options={options} /></div>
)), { __scopeId: 'data-v-scoped' })

const SelectWrapper = defineComponent(() => () => <Select options={options} />)
const ScopedWrapperParent = Object.assign(defineComponent(() => () => (
  <SelectWrapper />
)), { __scopeId: 'data-v-scoped' })

const FragmentSelectWrapper = defineComponent(() => () => createVNode(
  Fragment,
  null,
  [createVNode(Select, { options })],
  STABLE_FRAGMENT,
))
const ScopedFragmentParent = Object.assign(defineComponent(() => () => (
  <FragmentSelectWrapper />
)), { __scopeId: 'data-v-scoped' })

const SuspenseSelectWrapper = defineComponent(() => () => (
  <Suspense><Select options={options} /></Suspense>
))
const ScopedSuspenseParent = Object.assign(defineComponent(() => () => (
  <SuspenseSelectWrapper />
)), { __scopeId: 'data-v-scoped' })

const SelectMiddle = defineComponent(() => () => (
  <div>
    <span />
    <Select options={options} />
  </div>
))
const ScopedGrandParent = Object.assign(defineComponent(() => () => (
  <SelectMiddle />
)), { __scopeId: 'data-v-scoped' })

const ScopedSlotFragment = createVNode(Fragment, null, [createVNode(Select, { options })])
ScopedSlotFragment.slotScopeIds = ['data-v-slot']
const SlotScopeParent = defineComponent(() => () => ScopedSlotFragment)

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('scoped css id', () => {
  it('forwards the scope id when select is rendered inside a scoped component', () => {
    const wrapper = mount(ScopedDirectParent)

    expect(wrapper.get('.vc-select').attributes('data-v-scoped')).toBeDefined()
  })

  it('inherits the scope id through a wrapper component root', () => {
    const wrapper = mount(ScopedWrapperParent)

    expect(wrapper.get('.vc-select').attributes('data-v-scoped')).toBeDefined()
  })

  it('inherits the scope id through a stable fragment root', () => {
    const wrapper = mount(ScopedFragmentParent)

    expect(wrapper.get('.vc-select').attributes('data-v-scoped')).toBeDefined()
  })

  it('inherits the scope id through a suspense root', () => {
    const wrapper = mount(ScopedSuspenseParent)

    expect(wrapper.get('.vc-select').attributes('data-v-scoped')).toBeDefined()
  })

  it('forwards the scope id from a scoped slot', () => {
    const wrapper = mount(SlotScopeParent)

    expect(wrapper.get('.vc-select').attributes('data-v-slot')).toBeDefined()
  })

  it('does not fold a stable fragment root in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const wrapper = mount(ScopedFragmentParent)

    expect(wrapper.get('.vc-select').attributes('data-v-scoped')).toBeUndefined()
  })

  it('does not inherit a scoped ancestor outside the component root chain', () => {
    const wrapper = mount(ScopedGrandParent)

    expect(wrapper.get('.vc-select').attributes('data-v-scoped')).toBeUndefined()
    expect(wrapper.get('span').attributes('data-v-scoped')).toBeUndefined()
  })
})
