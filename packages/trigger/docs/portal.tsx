import { defineComponent, onMounted, ref, Teleport } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
}

const popupBorderStyle: Record<string, string | number> = {
  border: '1px solid red',
  padding: '10px',
  background: 'rgba(255, 0, 0, 0.1)',
}

const PortalPopup = defineComponent(() => {
  return () => (
    <Teleport to={document.body}>
      <div
        style={popupBorderStyle}
        onMousedown={(event) => {
          console.log('Portal Down', event)
          event.stopPropagation()
          event.preventDefault()
        }}
      >
        i am a portal element
      </div>
    </Teleport>
  )
})

export default defineComponent(() => {
  const buttonRef = ref<HTMLButtonElement | null>(null)

  onMounted(() => {
    const button = buttonRef.value
    if (button) {
      button.addEventListener('mousedown', (event) => {
        console.log('button natives down')
        event.stopPropagation()
        event.preventDefault()
      })
    }
  })

  return () => (
    <div
      style={{
        padding: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '100px',
      }}
    >
      <Trigger
        popupPlacement="right"
        action={['click']}
        builtinPlacements={builtinPlacements}
        popup={() => (
          <div style={popupBorderStyle}>
            i am a click popup
            <PortalPopup />
          </div>
        )}
        onOpenChange={(visible: boolean) => {
          console.log('visible change:', visible)
        }}
      >
        <button>Click Me</button>
      </Trigger>

      <button
        onMousedown={(event) => {
          console.log('button down')
          event.stopPropagation()
          event.preventDefault()
        }}
      >
        Stop Pop &amp; Prevent Default
      </button>
      <button ref={buttonRef}>Native Stop Pop &amp; Prevent Default</button>
    </div>
  )
})
