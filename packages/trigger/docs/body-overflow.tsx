import { defineComponent, shallowRef, Teleport } from 'vue'
import Trigger from '../src'
import './assets/index.less'

function PortalDemo() {
  return (
    <Teleport to={document.body}>
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
    </Teleport>
  )
}
export default defineComponent(
  () => {
    const open = shallowRef(false)
    // const open1 = shallowRef(false)
    // const open2 = shallowRef(false)
    // const open3 = shallowRef(false)
    return () => {
      return (
        <>
          <style innerHTML="body{ overflow-x: hidden;}" />
          <Trigger
            arrow
            popupVisible={true}
            onOpenChange={(next) => {
              console.log('Visible Change:', next)
              // setOpen(next);
              open.value = next
            }}
            popupMotion={{
              name: 'vc-trigger-popup-zoom',
            }}
            popup={(
              <div
                style={{
                  background: 'yellow',
                  border: '1px solid blue',
                  width: `${200}px`,
                  height: `${60}px`,
                  opacity: 0.9,
                }}
              >
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
            // popupVisible
            popupStyle={{ boxShadow: '0 0 5px red' }}
            popupAlign={{
              points: ['tc', 'bc'],
              overflow: {
                shiftX: 50,
                adjustY: true,
              },
              htmlRegion: 'scroll',
            }}
          >
            <button
              disabled
              style={{
              // background: 'green',
              // color: '#FFF',
                paddingBlock: `${30}px`,
                paddingInline: `${70}px`,
                opacity: 0.9,
                transform: 'scale(0.6)',
                display: 'inline-block',
              }}
            >
              Button Target
            </button>
          </Trigger>
        </>

      )
    }
  },
)
