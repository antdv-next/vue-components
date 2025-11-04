import { defineComponent, onMounted, ref } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, 0],
    targetOffset: [10, 0],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftX: true,
      adjustY: true,
    },
    offset: [0, 10],
    htmlRegion: 'scroll' as const,
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [-10, 0],
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      shiftY: 24,
    },
    offset: [10, 0],
  },
}

const popupPlacement = 'top'

export default defineComponent(() => {
  console.log('Demo Render!')

  const visible = ref(false)
  const scale = ref('1')
  const targetVisible = ref(true)

  const rootRef = ref<HTMLDivElement | null>(null)
  const popHolderRef = ref<HTMLDivElement | null>(null)
  const scrollRef = ref<HTMLDivElement | null>(null)

  onMounted(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollLeft = window.innerWidth
      scrollRef.value.scrollTop = window.innerHeight / 2
    }
  })

  return () => (
    <div
      id="demo-root"
      ref={rootRef}
      style={{ background: 'rgba(0, 0, 255, 0.1)', padding: '16px' }}
    >
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 9999,
        }}
      >
        <input
          type="number"
          value={scale.value}
          onChange={(event) => {
            scale.value = (event.target as HTMLInputElement).value
          }}
        />
        <button
          type="button"
          onClick={() => {
            targetVisible.value = !targetVisible.value
          }}
        >

          Target Visible: (
          {String(targetVisible.value)}
          )
        </button>
        <button
          type="button"
          onClick={() => {
            visible.value = true
          }}
        >
          Trigger Visible
        </button>
      </div>
      <div
        id="demo-holder"
        ref={popHolderRef}
        style={{
          position: 'relative',
          width: 0,
          height: 0,
          zIndex: 999,
          transform: `scale(${scale.value})`,
          transformOrigin: 'top left',
        }}
      />
      <div
        ref={scrollRef}
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
            width: 'calc(300vw)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Trigger
            arrow={{ content: 'Arrow' }}
            action="click"
            popup={() => (
              <div
                style={{
                  background: 'yellow',
                  border: '1px solid blue',
                  width: '200px',
                  height: '60px',
                  opacity: 0.9,
                }}
              >
                Popup
              </div>
            )}
            popupMotion={{ name: 'vc-trigger-popup-zoom' }}
            popupStyle={{ boxShadow: '0 0 5px red' }}
            popupVisible={visible.value}
            onOpenChange={(nextVisible: boolean) => {
              visible.value = nextVisible
            }}
            popupPlacement={popupPlacement}
            builtinPlacements={builtinPlacements}
            stretch="minWidth"
            onPopupAlign={(domNode, align) => {
              console.log('onPopupAlign:', domNode, align)
            }}
          >
            <span
              style={{
                background: 'green',
                color: '#FFF',
                paddingBlock: '30px',
                paddingInline: '70px',
                opacity: 0.9,
                transform: 'scale(0.6)',
                display: targetVisible.value ? 'inline-block' : 'none',
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
