import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import Overflow from '../src'

interface ItemType {
  value: number
  label: string
}

function createData(count: number): ItemType[] {
  return Array.from({ length: count }, (_, index) => ({
    value: index,
    label: `Label ${index}`,
  }))
}

const overflowSharedStyle: CSSProperties = {
  background: 'rgba(0, 255, 0, 0.1)',
}

const sharedStyle: CSSProperties = {
  padding: '4px 8px',
  width: '90px',
  overflow: 'hidden',
  background: 'rgba(255, 0, 0, 0.2)',
}

const data = createData(5)
const data2 = createData(2)

export default defineComponent(() => {
  return () => (
    <div style={{ padding: '32px' }}>
      <p>Test for a edge case that rest can not decide the final display count</p>
      <div
        style={{
          border: '10px solid green',
          marginTop: '32px',
          display: 'inline-block',
        }}
      >
        <Overflow
          data={data}
          style={{ width: '300px', ...overflowSharedStyle }}
          maxCount="responsive"
          renderItem={(item: ItemType) => <div style={sharedStyle}>{item.label}</div>}
          renderRest={(items: ItemType[]) =>
            items.length < 3
              ? (
                  <span>{items.length}</span>
                )
              : (
                  <div style={sharedStyle}>
                    +
                    {items.length}
                    ...
                  </div>
                )}
        />

        <Overflow
          data={data2}
          style={{ width: '180px', ...overflowSharedStyle }}
          maxCount="responsive"
          renderItem={(item: ItemType) => <div style={sharedStyle}>{item.label}</div>}
          renderRest={(items: ItemType[]) =>
            items.length < 3
              ? (
                  <span>{items.length}</span>
                )
              : (
                  <div style={sharedStyle}>
                    +
                    {items.length}
                    ...
                  </div>
                )}
        />
      </div>
    </div>
  )
})
