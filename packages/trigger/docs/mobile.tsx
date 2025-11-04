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

const mobileConfig = {
  mask: true,
  motion: { name: 'vc-trigger-popup-zoom' },
  maskMotion: { name: 'vc-trigger-popup-fade' },
}

export default defineComponent(() => {
  const open = ref(false)

  return () => (
    <div style={{ margin: '200px' }}>
      <Trigger
        popupVisible={open.value}
        onUpdate:popupVisible={(val: boolean) => { open.value = val }}
        popupPlacement="top"
        action={['hover']}
        builtinPlacements={builtinPlacements}
        popupStyle={{
          background: '#FFF',
          boxShadow: '0 0 3px red',
          padding: '12px',
        }}
        mobile={mobileConfig as any}
        popup={() => (
          <div>
            <h2 style={{ margin: 0 }}>Hello World</h2>
          </div>
        )}
      >
        <span>Hover Me</span>
      </Trigger>
    </div>
  )
})
