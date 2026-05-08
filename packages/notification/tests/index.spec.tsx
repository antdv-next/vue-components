import type { NotificationAPI, NotificationConfig } from '../src'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { useNotification } from '../src'

async function flush() {
  await nextTick()
  vi.runAllTimers()
  await nextTick()
  await nextTick()
}

function renderDemo(config?: NotificationConfig) {
  let api!: NotificationAPI

  const Demo = defineComponent({
    setup() {
      const [_api, holder] = useNotification(config)
      api = _api
      return () => holder()
    },
  })

  const wrapper = mount(Demo, {
    global: {
      stubs: {
        'transition': false,
        'transition-group': false,
      },
    },
  })
  return { wrapper, get api() {
    return api
  } }
}

describe('@v-c/notification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('opens notice with description', async () => {
    const { api } = renderDemo()
    api.open({ description: h('p', { class: 'test' }, '1'), duration: 0.1 })
    await flush()
    expect(document.querySelector('.test')).toBeTruthy()

    // Run all timers to flush duration
    await flush()
    expect(document.querySelector('.test')).toBeFalsy()
  })

  it('renders semantic slots when provided', async () => {
    const { api } = renderDemo()
    api.open({
      title: 'bamboo',
      description: 'little',
      icon: h('span'),
      actions: h('button', { type: 'button' }, 'light'),
      closable: true,
      showProgress: true,
      duration: 3,
    })
    await flush()

    expect(document.querySelector('.vc-notification-notice-title')).toBeTruthy()
    expect(document.querySelector('.vc-notification-notice-description')).toBeTruthy()
    expect(document.querySelector('.vc-notification-notice-icon')).toBeTruthy()
    expect(document.querySelector('.vc-notification-notice-actions')).toBeTruthy()
    expect(document.querySelector('.vc-notification-notice-close')).toBeTruthy()
    expect(document.querySelector('.vc-notification-notice-progress')).toBeTruthy()
    expect(document.querySelector('.vc-notification-notice-section')).toBeTruthy()
  })

  it('does not wrap in section when only one of title/description provided', async () => {
    const { api } = renderDemo()
    api.open({ description: 'only-description' })
    await flush()
    expect(document.querySelector('.vc-notification-notice-section')).toBeFalsy()
    expect(document.querySelector('.vc-notification-notice-description')).toBeTruthy()
  })

  it('forwards classNames and styles for list and listContent', async () => {
    const { api } = renderDemo({
      classNames: {
        list: 'root-list',
        listContent: 'inner-content',
      },
      styles: {
        list: { color: 'red' },
        listContent: { color: 'blue' },
      },
    })
    api.open({ description: 'x' })
    await flush()
    expect(document.querySelector('.vc-notification-list')?.classList.contains('root-list')).toBe(true)
    expect(document.querySelector('.vc-notification-list-content')?.classList.contains('inner-content')).toBe(true)
  })

  it('respects maxCount', async () => {
    const { api } = renderDemo({ maxCount: 1 })
    api.open({ description: h('span', { class: 'a' }, 'a'), duration: 0 })
    api.open({ description: h('span', { class: 'b' }, 'b'), duration: 0 })
    api.open({ description: h('span', { class: 'c' }, 'c'), duration: 0 })
    await flush()
    expect(document.querySelectorAll('.a, .b, .c')).toHaveLength(1)
    expect(document.querySelector('.c')).toBeTruthy()
  })

  it('triggers onClose only when close button is clicked', async () => {
    const { api } = renderDemo()
    let clicks = 0
    let closes = 0
    api.open({
      description: h('p', 'x'),
      closable: true,
      duration: 0,
      onClick: () => {
        clicks += 1
      },
      onClose: () => {
        closes += 1
      },
    })
    await nextTick()
    await nextTick()
    const closeBtn = document.querySelector('.vc-notification-notice-close') as HTMLButtonElement
    closeBtn.click()
    expect(clicks).toBe(0)
    expect(closes).toBe(1)
  })

  it('destroy removes everything', async () => {
    const { api } = renderDemo()
    api.open({ description: h('p', { class: 'test' }, 'x'), duration: 0 })
    await flush()
    expect(document.querySelector('.test')).toBeTruthy()
    api.destroy()
    await flush()
    expect(document.querySelector('.test')).toBeFalsy()
  })

  it('placement adds className', async () => {
    const { api } = renderDemo()
    api.open({ description: 'x', placement: 'bottomLeft' })
    await flush()
    expect(document.querySelector('.vc-notification')?.classList.contains('vc-notification-bottomLeft')).toBe(true)
  })

  it('motion as function receives placement', async () => {
    const motionFn = vi.fn().mockReturnValue({})
    const { api } = renderDemo({ motion: motionFn })
    api.open({ description: 'x', placement: 'bottomLeft' })
    await flush()
    expect(motionFn).toHaveBeenCalledWith('bottomLeft')
  })

  it('open with custom close icon', async () => {
    const { api } = renderDemo()
    api.open({
      description: 'x',
      closable: { closeIcon: h('span', { class: 'test-icon' }, 'X') },
      duration: 0,
    })
    await flush()
    expect(document.querySelector('.test-icon')?.textContent).toBe('X')
  })

  it('forwards data and aria attrs via props', async () => {
    const { api } = renderDemo()
    api.open({
      description: 'x',
      class: 'notice-class',
      props: {
        'data-test': 'data-test-value',
        'aria-describedby': 'desc-id',
        'role': 'status',
      },
    })
    await flush()
    const notice = document.querySelector('.notice-class')
    expect(notice?.getAttribute('data-test')).toBe('data-test-value')
    expect(notice?.getAttribute('aria-describedby')).toBe('desc-id')
    expect(notice?.getAttribute('role')).toBe('status')
  })

  it('default role is alert', async () => {
    const { api } = renderDemo()
    api.open({ description: 'x' })
    await flush()
    expect(document.querySelector('.vc-notification-notice')?.getAttribute('role')).toBe('alert')
  })
})
