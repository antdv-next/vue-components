// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Table from '../src'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
]

const data = [
  { key: 'light', name: 'light' },
  { key: 'bamboo', name: 'bamboo' },
]

async function mountScrollTable() {
  const wrapper = mount(Table, {
    attachTo: document.body,
    props: {
      data,
      columns,
      scroll: { x: 100, y: 100 },
    },
  })
  await nextTick()

  const header = wrapper.find('.vc-table-header').element as HTMLDivElement
  const body = wrapper.find('.vc-table-body').element as HTMLDivElement

  return { wrapper, header, body }
}

describe('table scroll retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not retry stale scrollLeft sync', async () => {
    const { wrapper, header, body } = await mountScrollTable()

    let headerScrollLeft = 0
    let bodyScrollLeft = 0

    Object.defineProperty(header, 'scrollLeft', {
      configurable: true,
      get() {
        return headerScrollLeft
      },
      set(value) {
        headerScrollLeft = Math.trunc(value)
      },
    })
    Object.defineProperty(body, 'scrollLeft', {
      configurable: true,
      get() {
        return bodyScrollLeft
      },
    })

    bodyScrollLeft = 794.171875
    body.dispatchEvent(new Event('scroll'))

    bodyScrollLeft = 0
    body.dispatchEvent(new Event('scroll'))

    vi.runAllTimers()

    expect(headerScrollLeft).toBe(0)

    wrapper.unmount()
  })

  it('cancels stale scrollLeft retry when target already synced', async () => {
    const { wrapper, header, body } = await mountScrollTable()

    let headerScrollLeft = 0
    let bodyScrollLeft = 0

    Object.defineProperty(header, 'scrollLeft', {
      configurable: true,
      get() {
        return headerScrollLeft
      },
      set(value) {
        headerScrollLeft = value
      },
    })
    Object.defineProperty(body, 'scrollLeft', {
      configurable: true,
      get() {
        return bodyScrollLeft
      },
    })

    bodyScrollLeft = 100
    body.dispatchEvent(new Event('scroll'))

    headerScrollLeft = 50
    bodyScrollLeft = 50
    body.dispatchEvent(new Event('scroll'))

    vi.runAllTimers()

    expect(headerScrollLeft).toBe(50)

    wrapper.unmount()
  })
})
