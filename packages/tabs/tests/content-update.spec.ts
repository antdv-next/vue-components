import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, vModelText, withDirectives } from 'vue'
import Tabs from '../src'
import TabPane from '../src/TabPanelList/TabPane.vue'

interface Item {
  id: string
  value: string
}

function createHost() {
  const source = ref<Item[]>([
    { id: '1', value: '' },
    { id: '2', value: '' },
  ])
  const activeKey = ref('1')
  const mounted = vi.fn()
  const unmounted = vi.fn()
  const rendered = vi.fn()
  const Probe = defineComponent({
    props: {
      id: { type: String, required: true },
      value: { type: String, required: true },
    },
    setup(props) {
      const local = ref('')
      onMounted(() => mounted(props.id))
      onUnmounted(() => unmounted(props.id))
      return () => h('div', [
        h('span', props.value),
        h('input', {
          class: 'local-value',
          value: local.value,
          onInput: (event: Event) => {
            local.value = (event.target as HTMLInputElement).value
          },
        }),
      ])
    },
  })
  const items = computed(() => source.value.map(item => ({
    key: item.id,
    label: item.id,
    children: () => {
      rendered(item.id)
      return h('section', { 'data-pane': item.id }, [
        h(Probe, { id: item.id, value: item.value }),
        // Equivalent to <input v-model="item.value">, including the directive
        // and its event handler closing over the current item object.
        withDirectives(h('input', {
          'class': 'model-value',
          'onUpdate:modelValue': (value: string) => {
            item.value = value
          },
        }), [[vModelText, item.value]]),
      ])
    },
  })))
  const Host = defineComponent(() => () => h(Tabs, {
    items: items.value,
    activeKey: activeKey.value,
    animated: false,
  }))
  return { Host, source, activeKey, mounted, unmounted, rendered }
}

describe('@v-c/tabs content updates', () => {
  it('keeps direct object mutations and v-model input in sync', async () => {
    const { Host, source } = createHost()
    const wrapper = mount(Host)
    try {
      const original = source.value[0]!
      const input = wrapper.get<HTMLInputElement>('.model-value')
      original.value = 'external mutation'
      await nextTick()
      expect(input.element.value).toBe('external mutation')
      expect(wrapper.get('[data-pane="1"] span').text()).toBe('external mutation')

      await input.setValue('typed mutation')
      expect(source.value[0]).toBe(original)
      expect(original.value).toBe('typed mutation')
    }
    finally {
      wrapper.unmount()
    }
  })

  it('updates same-key replacement content without remounting or rendering unvisited panes', async () => {
    const { Host, source, mounted, unmounted, rendered } = createHost()
    const wrapper = mount(Host)
    try {
      const original = source.value[0]!
      const model = wrapper.get<HTMLInputElement>('.model-value')
      const local = wrapper.get<HTMLInputElement>('.local-value')
      await local.setValue('local state')
      source.value = source.value.map(item => ({ ...item, value: `new ${item.id}` }))
      await nextTick()

      expect(source.value[0]).not.toBe(original)
      expect(wrapper.get('.model-value').element).toBe(model.element)
      expect(wrapper.get('.local-value').element).toBe(local.element)
      expect(local.element.value).toBe('local state')
      expect(mounted.mock.calls).toEqual([['1']])
      expect(unmounted).not.toHaveBeenCalled()
      expect(rendered.mock.calls.every(([id]) => id === '1')).toBe(true)
      expect(model.element.value).toBe('new 1')
      expect(wrapper.get('[data-pane="1"] span').text()).toBe('new 1')
    }
    finally {
      wrapper.unmount()
    }
  })

  it('binds v-model input to the replacement object, not the discarded object', async () => {
    const { Host, source } = createHost()
    const wrapper = mount(Host)
    try {
      const original = source.value[0]!
      source.value = source.value.map(item => ({ ...item }))
      await nextTick()
      const replacement = source.value[0]!
      expect(replacement).not.toBe(original)

      await wrapper.get('.model-value').setValue('typed after replacement')
      expect.soft(replacement.value).toBe('typed after replacement')
      expect.soft(original.value).toBe('')
    }
    finally {
      wrapper.unmount()
    }
  })

  it('updates reordered and previously visited inactive panes while preserving keyed state', async () => {
    const { Host, source, activeKey, mounted, unmounted } = createHost()
    const wrapper = mount(Host)
    try {
      const first = wrapper.get('[data-pane="1"]')
      const firstModel = first.get<HTMLInputElement>('.model-value')
      const firstLocal = first.get<HTMLInputElement>('.local-value')
      await firstLocal.setValue('local 1')
      activeKey.value = '2'
      await nextTick()
      const second = wrapper.get('[data-pane="2"]')
      const secondModel = second.get<HTMLInputElement>('.model-value')
      const secondLocal = second.get<HTMLInputElement>('.local-value')
      await secondLocal.setValue('local 2')

      source.value = [...source.value].reverse().map(item => ({ ...item, value: `updated ${item.id}` }))
      await nextTick()

      expect(wrapper.findAll('[data-pane]').map(pane => pane.attributes('data-pane'))).toEqual(['2', '1'])
      expect(wrapper.get('[data-pane="1"]').element).toBe(first.element)
      expect(wrapper.get('[data-pane="2"]').element).toBe(second.element)
      expect(wrapper.get('[data-pane="1"] .model-value').element).toBe(firstModel.element)
      expect(wrapper.get('[data-pane="2"] .model-value').element).toBe(secondModel.element)
      expect(firstLocal.element.value).toBe('local 1')
      expect(secondLocal.element.value).toBe('local 2')
      expect(mounted.mock.calls).toEqual([['1'], ['2']])
      expect(unmounted).not.toHaveBeenCalled()
      expect(firstModel.element.value).toBe('updated 1')
      expect(secondModel.element.value).toBe('updated 2')

      activeKey.value = '1'
      await nextTick()
      expect(wrapper.get('[data-pane="1"] span').text()).toBe('updated 1')
      expect(mounted).toHaveBeenCalledTimes(2)
    }
    finally {
      wrapper.unmount()
    }
  })
})

describe('@v-c/tabs TabPane slot updates', () => {
  it('uses the current slot for content and tabindex without setup-time slot invocation', async () => {
    const visible = ref(false)
    const active = ref(true)
    const warn = vi.spyOn(console, 'warn')
    const Host = defineComponent(() => () => {
      // Capture a snapshot: the slot body itself has no reactive dependency.
      const current = visible.value
      return h(TabPane, { active: active.value }, {
        default: () => current ? h('span', 'current content') : [],
      })
    })
    const wrapper = mount(Host)
    try {
      expect(wrapper.attributes('tabindex')).toBe('-1')
      visible.value = true
      await nextTick()
      expect(wrapper.text()).toBe('current content')
      expect(wrapper.attributes('tabindex')).toBe('0')
      active.value = false
      await nextTick()
      expect(wrapper.attributes('tabindex')).toBe('-1')
      active.value = true
      visible.value = false
      await nextTick()
      expect(wrapper.text()).toBe('')
      expect(wrapper.attributes('tabindex')).toBe('-1')
      expect(warn).not.toHaveBeenCalled()
    }
    finally {
      wrapper.unmount()
      warn.mockRestore()
    }
  })
})
