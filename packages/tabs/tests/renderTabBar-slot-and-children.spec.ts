import type { TabsProps } from '../src'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import Tabs from '../src'

function getNodeKeyFromVNode(node: any) {
  return node?.props?.['data-node-key']
}

describe('@v-c/tabs renderTabBar children vs slot', () => {
  const items: NonNullable<TabsProps['items']> = [
    { key: '1', label: 'tab 1', children: 'Content of Tab Pane 1' },
    { key: '2', label: 'tab 2', children: 'Content of Tab Pane 2' },
    { key: '3', label: 'tab 3', children: 'Content of Tab Pane 3' },
  ]

  it('applies `children` wrapper function for each tab node', () => {
    const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => {
      return h(DefaultTabBar, {
        ...props,
        children: (node: any) =>
          h(
            'div',
            {
              'data-testid': 'children-wrap',
              'data-node-key': getNodeKeyFromVNode(node),
            },
            [node],
          ),
      })
    }

    const wrapper = mount(Tabs, {
      props: {
        items,
        renderTabBar,
      },
    })

    const nodes = wrapper.findAll('[data-testid="children-wrap"]')
    expect(nodes).toHaveLength(items.length)

    const keys = nodes.map(n => n.attributes('data-node-key'))
    expect(keys.sort()).toEqual(items.map(i => i.key).sort())
  })

  it('applies `default` scoped slot wrapper for each tab node', () => {
    const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => {
      return h(
        DefaultTabBar,
        props,
        {
          default: (node: any) =>
            h(
              'div',
              {
                'data-testid': 'slot-wrap',
                'data-node-key': getNodeKeyFromVNode(node),
              },
              [node],
            ),
        },
      )
    }

    const wrapper = mount(Tabs, {
      props: {
        items,
        renderTabBar,
      },
    })

    const nodes = wrapper.findAll('[data-testid="slot-wrap"]')
    expect(nodes).toHaveLength(items.length)

    const keys = nodes.map(n => n.attributes('data-node-key'))
    expect(keys.sort()).toEqual(items.map(i => i.key).sort())
  })
})
