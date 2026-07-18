import type { CSSProperties } from 'vue'
import { defineComponent, ref } from 'vue'
import Listy from '../src'

export default defineComponent(() => {
  const direction = ref<'ltr' | 'rtl'>('rtl')
  const virtual = ref(true)

  const groupSize = 10
  const total = 120
  const items = Array.from({ length: total }, (_, index) => ({
    id: index + 1,
    index,
    groupIndex: Math.floor(index / groupSize),
  }))

  const itemStyle: CSSProperties = {
    padding: '0 12px',
    height: '32px',
    lineHeight: '32px',
    borderBottom: '1px solid #efefef',
    background: '#fff',
  }

  const rtl = direction.value === 'rtl'

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => direction.value = direction.value === 'rtl' ? 'ltr' : 'rtl'}
        >
          direction:
          {' '}
          {direction.value}
        </button>
        <button type="button" onClick={() => virtual.value = !virtual.value}>
          virtual:
          {' '}
          {String(virtual.value)}
        </button>
      </div>
      <Listy
        height={320}
        itemHeight={32}
        items={items}
        virtual={virtual.value}
        direction={direction.value}
        rowKey="id"
        sticky
        group={{
          key: item => item.groupIndex,
          title: groupKey => (
            <div
              style={{
                height: '40px',
                lineHeight: '40px',
                padding: '0 12px',
                fontWeight: 600,
                background: '#f5f5f5',
              }}
            >
              {rtl ? `مجموعة ${groupKey}` : `Group ${groupKey}`}
            </div>
          ),
        }}
        itemRender={item => (
          <div style={itemStyle}>
            {rtl ? `العنصر ${item.index}` : `Item ${item.index}`}
          </div>
        )}
      />
    </div>
  )
})
