import type { CSSProperties } from 'vue'
import type { ListyScrollToConfig, ScrollAlign } from '../src/interface'
import { defineComponent, ref } from 'vue'
import Listy from '../src'

const GROUP_SIZE = 15
const GROUP_COUNT = 6

const items = Array.from(
  { length: GROUP_SIZE * GROUP_COUNT },
  (_, index) => ({
    id: index,
    name: `Item ${index}`,
    group: `Group ${Math.floor(index / GROUP_SIZE)}`,
  }),
)

const GROUP_KEYS = Array.from({ length: GROUP_COUNT }, (_, i) => `Group ${i}`)

const controlRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
}

export default defineComponent(() => {
  const listRef = ref<any>(null)
  const virtual = ref(true)
  const align = ref<ScrollAlign>('top')
  const offset = ref(0)
  const itemKey = ref(50)
  const groupKey = ref('Group 3')
  const lastConfig = ref<ListyScrollToConfig | undefined>()

  const run = (config: ListyScrollToConfig) => {
    lastConfig.value = config
    listRef.value?.scrollTo(config)
  }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={controlRow}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="checkbox"
            checked={virtual.value}
            onChange={(e: Event) => { virtual.value = (e.target as HTMLInputElement).checked }}
          />
          virtual
        </label>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          align
          <select
            value={align.value}
            onChange={(e: Event) => { align.value = (e.target as HTMLSelectElement).value as ScrollAlign }}
          >
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="auto">auto</option>
          </select>
        </label>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          offset
          <input
            type="number"
            value={offset.value}
            style={{ width: '64px' }}
            onChange={(e: Event) => { offset.value = Number((e.target as HTMLInputElement).value) || 0 }}
          />
        </label>
      </div>

      {/* number | { top } — absolute pixel scroll */}
      <div style={controlRow}>
        <button type="button" onClick={() => run(0)}>
          scrollTo(0)
        </button>
        <button type="button" onClick={() => run(400)}>
          scrollTo(400)
        </button>
        <button type="button" onClick={() => run({ top: 200 })}>
          scrollTo(
          {{ top: 200 }}
          )
        </button>
      </div>

      {/* { key, align, offset } — scroll to an item */}
      <div style={controlRow}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          key
          <input
            type="number"
            value={itemKey.value}
            style={{ width: '64px' }}
            onChange={(e: Event) => { itemKey.value = Number((e.target as HTMLInputElement).value) || 0 }}
          />
        </label>
        <button
          type="button"
          onClick={() => run({ key: itemKey.value, align: align.value, offset: offset.value })}
        >
          scrollTo item
        </button>

        {/* { groupKey, align, offset } — scroll to a group header */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          group
          <select
            value={groupKey.value}
            onChange={(e: Event) => { groupKey.value = (e.target as HTMLSelectElement).value }}
          >
            {GROUP_KEYS.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => run({ groupKey: groupKey.value, align: align.value, offset: offset.value })}>
          scrollTo group
        </button>
      </div>

      <div>
        last config:
        {' '}
        <code>
          {lastConfig.value === undefined ? '—' : JSON.stringify(lastConfig.value)}
        </code>
      </div>

      <Listy
        key={virtual.value ? 'virtual' : 'raw'}
        ref={listRef}
        virtual={virtual.value}
        height={360}
        itemHeight={40}
        items={items}
        rowKey="id"
        sticky
        itemRender={(item, index) => {
          const height = 40 + (index % 3) * 16
          return (
            <div
              style={{
                padding: '0 16px',
                height: `${height}px`,
                lineHeight: `${height}px`,
                borderBottom: '1px solid #f0f0f0',
                background: '#fff',
              }}
            >
              {item.name}
            </div>
          )
        }}
        group={{
          key: item => item.group,
          title: (key, groupItems) => (
            <div
              style={{
                padding: '10px 16px',
                fontWeight: 600,
                background: '#e6f4ff',
                borderBottom: '1px solid #91caff',
              }}
            >
              {key}
              {' '}
              ·
              {groupItems.length}
              {' '}
              items
            </div>
          ),
        }}
      />
    </div>
  )
})
