import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import Drawer from '../src'

describe('drawer ssr', () => {
  it('should render when open without touching document', async () => {
    const html = await renderToString(createSSRApp(() =>
      h(Drawer, {
        open: true,
        getContainer: false,
        placement: 'right',
        width: 320,
      }),
    ))

    expect(html).toContain('vc-drawer')
  })
})
