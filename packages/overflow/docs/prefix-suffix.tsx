import { computed, defineComponent, ref } from 'vue'
import Overflow from '../src'
import './assets/index.less'
import './assets/common.less'

interface ItemType {
  value: string | number
  label: string
}

function createData(count: number): ItemType[] {
  const data: ItemType[] = Array.from({ length: count }, (_, index) => ({
    value: index,
    label: `Item ${index + 1}`,
  }))

  return data
}

function renderItem(item: ItemType) {
  return (
    <div
      style={{
        margin: '0 4px',
        padding: '6px 12px',
        background: '#f0f0f0',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
      }}
    >
      {item.label}
    </div>
  )
}

function renderRest(items: ItemType[]) {
  return (
    <div
      style={{
        margin: '0 4px',
        padding: '6px 12px',
        background: '#fff2e8',
        border: '1px solid #ffbb96',
        borderRadius: '4px',
        color: '#d46b08',
      }}
    >
      +
      {items.length}
      {' '}
      more
    </div>
  )
}

export default defineComponent(() => {
  const itemCount = ref(8)
  const prefixType = ref<'none' | 'text' | 'icon' | 'complex'>('text')
  const suffixType = ref<'none' | 'text' | 'button'>('none')

  const data = computed(() => createData(itemCount.value))

  const renderPrefix = () => {
    switch (prefixType.value) {
      case 'text':
        return (
          <div
            style={{
              padding: '6px 12px',
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              color: '#1890ff',
              fontWeight: 'bold',
            }}
          >
            标签:
          </div>
        )
      case 'icon':
        return (
          <div
            style={{
              padding: '6px 8px',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '4px',
              color: '#52c41a',
            }}
          >
            🏷️
          </div>
        )
      case 'complex':
        return (
          <div
            style={{
              padding: '4px 8px',
              background: 'linear-gradient(45deg, #f0f0f0, #e6f7ff)',
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '12px' }}>📋</span>
            <span style={{ fontSize: '12px', color: '#1890ff' }}>分类:</span>
          </div>
        )
      default:
        return undefined
    }
  }

  const renderSuffix = () => {
    switch (suffixType.value) {
      case 'text':
        return (
          <div
            style={{
              padding: '6px 12px',
              background: '#fff1f0',
              border: '1px solid #ffccc7',
              borderRadius: '4px',
              color: '#f5222d',
              fontSize: '12px',
            }}
          >
            (总计)
          </div>
        )
      case 'button':
        return (
          <button
            style={{
              padding: '4px 8px',
              background: '#f0f0f0',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            onClick={() => {
              // eslint-disable-next-line no-alert
              alert('查看更多')
            }}
          >
            更多 →
          </button>
        )
      default:
        return undefined
    }
  }

  return () => (
    <div style={{ padding: '32px' }}>
      <h2>Prefix Demo</h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ marginRight: '8px' }}>Items Count:</label>
        <select
          value={itemCount.value}
          onChange={(e) => {
            itemCount.value = Number((e.target as HTMLSelectElement).value)
          }}
          style={{ marginRight: '16px', padding: '2px 4px' }}
        >
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={8}>8</option>
          <option value={12}>12</option>
          <option value={20}>20</option>
        </select>

        <label style={{ marginRight: '8px' }}>Prefix:</label>
        <select
          value={prefixType.value}
          onChange={(e) => {
            prefixType.value = (e.target as HTMLSelectElement).value as any
          }}
          style={{ marginRight: '16px', padding: '2px 4px' }}
        >
          <option value="none">None</option>
          <option value="text">Text</option>
          <option value="icon">Icon</option>
          <option value="complex">Complex</option>
        </select>

        <label style={{ marginRight: '8px' }}>Suffix:</label>
        <select
          value={suffixType.value}
          onChange={(e) => {
            suffixType.value = (e.target as HTMLSelectElement).value as any
          }}
          style={{ padding: '2px 4px' }}
        >
          <option value="none">None</option>
          <option value="text">Text</option>
          <option value="button">Button</option>
        </select>
      </div>

      <div
        style={{
          border: '2px solid #1890ff',
          padding: '16px',
          borderRadius: '8px',
          background: '#fafafa',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Responsive Mode:</h3>
        <div
          style={{
            border: '1px dashed #d9d9d9',
            padding: '12px',
            maxWidth: '500px',
            background: 'white',
            borderRadius: '4px',
          }}
        >
          <Overflow
            data={data.value}
            renderItem={renderItem}
            renderRest={renderRest}
            maxCount="responsive"
            prefix={renderPrefix()}
            suffix={renderSuffix()}
          />
        </div>
      </div>

      <div
        style={{
          border: '2px solid #52c41a',
          padding: '16px',
          borderRadius: '8px',
          background: '#fafafa',
          marginTop: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', color: '#52c41a' }}>Fixed MaxCount (5):</h3>
        <div
          style={{
            border: '1px dashed #d9d9d9',
            padding: '12px',
            background: 'white',
            borderRadius: '4px',
          }}
        >
          <Overflow
            data={data.value}
            renderItem={renderItem}
            renderRest={renderRest}
            maxCount={5}
            prefix={renderPrefix()}
            suffix={renderSuffix()}
          />
        </div>
      </div>
    </div>
  )
})
