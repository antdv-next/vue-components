import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Menu from '../src'

describe('Menu SSR', () => {
  it('keeps horizontal item classes when overflow is enabled', async () => {
    const html = await renderToString(createSSRApp(() => (
      <Menu
        prefixCls="ant-menu"
        mode="horizontal"
        selectedKeys={['Dashboard']}
        items={[
          { key: 'Dashboard', label: '仪表盘' },
          { key: 'Users', label: '用户' },
        ]}
      />
    )))

    const itemOpenTag = html.match(/<li[^>]*Dashboard[^>]*>|<li[^>]*>/)?.[0] ?? ''

    expect(itemOpenTag.match(/\bclass="/g)).toHaveLength(1)
    expect(itemOpenTag).toContain('ant-menu-overflow-item')
    expect(itemOpenTag).toContain('ant-menu-item')
    expect(itemOpenTag).toContain('ant-menu-item-selected')
  })
})
