import type { PropType } from 'vue'
import type { BaseColorPickerProps, TransformOffset } from '../interface'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import { defineComponent, ref } from 'vue'
import useColorDrag from '../hooks/useColorDrag'

import { calcOffset, calculateColor } from '../util'
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
    onChange: Function,
    onChangeComplete: Function,
  },
  setup(props, { emit }) {
    const pickerRef = ref()
    const transformRef = ref()
    const colorRef = ref(props.color)

    const onDragChange = useEvent((offsetValue: TransformOffset) => {
      const calcColor = calculateColor({
        offset: offsetValue,
        targetRef: transformRef,
        containerRef: pickerRef,
        color: props.color,
      })
      colorRef.value = calcColor
      emit('change', calcColor)
    })

    const [offset, dragStartHandle] = useColorDrag({
      color: props.color,
      containerRef: pickerRef,
      targetRef: transformRef,
      calculate: () => calcOffset(props.color),
      onDragChange,
      onDragChangeComplete: () => emit('changeComplete', colorRef.value),
      disabledDrag: props.disabled,
    })
    return () => {
      const {
        color,
        prefixCls,
      } = props
      return (
        <div
          ref={pickerRef}
          class={`${prefixCls}-select`}
          onMousedown={dragStartHandle}
          onTouchstart={dragStartHandle}
        >
          <Palette prefixCls={prefixCls}>
            <Transform x={offset.value.x} y={offset.value.y} ref={transformRef}>
              <Handler color={color.toRgbString()} prefixCls={prefixCls} />
            </Transform>
            <div
              class={`${prefixCls}-saturation`}
              style={{
                backgroundColor: `hsl(${color.toHsb().h},100%, 50%)`,
                backgroundImage: 'linear-gradient(0deg, #000, transparent),linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))',
              }}
            />
          </Palette>
        </div>
      )
    }
  },
})
