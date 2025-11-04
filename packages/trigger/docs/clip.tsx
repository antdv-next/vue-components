import { defineComponent, ref } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
}

const popupPlacement = 'top'

export default defineComponent(() => {
  const scale = ref('1')

  return () => (
    <div>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
        }}
      >
        <input
          type="number"
          value={scale.value}
          onChange={(event) => {
            scale.value = (event.target as HTMLInputElement).value
          }}
        />
      </div>

      <div
        style={{
          height: '500px',
          width: '500px',
          boxSizing: 'border-box',
          background: 'rgba(255,0,0,0.1)',
          border: '50px solid rgba(0,0,255,0.1)',
          overflow: 'clip',
          overflowClipMargin: '50px',
          position: 'relative',
        }}
      >
        <Trigger
          arrow
          action="click"
          popupVisible
          popup={() => (
            <div
              style={{
                background: 'yellow',
                border: '1px solid blue',
                width: '100px',
                height: '100px',
                opacity: 0.9,
                boxSizing: 'border-box',
              }}
            >
              Popup
            </div>
          )}
          getPopupContainer={node => node?.parentNode as HTMLElement}
          popupStyle={{ boxShadow: '0 0 5px red' }}
          popupPlacement={popupPlacement}
          builtinPlacements={builtinPlacements}
          stretch="minWidth"
        >
          <span
            style={{
              background: 'green',
              color: '#FFF',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100px',
              height: '100px',
              position: 'absolute',
              left: 0,
              top: '80px',
            }}
          >
            Target
          </span>
        </Trigger>
      </div>
    </div>
  )
})
