import { defineComponent, ref } from 'vue'
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
  padding: `10px`,
  background: 'rgba(255, 0, 0, 0.1)',
}

export default defineComponent(() => {
  const open1 = ref(false)
  const open2 = ref(false)

  return () => (
    <div style={{ margin: '200px' }}>
      <Trigger
        popupPlacement="right"
        action={['click']}
        builtinPlacements={builtinPlacements}
        popupVisible={open1.value}
        onOpenChange={(val: boolean) => { open1.value = val }}
        fresh
        popup={() => (
          <Trigger
            popupPlacement="right"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popupVisible={open2.value}
            onOpenChange={(val: boolean) => { open2.value = val }}
            popup={() => (
              <div style={popupBorderStyle}>
                i am a click popup
              </div>
            )}
          >
            <div style={popupBorderStyle}>
              i am a click popup
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  event.preventDefault()
                }}
              >
                I am preventPop
              </button>
            </div>
          </Trigger>
        )}
      >
        <span>Click Me</span>
      </Trigger>
    </div>
  )
})
