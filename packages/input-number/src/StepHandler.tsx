import type { SlotsType } from 'vue'
import useMobile from '@v-c/util/dist/hooks/useMobile'
import raf from '@v-c/util/dist/raf'
import { classNames as cls } from '@v-c/util'
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
  upNode?: any
  downNode?: any
  upDisabled?: boolean
  downDisabled?: boolean
  onStep: (up: boolean, emitter: 'handler' | 'keyboard' | 'wheel') => void
  classNames?: { actions?: string }
  styles?: { actions?: any }
}

export default defineComponent({
  name: 'StepHandler',
  props: {
    prefixCls: { type: String, required: true },
    upDisabled: { type: Boolean, default: false },
    downDisabled: { type: Boolean, default: false },
    onStep: { type: Function, required: true },
    classNames: { type: Object, default: () => ({}) },
    styles: { type: Object, default: () => ({}) },
  },
  slots: Object as SlotsType<{
    upNode?: any
    downNode?: any
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

    // ======================= Render =======================
    const isMobile = useMobile()

    // fix: https://github.com/ant-design/ant-design/issues/43088
    // In Safari, When we fire onmousedown and onmouseup events in quick succession,
    // there may be a problem that the onmouseup events are executed first,
    // resulting in a disordered program execution.
    // So, we need to use requestAnimationFrame to ensure that the onmouseup event is executed after the onmousedown event.
    const safeOnStopStep = () => frameIds.value.push(raf(onStopStep))
    return () => {
      if (isMobile.value) {
        return null
      }

      const { prefixCls, upDisabled, downDisabled } = props

      const handlerClassName = `${prefixCls}-handler`

      const upClassName = cls(handlerClassName, `${handlerClassName}-up`, {
        [`${handlerClassName}-up-disabled`]: upDisabled,
      })

      const downClassName = cls(handlerClassName, `${handlerClassName}-down`, {
        [`${handlerClassName}-down-disabled`]: downDisabled,
      })

      const sharedHandlerProps = {
        unselectable: 'on' as const,
        role: 'button',
        onMouseup: safeOnStopStep,
        onMouseleave: safeOnStopStep,
      }
      return (
        <div class={cls(`${handlerClassName}-wrap`)}>
          <span
            {...sharedHandlerProps}
            onMousedown={(e: MouseEvent) => onStepMouseDown(e, true)}
            aria-label="Increase Value"
            aria-disabled={upDisabled}
            class={upClassName}
          >
            {slots.upNode?.() || <span unselectable="on" class={`${prefixCls}-handler-up-inner`} />}
          </span>
          <span
            {...sharedHandlerProps}
            onMousedown={(e: MouseEvent) => onStepMouseDown(e, false)}
            aria-label="Decrease Value"
            aria-disabled={downDisabled}
            class={downClassName}
          >
            {slots.downNode?.() || <span unselectable="on" class={`${prefixCls}-handler-down-inner`} />}
          </span>
        </div>
      )
    }
  },
})
