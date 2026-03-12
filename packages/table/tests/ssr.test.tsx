import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import Table from '../src'

describe('table ssr', () => {
  it('should render sticky table without touching Element', async () => {
    const html = await renderToString(createSSRApp(() =>
      h(Table, {
        sticky: true,
        rowKey: 'key',
        scroll: { x: 320 },
        columns: [
          {
            key: 'name',
            dataIndex: 'name',
            title: 'Name',
          },
        ],
        data: [
          {
            key: '1',
            name: 'example',
          },
        ],
      }),
    ))

    expect(html).toContain('vc-table')
  })
})
