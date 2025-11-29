import { toArray } from '@v-c/util/dist/Children/toArray'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, Fragment } from 'vue'

describe('toArray', () => {
  let children: any
  const UL = defineComponent({
    setup(_, { slots }) {
      return () => {
        children = slots.default?.()
        return <ul>{slots.default?.()}</ul>
      }
    },
  })
  it('basic', () => {
    const wrapper = mount(
      <UL>
        <li key={1}>1</li>
        <li key={2}>2</li>
        <li key={3}>3</li>
      </UL>,
    )
    const nodes = toArray(children)
    expect(nodes).toHaveLength(3)
    expect(nodes.map(v => v.key)).toEqual([1, 2, 3])
    wrapper.unmount()
  })

  it('array', () => {
    const wrapper = mount(
      <UL>
        <li key={1}>1</li>
        {[<li key={2}>2</li>, <li key={3}>3</li>]}
      </UL>,
    )
    const nodes = toArray(children)
    expect(nodes).toHaveLength(3)
    expect(nodes.map(v => v.key)).toEqual([1, 2, 3])
    wrapper.unmount()
  })

  it('fragment', () => {
    const wrapper = mount(
      <UL>
        <li key={1}>1</li>
        <>
          <li key="2">2</li>
          <li key="3">3</li>
        </>
        <Fragment>
          <>
            <li key="4">4</li>
            <li key="5">5</li>
          </>
        </Fragment>
      </UL>,
    )
    const nodes = toArray(children)
    expect(nodes).toHaveLength(5)
    expect(nodes.map(v => v.key)).toEqual([1, '2', '3', '4', '5'])
    wrapper.unmount()
  })

  it('keep empty', () => {
    const wrapper = mount(
      <UL>
        {null}
        <li key="1">1</li>
        <>
          <li key="2">2</li>
          {null}
          <li key="3">3</li>
        </>
        <Fragment>
          <>
            <li key="4">4</li>
            {undefined}
            <li key="5">5</li>
          </>
        </Fragment>
        {undefined}
      </UL>,
    )

    const nodes = toArray(children, { keepEmpty: true })
    expect(nodes).toHaveLength(9)
    expect(nodes.map(c => c && c.key)).toEqual([
      null,
      '1',
      '2',
      null,
      '3',
      '4',
      undefined,
      '5',
      null,
    ])
    wrapper.unmount()
  })
})
