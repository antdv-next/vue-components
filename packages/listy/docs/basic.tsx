import type { CSSProperties } from 'vue'
import type { ListyRef } from '../src'
import { defineComponent, ref } from 'vue'
import Listy from '../src'

export default defineComponent(() => {
  const listRef = ref<ListyRef | null>(null)
  const items = Array.from({ length: 200 }, (_, index) => {
    const groupItemsCount = 20
    const groupIndex = Math.floor(index / groupItemsCount)
    return {
      id: index + 1,
      name: `${index} (group ${groupIndex})`,
      type: `Group ${groupIndex * groupItemsCount}`,
    }
  })

  const itemStyle: CSSProperties = {
    padding: '0 12px',
    height: '32px',
    lineHeight: '32px',
    borderBottom: '1px solid rgb(79, 53, 53)',
  }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Listy
        height={320}
        itemHeight={32}
        items={items}
        itemRender={(item, index) => {
          return <div style={{ ...itemStyle, height: `${30 + (index % 2 ? -3 : 10)}px` }}>{item.name}</div>
        }}
        rowKey="id"
        ref={listRef}
        sticky
        group={{
          key: item => item.type,
          title: (groupKey, groupItems) => (
            <div
              style={{
                fontWeight: '600px',
                padding: '0 12px',
                height: '32px',
                lineHeight: '32px',
                borderBottom: '1px solid #f5f5f5',
                backgroundColor: 'gray',
              }}
            >
              {groupKey}
              ------
              {groupItems.length}
            </div>
          ),
        }}
      />

      <button
        onClick={() =>
          listRef.value?.scrollTo({
            key: 100,
            align: 'top',
          })}
      >
        Scroll To 100
      </button>
      <button
        onClick={() =>
          listRef.value?.scrollTo({
            groupKey: 'Group 120',
            align: 'top',
          })}
      >
        Scroll To Group 120
      </button>
    </div>
  )
})
