import { computed, defineComponent, reactive } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
    offset: [-10, 0],
  },
  right: {
    points: ['cl', 'cr'],
    offset: [10, 0],
  },
  top: {
    points: ['bc', 'tc'],
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    offset: [0, 10],
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -10],
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -10],
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 10],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 10],
  },
}

const getPopupContainer = (trigger: HTMLElement) => trigger.parentNode as HTMLElement

const InnerTarget = defineComponent((_, { attrs }) => {
  return () => (
    <div
      style={{
        margin: 20,
        display: 'inline-block',
        background: 'rgba(255, 0, 0, 0.05)',
      }}
      tabIndex={0}
      role="button"
      {...attrs}
    >
      <p>This is a example of trigger usage.</p>
      <p>You can adjust the value above</p>
      <p>which will also change the behaviour of popup.</p>
    </div>
  )
})

export default defineComponent(() => {
  const state = reactive({
    mask: false,
    maskClosable: true,
    placement: 'bottom',
    trigger: {
      click: true,
    } as Record<string, boolean>,
    offsetX: undefined as string | undefined,
    offsetY: undefined as string | undefined,
    stretch: 'minWidth' as '' | 'width' | 'height' | 'minWidth' | 'minHeight',
    transitionName: 'vc-trigger-popup-zoom',
    destroyed: false,
    destroyPopupOnHide: false,
    autoDestroy: false,
    mobile: false,
  })

  const popupAlign = computed(() => ({
    offset: [state.offsetX, state.offsetY],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  }))

  const actions = computed(() => Object.keys(state.trigger))

  const mobileConfig = computed(() => (state.mobile
    ? {
        mask: true,
        motion: { name: 'vc-trigger-popup-zoom' },
        maskMotion: { name: 'vc-trigger-mask-fade' },
      }
    : undefined))

  const preventDefault = (event: MouseEvent) => {
    event.preventDefault()
  }

  if (state.destroyed) {
    return () => null
  }

  return () => (
    <div>
      <div style={{ margin: '10px 20px' }}>
        <label>
          placement:
          <select
            value={state.placement}
            onChange={(event) => {
              state.placement = (event.target as HTMLSelectElement).value
            }}
          >
            {['right', 'left', 'top', 'bottom', 'topLeft', 'topRight', 'bottomRight', 'bottomLeft'].map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          Stretch:
          <select
            value={state.stretch}
            onChange={(event) => {
              const value = (event.target as HTMLSelectElement).value
              state.stretch = value as any
            }}
          >
            <option value="">--NONE--</option>
            <option value="width">width</option>
            <option value="minWidth">minWidth</option>
            <option value="height">height</option>
            <option value="minHeight">minHeight</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            value="vc-trigger-popup-zoom"
            type="checkbox"
            checked={state.transitionName === 'vc-trigger-popup-zoom'}
            onChange={(event) => {
              state.transitionName = (event.target as HTMLInputElement).checked ? 'vc-trigger-popup-zoom' : ''
            }}
          />
          transitionName
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp; trigger:
        {['hover', 'focus', 'click', 'contextMenu'].map(name => (
          <label key={name}>
            <input
              value={name}
              type="checkbox"
              checked={!!state.trigger[name]}
              onChange={(event) => {
                const target = event.target as HTMLInputElement
                const next = { ...state.trigger }
                if (target.checked) {
                  next[name] = true
                }
                else {
                  delete next[name]
                }
                state.trigger = next
              }}
            />
            {name}
          </label>
        ))}
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            type="checkbox"
            checked={state.destroyPopupOnHide}
            onChange={(event) => {
              state.destroyPopupOnHide = (event.target as HTMLInputElement).checked
            }}
          />
          destroyPopupOnHide
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            type="checkbox"
            checked={state.autoDestroy}
            onChange={(event) => {
              state.autoDestroy = (event.target as HTMLInputElement).checked
            }}
          />
          autoDestroy
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            type="checkbox"
            checked={state.mask}
            onChange={(event) => {
              state.mask = (event.target as HTMLInputElement).checked
            }}
          />
          mask
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            type="checkbox"
            checked={state.maskClosable}
            onChange={(event) => {
              state.maskClosable = (event.target as HTMLInputElement).checked
            }}
          />
          maskClosable
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            type="checkbox"
            checked={state.mobile}
            onChange={() => {
              state.mobile = !state.mobile
            }}
          />
          mobile
        </label>
        <br />
        <label>
          offsetX:
          <input
            type="text"
            style={{ width: '50px' }}
            value={state.offsetX ?? ''}
            onChange={(event) => {
              const value = (event.target as HTMLInputElement).value
              state.offsetX = value || undefined
            }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          offsetY:
          <input
            type="text"
            style={{ width: '50px' }}
            value={state.offsetY ?? ''}
            onChange={(event) => {
              const value = (event.target as HTMLInputElement).value
              state.offsetY = value || undefined
            }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button
          type="button"
          onClick={() => {
            state.destroyed = true
          }}
        >
          destroy
        </button>
      </div>

      <div style={{ margin: '120px', position: 'relative' }}>
        <Trigger
          getPopupContainer={getPopupContainer}
          popupAlign={popupAlign.value}
          popupPlacement={state.placement as any}
          autoDestroy={state.autoDestroy}
          destroyPopupOnHide={state.destroyPopupOnHide}
          mask={state.mask}
          maskClosable={state.maskClosable}
          maskMotion={{ name: 'vc-trigger-mask-fade' }}
          stretch={state.stretch || undefined}
          action={actions.value as any}
          builtinPlacements={builtinPlacements}
          arrow
          popupStyle={{
            border: '1px solid red',
            padding: '10px',
            background: 'white',
            boxSizing: 'border-box',
          }}
          popup={() => <div>i am a popup</div>}
          popupMotion={{ name: state.transitionName }}
          mobile={mobileConfig.value as any}
          onAfterOpenChange={(visible: boolean) => {
            console.log('tooltip', visible)
          }}
        >
          <InnerTarget onClick={preventDefault} />
        </Trigger>
      </div>
    </div>
  )
})
