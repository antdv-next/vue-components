import type { SlotsType } from 'vue'
import { classNames as clsx } from '@v-c/util'
import raf from '@v-c/util/dist/raf'
import { defineComponent, onUnmounted, ref } from 'vue'

/**
 * When click and hold on a button - the speed of auto changing the value.
 */
const STEP_INTERVAL = 200

/**
 * When click and hold on a button - the delay before auto changing the value.
 */
const STEP_DELAY = 600

export interface StepHandlerProps {
  prefixCls: string
  action: 'up' | 'down'
  disabled?: boolean
  className?: string
  style?: any
  onStep: (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => void
}

export default defineComponent({
  name: 'StepHandler',
  props: {
    prefixCls: { type: String, required: true },
    action: { type: String as () => 'up' | 'down', required: true },
    disabled: { type: Boolean, default: false },
    className: String,
    style: Object,
    onStep: { type: Function, required: true },
  },
  slots: Object as SlotsType<{
    default?: any
  }>,
  emits: ['step'],
  setup(props, { slots, emit }) {
    // ======================== Step ========================
    const stepTimeoutRef = ref<any>(null)
    const frameIds = ref<number[]>([])

    const onStopStep = () => {
      clearTimeout(stepTimeoutRef.value)
    }

    // We will interval update step when hold mouse down
    const onStepMouseDown = (e: MouseEvent, up: boolean) => {
      e.preventDefault()
      onStopStep()

      emit('step', up, 'handler')

      // Loop step for interval
      function loopStep() {
        emit('step', up, 'handler')
        stepTimeoutRef.value = setTimeout(loopStep, STEP_INTERVAL)
      }

      // First time press will wait some time to trigger loop step update
      stepTimeoutRef.value = setTimeout(loopStep, STEP_DELAY)
    }

    onUnmounted(() => {
      onStopStep()
      frameIds.value.forEach(id => raf.cancel(id))
    })

    return () => {
      const { prefixCls, action, disabled, className, style } = props
      const isUpAction = action === 'up'

      const actionClassName = `${prefixCls}-action`
      const mergedClassName = clsx(
        actionClassName,
        `${actionClassName}-${action}`,
        {
          [`${actionClassName}-${action}-disabled`]: disabled,
        },
        className,
      )

      // fix: https://github.com/ant-design/ant-design/issues/43088
      // In Safari, When we fire onmousedown and onmouseup events in quick succession,
      // there may be a problem that the onmouseup events are executed first,
      // resulting in a disordered program execution.
      // So, we need to use requestAnimationFrame to ensure that the onmouseup event is executed after the onmousedown event.
      const safeOnStopStep = () => frameIds.value.push(raf(onStopStep))

      return (
        <span
          unselectable="on"
          role="button"
          onMouseup={safeOnStopStep}
          onMouseleave={safeOnStopStep}
          onMousedown={(e: MouseEvent) => onStepMouseDown(e, isUpAction)}
          aria-label={isUpAction ? 'Increase Value' : 'Decrease Value'}
          aria-disabled={disabled}
          class={mergedClassName}
          style={style}
        >
          {slots.default?.() || (
            <span unselectable="on" class={`${prefixCls}-action-${action}-inner`} />
          )}
        </span>
      )
    }
  },
})
