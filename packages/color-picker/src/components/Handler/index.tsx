import type { PropType } from 'vue'
import type { AxisType } from './Input'
import { classNames, omit } from '@v-c/util'
import useMobile from '@v-c/util/dist/hooks/useMobile'
import { defineComponent, shallowRef, watch } from 'vue'
import renderInput from './Input'

// =========================== Constants ===========================
const VALUE_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]

// ============================= Types =============================
type HandlerSize = 'default' | 'small'

export interface HandlerAxis {
  'value': number
  'min'?: number
  'max'?: number
  'aria-label'?: string
  'aria-roledescription'?: string
  'aria-valuetext'?: string
  'onChange': (value: number) => void
  'onChangeComplete': (value: number) => void
}

export interface HandlerProps {
  size?: HandlerSize
  color?: string
  prefixCls?: string
  disabled?: boolean
  x?: HandlerAxis
  y?: HandlerAxis
}

// =================================================================
// ==                           Handler                           ==
// =================================================================
export default defineComponent({
  name: 'Handler',
  props: {
    size: String as PropType<HandlerSize>,
    color: String,
    prefixCls: String,
    disabled: Boolean,
    x: Object as PropType<HandlerAxis>,
    y: Object as PropType<HandlerAxis>,
  },
  inheritAttrs: false,
  setup(props) {
    // ============================ State =============================
    // Keep pending values until completion; controlled props may lag behind.
    // A null value means this axis has not changed in the current interaction.
    const pendingValues: Record<AxisType, number | null> = { x: null, y: null }
    const xInputRef = shallowRef<HTMLInputElement>()
    const yInputRef = shallowRef<HTMLInputElement>()

    const keyPressing = shallowRef(false)

    // Only the active axis is in the tab order; x is the initial axis.
    const activeAxis = shallowRef<AxisType | null>(null)

    const exposeBothAxes = useMobile()

    const getAxis = (axisName: AxisType) => (axisName === 'x' ? props.x : props.y)

    // ========================= Axis Helpers =========================
    const stepAxis = (axisName: AxisType, direction: 1 | -1) => {
      const axis = getAxis(axisName)
      if (!axis) {
        return
      }
      const min = Number(axis.min ?? 0)
      const max = Number(axis.max ?? 100)
      const current = pendingValues[axisName] ?? axis.value

      const next = Math.min(max, Math.max(min, Math.round(current) + direction))

      if (next === current) {
        return
      }
      pendingValues[axisName] = next
      axis.onChange(next)
    }

    // Clear both candidates before notifying consumers to avoid duplicate completion.
    const completeInteraction = () => {
      const xValue = pendingValues.x
      const yValue = pendingValues.y
      pendingValues.x = null
      pendingValues.y = null

      if (xValue !== null) {
        props.x?.onChangeComplete(xValue)
      }
      else if (yValue !== null) {
        props.y?.onChangeComplete(yValue)
      }
    }

    // ============================ Focus =============================
    watch(activeAxis, (axis) => {
      if (axis) {
        const input = axis === 'y' ? yInputRef.value : xInputRef.value
        input?.focus()
      }
    }, { flush: 'post' })

    // `focusout` bubbles (React's `onBlur`), so it covers both inputs.
    const onFocusout = (event: FocusEvent) => {
      const container = event.currentTarget as HTMLElement
      if (container.contains(event.relatedTarget as Node | null)) {
        return
      }
      keyPressing.value = false

      // Blur can interrupt a key press before keyup.
      completeInteraction()
    }

    // ======================= Keyboard Events ========================
    // Horizontal keys adjust x; vertical keys adjust y, or x for a single-axis slider.
    const onInputKeyDown = (event: KeyboardEvent) => {
      if (!VALUE_KEYS.includes(event.key)) {
        return
      }

      keyPressing.value = true

      switch (event.key) {
        case 'ArrowRight':
          activeAxis.value = 'x'
          stepAxis('x', 1)
          break
        case 'ArrowLeft':
          activeAxis.value = 'x'
          stepAxis('x', -1)
          break
        case 'ArrowUp':
          if (props.y) {
            activeAxis.value = 'y'
            stepAxis('y', 1)
          }
          else {
            activeAxis.value = 'x'
            stepAxis('x', 1)
          }
          break
        case 'ArrowDown':
          if (props.y) {
            activeAxis.value = 'y'
            stepAxis('y', -1)
          }
          else {
            activeAxis.value = 'x'
            stepAxis('x', -1)
          }
          break
        default:
          // Native range behavior handles Home/End/PageUp/PageDown.
          return
      }
      event.preventDefault()
    }

    const onInputKeyUp = (event: KeyboardEvent) => {
      if (!VALUE_KEYS.includes(event.key)) {
        return
      }
      keyPressing.value = false
      completeInteraction()
    }

    // ========================= Input Events =========================
    const onInputChange = (axisName: AxisType, event: Event) => {
      const axis = getAxis(axisName)
      if (!axis) {
        return
      }
      const next = Number((event.target as HTMLInputElement).value)

      if (keyPressing.value) {
        pendingValues[axisName] = next
        axis.onChange(next)
        return
      }

      // Assistive technology changes have no keyup, so complete them immediately.
      axis.onChange(next)
      axis.onChangeComplete(next)
    }

    const onInputFocus = (axisName: AxisType) => {
      activeAxis.value = axisName
    }

    return () => {
      const { size = 'default', color, prefixCls, disabled, x, y } = props

      // ======================== Accessibility =========================
      // Touch screen readers need both axes exposed without keyboard navigation.
      // Desktop keyboard interaction reveals both axes while a value key is held.
      const xActive = !activeAxis.value || activeAxis.value === 'x'
      const yActive = activeAxis.value === 'y'
      const revealBothAxes = exposeBothAxes.value || keyPressing.value

      const sharedInputAttrs = {
        disabled,
        onKeydown: onInputKeyDown,
        onKeyup: onInputKeyUp,
      }

      // ============================ Render ============================
      return (
        <div
          class={classNames(`${prefixCls}-handler`, {
            [`${prefixCls}-handler-sm`]: size === 'small',
          })}
          style={{ position: 'relative', backgroundColor: color }}
          onFocusout={onFocusout}
        >
          {x && renderInput({
            prefixCls,
            axisType: 'x',
            inputRef: (el: any) => {
              xInputRef.value = el
            },
            attrs: {
              ...omit(x, ['onChange', 'onChangeComplete']),
              ...sharedInputAttrs,
              'aria-orientation': 'horizontal',
              'tabindex': xActive ? 0 : -1,
              'aria-hidden': !xActive && !revealBothAxes,
            },
            onChange: onInputChange,
            onFocus: onInputFocus,
          })}
          {y && renderInput({
            prefixCls,
            axisType: 'y',
            inputRef: (el: any) => {
              yInputRef.value = el
            },
            attrs: {
              ...omit(y, ['onChange', 'onChangeComplete']),
              ...sharedInputAttrs,
              'aria-orientation': 'vertical',
              'tabindex': yActive ? 0 : -1,
              'aria-hidden': !yActive && !revealBothAxes,
            },
            onChange: onInputChange,
            onFocus: onInputFocus,
          })}
        </div>
      )
    }
  },
})
