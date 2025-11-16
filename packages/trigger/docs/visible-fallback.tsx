import type { TriggerRef } from '../src'
import { computed, defineComponent, ref } from 'vue'
import Trigger from '../src'
import './assets/index.less'

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    htmlRegion: 'visibleFirst' as const,
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    htmlRegion: 'visibleFirst' as const,
  },
}

export default defineComponent(() => {
  const enoughTop = ref(true)
  const triggerRef = ref<TriggerRef>()

  const dynamicTop = computed(() => (enoughTop.value ? '200px' : '90px'))

  const placement = computed(() => (enoughTop.value ? 'bottom' : 'top'))

  const forceAlign = () => {
    triggerRef.value?.forceAlign?.()
  }

  return () => (
    <div>
      <p>`visibleFirst` should not show in hidden region if still scrollable</p>

      <label>
        <input
          type="checkbox"
          checked={enoughTop.value}
          onChange={() => {
            enoughTop.value = !enoughTop.value
            requestAnimationFrame(forceAlign)
          }}
        />
        Enough Top (Placement: bottom)
      </label>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 'calc(100vh - 100px - 90px - 50px)',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 1px blue',
          overflow: 'hidden',
          width: '500px',
          height: '1000px',
        }}
      >
        <Trigger
          ref={triggerRef as any}
          arrow
          action="click"
          popupVisible
          getPopupContainer={node => node?.parentNode as HTMLElement}
          popupStyle={{ boxShadow: '0 0 5px red' }}
          popupPlacement={placement.value as any}
          builtinPlacements={builtinPlacements}
          stretch="minWidth"
          popup={() => (
            <div
              style={{
                background: 'yellow',
                border: '1px solid blue',
                width: '300px',
                height: '100px',
                opacity: 0.9,
                boxSizing: 'border-box',
              }}
            >
              Should Always place bottom
            </div>
          )}
        >
          <span
            style={{
              background: 'green',
              color: '#FFF',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100px',
              height: '100px',
              position: 'absolute',
              left: '50%',
              top: dynamicTop.value,
              transform: 'translateX(-50%)',
            }}
          >
            Target
          </span>
        </Trigger>
      </div>
    </div>
  )
})
