import type { PropType } from 'vue'
import type { Color } from '../color'
import type { BaseColorPickerProps, ColorPickerLocale, TransformOffset } from '../interface'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import { defineComponent, ref } from 'vue'
import useColorDrag from '../hooks/useColorDrag'

import { calcOffset, calculateColor, generateColor, mergeLocale } from '../util'
import Handler from './Handler'
import Palette from './Palette'
import Transform from './Transform'

export type PickerProps = BaseColorPickerProps

export default defineComponent({
  name: 'Picker',
  props: {
    color: {
      type: Object as PropType<PickerProps['color']>,
      required: true,
    },
    prefixCls: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    locale: Object as PropType<ColorPickerLocale>,
    onChange: Function,
    onChangeComplete: Function,
  },
  setup(props, { emit }) {
    // ============================ State =============================
    const pickerRef = ref()
    const transformRef = ref()
    // Pending color during an interaction; null restores the controlled value.
    let pendingColor: Color | null = null

    // ============================ Color =============================
    const getLatestColor = () => pendingColor ?? props.color

    const completeColor = () => {
      const latest = getLatestColor()
      pendingColor = null
      emit('changeComplete', latest)
    }

    // ============================= Drag =============================
    const onDragChange = useEvent((offsetValue: TransformOffset) => {
      const calcColor = calculateColor({
        offset: offsetValue,
        targetRef: transformRef,
        containerRef: pickerRef,
        color: props.color,
      })
      pendingColor = calcColor
      emit('change', calcColor)
    })

    const [offset, dragStartHandle] = useColorDrag({
      color: () => props.color,
      containerRef: pickerRef,
      targetRef: transformRef,
      calculate: () => calcOffset(props.color),
      onDragChange,
      onDragChangeComplete: completeColor,
      disabledDrag: () => props.disabled,
    })

    // =========================== Keyboard ===========================
    // Preserve both axes when key presses precede the parent's next render.
    const changeColor = (channel: 's' | 'b', percent: number) => {
      const next = generateColor({
        ...getLatestColor().toHsb(),
        [channel]: percent / 100,
      })
      pendingColor = next
      emit('change', next)
    }

    // ============================ Render ============================
    return () => {
      const {
        color,
        prefixCls,
        disabled,
      } = props
      // Fall back to the default labels when `Picker` is used on its own.
      const locale = mergeLocale(props.locale)
      const hsb = color.toHsb()
      const saturation = Math.round(hsb.s * 100)
      const brightness = Math.round(hsb.b * 100)

      return (
        <div
          ref={pickerRef}
          class={`${prefixCls}-select`}
          onMousedown={dragStartHandle}
          onTouchstart={dragStartHandle}
        >
          <Palette prefixCls={prefixCls}>
            <Transform x={offset.value.x} y={offset.value.y} ref={transformRef}>
              <Handler
                color={color.toRgbString()}
                prefixCls={prefixCls}
                disabled={disabled}
                x={{
                  'aria-label': locale.picker,
                  'aria-roledescription': locale.pickerDescription,
                  'aria-valuetext': `${locale.saturation}: ${saturation}%`,
                  'value': saturation,
                  'onChange': (percent: number) => changeColor('s', percent),
                  'onChangeComplete': completeColor,
                }}
                y={{
                  'aria-label': locale.picker,
                  'aria-roledescription': locale.pickerDescription,
                  'aria-valuetext': `${locale.brightness}: ${brightness}%`,
                  'value': brightness,
                  'onChange': (percent: number) => changeColor('b', percent),
                  'onChangeComplete': completeColor,
                }}
              />
            </Transform>
            <div
              class={`${prefixCls}-saturation`}
              style={{
                backgroundColor: `hsl(${hsb.h},100%, 50%)`,
                backgroundImage: 'linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))',
              }}
            />
          </Palette>
        </div>
      )
    }
  },
})
