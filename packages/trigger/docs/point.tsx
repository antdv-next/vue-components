import { computed, defineComponent, ref } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const builtinPlacements = {
  topLeft: {
    points: ['tl', 'tl'],
  },
}

export default defineComponent(() => {
  const action = ref<'click' | 'hover' | 'contextMenu'>('click')
  const mouseEnterDelay = ref(0)

  const popupAlign = computed(() => ({
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  }))

  return () => (
    <div>
      <label>
        Trigger type:
        <select
          value={action.value}
          onChange={(event) => {
            action.value = (event.target as HTMLSelectElement).value as typeof action.value
          }}
        >
          <option value="click">click</option>
          <option value="hover">hover</option>
          <option value="contextMenu">contextMenu</option>
        </select>
      </label>
      {action.value === 'hover' && (
        <label style={{ marginLeft: '8px' }}>
          Mouse enter delay:
          <input
            type="text"
            value={mouseEnterDelay.value}
            onChange={(event) => {
              mouseEnterDelay.value = Number((event.target as HTMLInputElement).value) || 0
            }}
          />
        </label>
      )}
      <div style={{ margin: '50px' }}>
        <Trigger
          popupPlacement="topLeft"
          action={[action.value] as any}
          popupAlign={popupAlign.value}
          mouseEnterDelay={mouseEnterDelay.value}
          popupClassName="point-popup"
          builtinPlacements={builtinPlacements}
          alignPoint
          popup={() => (
            <div style={{ padding: '20px', background: 'rgba(0, 255, 0, 0.3)', pointerEvents: 'none' }}>
              This is popup
            </div>
          )}
        >
          <div
            style={{
              border: '1px solid red',
              padding: '100px 0',
              textAlign: 'center',
            }}
          >
            Interactive region
          </div>
        </Trigger>
      </div>
    </div>
  )
})
