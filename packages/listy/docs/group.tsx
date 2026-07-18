import type { CSSProperties } from 'vue'
import type { ListyRef } from '../src'
import { computed, defineComponent, ref } from 'vue'
import Listy from '../src'

export default defineComponent(() => {
  const listRef = ref<ListyRef | null>(null)

  const groupSize = 12
  const total = 240
  const groupCount = Math.ceil(total / groupSize)
  const groupKeys = computed(
    () => Array.from({ length: groupCount }, (_, index) => `G${index}`),
  )

  const items = Array.from({ length: total }, (_, index) => {
    const groupIndex = Math.floor(index / groupSize)
    return {
      id: index + 1,
      name: `Row ${index}`,
      groupId: `G${groupIndex}`,
    }
  })

  const itemStyle: CSSProperties = {
    padding: '0 12px',
    borderBottom: '1px solid #efefef',
    background: '#fff',
  }

  function renderHeader(groupKey: string, groupItems: typeof items) {
    const groupIndex = Number(groupKey.slice(1))
    const heights = [32, 56, 80]
    const h = heights[groupIndex % heights.length]
    return (
      <div
        style={{
          height: `${h}px`,
          padding: '0 12px',
          fontWeight: `600px`,
          background: 'rgba(250, 250, 250)',
          borderBottom: '1px solid #eaeaea',
        }}
      >
        Group
        {' '}
        {groupKey}
        {' '}
        (size:
        {' '}
        {groupItems.length}
        )
      </div>
    )
  }

  const scrollToGroup = (groupKey: string) => {
    listRef.value?.scrollTo({ groupKey, align: 'top' })
  }
  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => scrollToGroup('G0')}>
          Scroll to first group
        </button>
        <button
          type="button"
          onClick={() => scrollToGroup(`G${groupCount - 1}`)}
        >
          Scroll to last group
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          maxHeight: '120px',
          overflow: 'auto',
        }}
      >
        {groupKeys.value.map(groupKey => (
          <button
            type="button"
            key={groupKey}
            onClick={() => scrollToGroup(groupKey)}
          >
            Scroll to
            {' '}
            {groupKey}
          </button>
        ))}
      </div>
      <Listy
        height={360}
        itemHeight={32}
        items={items}
        rowKey="id"
        sticky
        virtual
        itemRender={(item, index) => {
          const heights = [30, 42, 54]
          const h = heights[index % heights.length]
          return (
            <div style={{ ...itemStyle, height: h, lineHeight: `${h}px` }}>
              {item.name}
              {' '}
              ·
              {item.groupId}
            </div>
          )
        }}
        group={{
          key: item => item.groupId,
          title: (groupKey, groupItems) => renderHeader(groupKey, groupItems),
        }}
        ref={listRef}
      />
    </div>
  )
})
