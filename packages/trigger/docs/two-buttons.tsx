import { computed, defineComponent, ref } from 'vue'
import Trigger, { UniqueProvider } from '../src'
import './assets/index.less'

const LEAVE_DELAY = 0.2

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
}

const popupStyle = {
  border: '1px solid #ccc',
  padding: '10px',
  background: 'white',
  boxSizing: 'border-box' as const,
}

const popupMotion = {
  name: 'vc-trigger-popup-zoom',
}

export default defineComponent(() => {
  const useUniqueProvider = ref(true)
  const triggerControl = ref<'button1' | 'button2' | 'none'>('none')

  const visibleFor = (name: 'button1' | 'button2') => computed(() => {
    if (triggerControl.value === 'none') {
      return undefined
    }
    return triggerControl.value === name
  })

  const button1Visible = visibleFor('button1')
  const button2Visible = visibleFor('button2')

  const Wrapper = computed(() => (useUniqueProvider.value ? UniqueProvider : 'div'))

  return () => (
    <Wrapper.value>
      <div style={{ margin: '100px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <Trigger
            mouseLeaveDelay={LEAVE_DELAY}
            action={['hover']}
            popupPlacement="top"
            builtinPlacements={builtinPlacements as any}
            popupVisible={button1Visible.value as any}
            popupMotion={popupMotion as any}
            popupStyle={popupStyle}
            unique
            popup={() => <div>这是左侧按钮的提示信息</div>}
          >
            <button type="button">左侧按钮</button>
          </Trigger>

          <Trigger
            mouseLeaveDelay={LEAVE_DELAY}
            action={['hover']}
            popupPlacement="top"
            builtinPlacements={builtinPlacements as any}
            popupVisible={button2Visible.value as any}
            popupMotion={popupMotion as any}
            popupStyle={popupStyle}
            unique
            popup={() => <div>This is the tooltip for the right button</div>}
          >
            <button type="button">Right Button</button>
          </Trigger>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={useUniqueProvider.value}
              onChange={(event) => {
                useUniqueProvider.value = (event.target as HTMLInputElement).checked
              }}
            />
            使用 UniqueProvider
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span>Trigger 控制:</span>
          {[
            { value: 'button1', label: 'Button 1 显示 Trigger' },
            { value: 'button2', label: 'Button 2 显示 Trigger' },
            { value: 'none', label: '都不受控 (Hover 控制)' },
          ].map(option => (
            <label key={option.value} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                name="triggerControl"
                value={option.value}
                checked={triggerControl.value === option.value}
                onChange={(event) => {
                  triggerControl.value = (event.target as HTMLInputElement).value as typeof triggerControl.value
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </Wrapper.value>
  )
})
