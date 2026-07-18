import type { CSSProperties } from 'vue'
import type { ListyRef } from '../src'
import { defineComponent, ref } from 'vue'
import Listy from '../src'

interface RowItem {
  id: number
  name: string
}

const BATCH_SIZE = 30
const LOAD_DELAY = 500

function createBatch(startId: number, count: number): RowItem[] {
  return Array.from({ length: count }, (_, index) => {
    const id = startId + index
    return {
      id,
      name: `Row ${id}`,
    }
  })
}

export default defineComponent(() => {
  const listRef = ref<ListyRef | null>(null)
  const nextIdRef = ref(BATCH_SIZE + 1)

  const items = ref<RowItem[]>(createBatch(1, BATCH_SIZE))
  const loading = ref(false)

  const loadMore = () => {
    if (loading.value) {
      return
    }

    loading.value = true

    window.setTimeout(() => {
      const nextItems = createBatch(nextIdRef.value, BATCH_SIZE)
      nextIdRef.value += nextItems.length
      items.value = [...items.value, ...nextItems]

      loading.value = false
    }, LOAD_DELAY)
  }

  const itemStyle: CSSProperties = {
    padding: '0 12px',
    height: '32px',
    lineHeight: '32px',
    borderBottom: '1px solid #efefef',
    background: '#fff',
  }
  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Listy
        ref={listRef}
        height={560}
        itemHeight={32}
        items={items.value}
        rowKey="id"
        itemRender={item => (
          <div style={itemStyle}>{item.name}</div>
        )}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={loadMore} disabled={loading.value}>
          {loading.value ? 'Loading…' : 'Load More'}
        </button>
        <button
          onClick={() => {
            const lastItem = items.value[items.value.length - 1]
            if (!lastItem) {
              return
            }
            listRef.value?.scrollTo({ key: lastItem.id, align: 'bottom' })
          }}
        >
          Scroll To Latest
        </button>
        <span>
          Count:
          {items.value.length}
        </span>
      </div>
    </div>
  )
})
