import { defineComponent, ref, Teleport } from 'vue'
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
}

const OuterContent = defineComponent<{ getContainer: () => HTMLElement | null }>((props) => {
  return () => (
    <Teleport to={props.getContainer() || document.body}>
      <div>
        I am outer content
        <button
          type="button"
          onMousedown={(event) => {
            event.stopPropagation()
          }}
        >
          Stop Pop
        </button>
      </div>
    </Teleport>
  )
})

export default defineComponent(() => {
  const containerRef = ref<HTMLElement | null>(null)
  const outerDivRef = ref<HTMLDivElement | null>(null)

  const innerTrigger = () => (
    <div style={popupBorderStyle}>
      <div ref={containerRef} />
      <Trigger
        popupPlacement="bottom"
        action={['click']}
        builtinPlacements={builtinPlacements}
        getPopupContainer={() => containerRef.value as HTMLElement}
        popup={() => <div style={popupBorderStyle}>I am inner Trigger Popup</div>}
      >
        <span style={{ margin: '20px' }}>clickToShowInnerTrigger</span>
      </Trigger>
    </div>
  )

  return () => (
    <div style={{ margin: '200px' }}>
      <div>
        <Trigger
          popupPlacement="left"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popup={() => (
            <div style={popupBorderStyle}>
              i am a click popup
              <OuterContent getContainer={() => outerDivRef.value} />
            </div>
          )}
        >
          <span>
            <Trigger
              popupPlacement="bottom"
              action={['hover']}
              builtinPlacements={builtinPlacements}
              popup={() => <div style={popupBorderStyle}>i am a hover popup</div>}
            >
              <span style={{ margin: '20px' }}>trigger</span>
            </Trigger>
          </span>
        </Trigger>
      </div>
      <div style={{ margin: '50px' }}>
        <Trigger
          popupPlacement="right"
          action={['hover']}
          builtinPlacements={builtinPlacements}
          popup={innerTrigger}
        >
          <span style={{ margin: '20px' }}>trigger</span>
        </Trigger>
      </div>

      <div
        ref={outerDivRef}
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: '200px',
          height: '200px',
          background: 'red',
        }}
      />
    </div>
  )
})
