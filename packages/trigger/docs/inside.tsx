import { defineComponent, onMounted, ref } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const experimentalConfig = {
  _experimental: {
    dynamicInset: true,
  },
}

export const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftX: 0,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: false,
      shiftY: true,
    },
    offset: [0, -20],
    ...experimentalConfig,
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  leftTop: {
    points: ['tr', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  leftBottom: {
    points: ['br', 'bl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: {
      shiftX: 50,
      adjustY: true,
      shiftY: true,
    },
    offset: [0, 20],
    ...experimentalConfig,
  },
}

const popupPlacement = 'bottomLeft'

export default defineComponent(() => {
  const popupHeight = ref(60)
  const containerRef = ref<HTMLDivElement | null>(null)

  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.scrollLeft = window.innerWidth
      containerRef.value.scrollTop = window.innerHeight
    }
  })

  return () => (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0 }}>
        <button
          onClick={() => {
            popupHeight.value = popupHeight.value === 60 ? 200 : 60
          }}
        >
          Popup Height: {popupHeight.value}
        </button>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: '64px',
          overflow: 'auto',
          border: '1px solid red',
        }}
        ref={containerRef}
      >
        <div
          style={{
            width: '300vw',
            height: '300vh',
            background: 'rgba(0, 0, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trigger
            arrow
            popup={() => (
              <div
                style={{
                  background: 'yellow',
                  border: '1px solid blue',
                  width: 200,
                  height: popupHeight.value,
                  opacity: 0.9,
                }}
              >
                Popup
              </div>
            )}
            popupVisible
            getPopupContainer={() => containerRef.value as HTMLElement}
            popupPlacement={popupPlacement}
            builtinPlacements={builtinPlacements}
          >
            <span
              style={{
                display: 'inline-block',
                background: 'green',
                color: '#FFF',
                paddingBlock: '30px',
                paddingInline: '70px',
                opacity: 0.9,
                transform: 'scale(0.6)',
              }}
            >
              Target
            </span>
          </Trigger>
        </div>
      </div>
    </>
  )
})
