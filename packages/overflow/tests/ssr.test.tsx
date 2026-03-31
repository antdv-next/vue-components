import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Overflow from '../src'

describe('Overflow SSR', () => {
  it('merges item classes into a single class attribute', async () => {
    const PassThroughItem = defineComponent(
      (_props, { slots, attrs }) => () => (
        <Overflow.Item component="li" role="menuitem" {...attrs}>
          {slots.default?.()}
        </Overflow.Item>
      ),
      {
        inheritAttrs: false,
      },
    )

    const html = await renderToString(createSSRApp(() => (
      <Overflow
        component="ul"
        data={[{ key: 'Dashboard', label: '仪表盘' }]}
        itemKey="key"
        maxCount="responsive"
        ssr="full"
        renderRawItem={(item: { label: string }) => (
          <PassThroughItem
            className="ant-menu-item ant-menu-item-selected"
          >
            {item.label}
          </PassThroughItem>
        )}
      />
    )))

    const itemOpenTag = html.match(/<li[^>]*>/)?.[0] ?? ''

    expect(itemOpenTag.match(/\bclass="/g)).toHaveLength(1)
    expect(itemOpenTag).toContain('vc-overflow-item')
    expect(itemOpenTag).toContain('ant-menu-item')
    expect(itemOpenTag).toContain('ant-menu-item-selected')
  })
})
