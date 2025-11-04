import type { ActionType } from '@v-c/trigger'
import type { CSSProperties } from 'vue'
import { computed, defineComponent, reactive } from 'vue'
import Tooltip from '../src'
import placements from '../src/placements'
import './assets/bootstrap.less'

interface DestroyOption {
  name: string
  value: number
}

const destroyTooltipOptions: DestroyOption[] = [
  {
    name: 'don\'t destroy',
    value: 0,
  },
  {
    name: 'destroy parent',
    value: 1,
  },
  {
    name: 'keep parent',
    value: 2,
  },
]

const destroyOnHiddenPresets = [
  false,
  { keepParent: false },
  { keepParent: true },
] as const

export default defineComponent(() => {
  const state = reactive({
    destroyOnHidden: destroyOnHiddenPresets[0] as boolean | { keepParent: boolean },
    placement: 'right',
    transitionName: 'vc-tooltip-zoom',
    trigger: {
      hover: 1,
      click: 0,
      focus: 0,
    } as Record<ActionType, number>,
    offsetX: placements.right?.offset?.[0],
    offsetY: placements.right?.offset?.[1],
    overlayInnerStyle: undefined as CSSProperties | undefined,
  })

  const triggerActions = computed<ActionType[]>(() => Object.keys(state.trigger) as ActionType[])

  const onPlacementChange = (event: Event) => {
    const select = event.target as HTMLSelectElement
    const placement = select.value
    const placementConfig = (placements as Record<string, typeof placements.right>)[placement]
    state.placement = placement
    state.offsetX = placementConfig?.offset?.[0]
    state.offsetY = placementConfig?.offset?.[1]
  }

  const onTransitionChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    state.transitionName = input.checked ? input.value : ''
  }

  const onTriggerChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const action = input.value as ActionType
    if (input.checked) {
      state.trigger[action] = 1
    }
    else {
      delete state.trigger[action]
    }
  }

  const onOffsetXChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    state.offsetX = input.value || undefined
  }

  const onOffsetYChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    state.offsetY = input.value || undefined
  }

  const onVisibleChange = (visible: boolean) => {
    console.log('tooltip', visible)
  }

  const onDestroyChange = (event: Event) => {
    const select = event.target as HTMLSelectElement
    const value = Number(select.value)
    state.destroyOnHidden = destroyOnHiddenPresets[value]
  }

  const onOverlayInnerStyleChange = () => {
    state.overlayInnerStyle = state.overlayInnerStyle ? undefined : { background: 'red' }
  }

  return () => (
    <div>
      <div
        style={{
          margin: '10px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>placement:</span>
          <select value={state.placement} onChange={onPlacementChange}>
            {Object.keys(placements).map(placement => (
              <option key={placement} value={placement}>
                {placement}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <input
            value="vc-tooltip-zoom"
            type="checkbox"
            onChange={onTransitionChange}
            checked={state.transitionName === 'vc-tooltip-zoom'}
          />
          <span>transitionName</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>destroyOnHidden:</span>
          <select onChange={onDestroyChange}>
            {destroyTooltipOptions.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <span>trigger:</span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <input
            value="hover"
            checked={!!state.trigger.hover}
            type="checkbox"
            onChange={onTriggerChange}
          />
          <span>hover</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <input
            value="focus"
            checked={!!state.trigger.focus}
            type="checkbox"
            onChange={onTriggerChange}
          />
          <span>focus</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <input
            value="click"
            checked={!!state.trigger.click}
            type="checkbox"
            onChange={onTriggerChange}
          />
          <span>click</span>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>offsetX:</span>
          <input
            type="text"
            value={state.offsetX ?? ''}
            onChange={onOffsetXChange}
            style={{ width: '50px' }}
          />
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>offsetY:</span>
          <input
            type="text"
            value={state.offsetY ?? ''}
            onChange={onOffsetYChange}
            style={{ width: '50px' }}
          />
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <input
            value="overlayInnerStyle"
            checked={!!state.overlayInnerStyle}
            type="checkbox"
            onChange={onOverlayInnerStyleChange}
          />
          <span>overlayInnerStyle(red background)</span>
        </label>
      </div>
      <div style={{ margin: '100px' }}>
        <Tooltip
          placement={state.placement}
          mouseEnterDelay={0}
          mouseLeaveDelay={0.1}
          destroyOnHidden={state.destroyOnHidden as any}
          trigger={triggerActions.value}
          onVisibleChange={onVisibleChange}
          overlay={<div style={{ height: '50px', width: '50px' }}>i am a tooltip</div>}
          align={{
            offset: [state.offsetX, state.offsetY],
          }}
          motion={{ motionName: state.transitionName }}
          styles={{ container: state.overlayInnerStyle }}
        >
          <div style={{ height: '100px', width: '100px', border: '1px solid red' }}>trigger</div>
        </Tooltip>
      </div>
    </div>
  )
})
