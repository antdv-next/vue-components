import { defineComponent, onMounted, ref } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftY: true,
      adjustY: true,
    },
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftY: true,
      adjustY: true,
    },
    offset: [0, 10],
    htmlRegion: 'scroll' as const,
  },
}

export default defineComponent(() => {
  const containerRef = ref<HTMLDivElement | null>(null)

  onMounted(() => {
    containerRef.value?.scrollTo({ top: window.innerHeight * 0.75 })
  })

  return () => (
    <div
      id="demo-root"
      style={{ background: 'rgba(0, 0, 255, 0.1)', padding: '16px' }}
    >
      <div
        ref={containerRef}
        style={{
          border: '1px solid red',
          padding: '10px',
          height: '100vh',
          background: '#FFF',
          position: 'relative',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: '200vh',
            paddingTop: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Trigger
            arrow
            action="click"
            popup={() => (
              <div
                style={{
                  background: 'yellow',
                  border: '1px solid blue',
                  width: '200px',
                  height: '75vh',
                  opacity: 0.9,
                }}
              >
                Popup 75vh
              </div>
            )}
            popupStyle={{ boxShadow: '0 0 5px red' }}
            popupVisible
            popupPlacement="top"
            builtinPlacements={builtinPlacements}
          >
            <span
              style={{
                background: 'green',
                color: '#FFF',
                paddingBlock: '30px',
                paddingInline: '70px',
                opacity: 0.9,
                transform: 'scale(0.6)',
                display: 'inline-block',
              }}
            >
              Target
            </span>
          </Trigger>
        </div>
      </div>
    </div>
  )
})
