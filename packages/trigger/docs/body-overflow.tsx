import Portal from '@v-c/portal'
import { defineComponent, ref } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const popupAlign = {
  points: ['tc', 'bc'],
  overflow: {
    shiftX: 50,
    adjustY: true,
  },
  htmlRegion: 'scroll' as const,
}

const commonStyle: Record<string, string | number> = {
  paddingBlock: '30px',
  paddingInline: '70px',
  opacity: 0.9,
  transform: 'scale(0.6)',
  display: 'inline-block',
}

const commonPopupStyle: Record<string, string | number> = {
  background: 'yellow',
  border: '1px solid blue',
  width: '200px',
  height: '60px',
  opacity: 0.9,
}

const popupStyle = { boxShadow: '0 0 5px red' }

const PortalDemo = defineComponent(() => {
  return () => (
    <Portal open getContainer={() => document.body}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          background: 'red',
          zIndex: 999,
        }}
      >
        PortalNode
      </div>
    </Portal>
  )
})

export default defineComponent(() => {
  const open = ref(false)
  const open1 = ref(false)
  const open2 = ref(false)
  const open3 = ref(false)

  const motion = { name: 'vc-trigger-popup-zoom' }

  return () => (
    <div>
      <style innerHTML="body { overflow-x: hidden; }" />

      <Trigger
        arrow
        popupVisible={open.value}
        onOpenChange={(val: boolean) => {
          console.log('Visible Change:', val)
          open.value = val
        }}
        popupMotion={motion}
        popupStyle={popupStyle}
        popupAlign={popupAlign}
        popup={() => (
          <div style={commonPopupStyle}>
            <button
              onClick={() => {
                open.value = false
              }}
            >
              Close
            </button>

            <PortalDemo />
          </div>
        )}
      >
        <button style={{ ...commonStyle }}>
          Target Hover
        </button>
      </Trigger>

      <Trigger
        arrow
        action="click"
        popupVisible={open1.value}
        onOpenChange={(val: boolean) => {
          console.log('Visible Change:', val)
          open1.value = val
        }}
        popupMotion={motion}
        popupStyle={popupStyle}
        popupAlign={popupAlign}
        popup={() => (
          <div style={commonPopupStyle}>
            <button
              onClick={() => {
                open1.value = false
              }}
            >
              Close
            </button>
          </div>
        )}
      >
        <span
          style={{
            ...commonStyle,
            background: 'green',
            color: '#FFF',
          }}
        >
          Target Click
        </span>
      </Trigger>

      <Trigger
        arrow
        action="contextMenu"
        popupVisible={open2.value}
        onOpenChange={(val: boolean) => {
          console.log('Visible Change:', val)
          open2.value = val
        }}
        popupMotion={motion}
        popupStyle={popupStyle}
        popupAlign={popupAlign}
        popup={() => (
          <div style={commonPopupStyle}>
            Target ContextMenu1
          </div>
        )}
      >
        <span
          style={{
            ...commonStyle,
            background: 'blue',
            color: '#FFF',
          }}
        >
          Target ContextMenu1
        </span>
      </Trigger>

      <Trigger
        arrow
        action="contextMenu"
        popupVisible={open3.value}
        onOpenChange={(val: boolean) => {
          console.log('Visible Change:', val)
          open3.value = val
        }}
        popupMotion={motion}
        popupStyle={popupStyle}
        popupAlign={popupAlign}
        popup={() => (
          <div style={commonPopupStyle}>
            Target ContextMenu2
          </div>
        )}
      >
        <span
          style={{
            ...commonStyle,
            background: 'blue',
            color: '#FFF',
          }}
        >
          Target ContextMenu2
        </span>
      </Trigger>
    </div>
  )
})
