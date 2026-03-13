import { mount } from '@vue/test-utils'
import { nextTick, ref, watchEffect } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OptionList from '../src/OptionList'

const treeMockState = vi.hoisted(() => ({
  latestProps: null as any,
  scrollTo: vi.fn(),
  onKeyDown: vi.fn(),
}))

const optionListMockState = vi.hoisted(() => ({
  baseProps: null as any,
  treeSelectContext: null as any,
  legacyContext: null as any,
}))

vi.mock('@v-c/select', async () => {
  return {
    useBaseProps: () => optionListMockState.baseProps,
  }
})

vi.mock('../src/TreeSelectContext', async () => {
  return {
    useTreeSelectContext: () => optionListMockState.treeSelectContext,
  }
})

vi.mock('../src/LegacyContext', async () => {
  return {
    useLegacyContext: () => optionListMockState.legacyContext,
  }
})

vi.mock('@v-c/tree', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    UnstableContextKey: Symbol('UnstableContextKey'),
    default: defineComponent({
      name: 'TreeMock',
      props: {
        activeKey: { type: [String, Number], default: null },
        onActiveChange: { type: Function, default: undefined },
      },
      setup(props, { expose, attrs }) {
        watchEffect(() => {
          treeMockState.latestProps = {
            ...attrs,
            activeKey: props.activeKey,
            onActiveChange: props.onActiveChange,
          }
        })

        expose({
          scrollTo: treeMockState.scrollTo,
          onKeyDown: treeMockState.onKeyDown,
        })

        return () => h('div', { class: 'tree-mock' })
      },
    }),
  }
})

describe('TreeSelect OptionList', () => {
  beforeEach(() => {
    treeMockState.latestProps = null
    treeMockState.scrollTo.mockReset()
    treeMockState.onKeyDown.mockReset()
    optionListMockState.baseProps = null
    optionListMockState.treeSelectContext = null
    optionListMockState.legacyContext = null
  })

  function mountOptionList({
    open = true,
    multiple = true,
    searchValue = '',
    checkedKeys = [] as Array<string | number>,
  } = {}) {
    const baseProps = ref({
      open,
      multiple,
      searchValue,
      prefixCls: 'vc-select',
      notFoundContent: 'empty',
      toggleOpen: vi.fn(),
      triggerOpen: open,
      lockOptions: false,
      rawOpen: open,
    } as any)

    const treeContext = ref({
      virtual: true,
      popupMatchSelectWidth: true,
      listHeight: 256,
      listItemHeight: 24,
      listItemScrollOffset: 0,
      treeData: [
        { key: 'node-1', value: 'node-1', title: 'alpha' },
        { key: 'node-2', value: 'node-2', title: 'beta' },
      ],
      fieldNames: {
        value: 'value',
        label: 'title',
        children: 'children',
        _title: ['title'],
      },
      onSelect: vi.fn(),
      leftMaxCount: null,
      leafCountOnly: false,
      valueEntities: new Map(),
      classNames: {},
      styles: {},
    } as any)

    const legacyContext = ref({
      checkable: false,
      checkedKeys,
      halfCheckedKeys: [],
      treeDefaultExpandedKeys: [],
      treeNodeFilterProp: 'title',
      keyEntities: {
        'node-1': { node: { key: 'node-1', value: 'node-1', title: 'alpha' } },
        'node-2': { node: { key: 'node-2', value: 'node-2', title: 'beta' } },
      },
    } as any)

    optionListMockState.baseProps = baseProps
    optionListMockState.treeSelectContext = treeContext
    optionListMockState.legacyContext = legacyContext

    const wrapper = mount(OptionList)

    return {
      wrapper,
      baseProps,
      treeContext,
      legacyContext,
    }
  }

  it('initializes active key from checked value only when popup opens', async () => {
    const { baseProps } = mountOptionList({
      open: false,
      multiple: false,
      checkedKeys: ['node-2'],
    })

    await nextTick()
    expect(treeMockState.latestProps.activeKey).toBe(null)

    baseProps.value.open = true
    baseProps.value.triggerOpen = true
    baseProps.value.rawOpen = true
    await nextTick()
    await nextTick()

    expect(treeMockState.latestProps.activeKey).toBe('node-2')
  })

  it('does not reset active key on checkedKeys change alone in multi select', async () => {
    const { baseProps, legacyContext } = mountOptionList({
      open: true,
      multiple: true,
      searchValue: 'alp',
    })

    await nextTick()
    expect(treeMockState.latestProps.activeKey).toBe('node-1')

    treeMockState.latestProps.onActiveChange('node-2')
    await nextTick()
    expect(treeMockState.latestProps.activeKey).toBe('node-2')

    legacyContext.value.checkedKeys = ['node-2']
    await nextTick()

    expect(treeMockState.latestProps.activeKey).toBe('node-2')
  })

  it('resets active key when search value changes, matching React behavior', async () => {
    const { baseProps } = mountOptionList({
      open: true,
      multiple: true,
      searchValue: 'alp',
    })

    await nextTick()
    expect(treeMockState.latestProps.activeKey).toBe('node-1')

    treeMockState.latestProps.onActiveChange('node-2')
    await nextTick()
    expect(treeMockState.latestProps.activeKey).toBe('node-2')

    baseProps.value.searchValue = ''
    await nextTick()

    expect(treeMockState.latestProps.activeKey).toBe('node-1')
  })
})
