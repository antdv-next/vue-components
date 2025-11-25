import type { CSSProperties, PropType } from 'vue'
import type { OnStartMove, SliderClassNames, SliderStyles } from '../interface'
import { classNames as cls } from '@v-c/util'
import KeyCode from '@v-c/util/dist/KeyCode'
import { defineComponent, ref } from 'vue'
import { useInjectSlider } from '../context'
import { getDirectionStyle, getIndex } from '../util'

export interface RenderProps {
  index: number | null
  prefixCls: string
  value: number
  dragging: boolean
  draggingDelete: boolean
  node: any
}

export default defineComponent({
  name: 'Handle',
  props: {
    prefixCls: { type: String, required: true },
    value: { type: Number, required: true },
    valueIndex: { type: Number as PropType<number | null>, required: true },
    dragging: { type: Boolean, default: false },
    draggingDelete: { type: Boolean, default: false },
    onStartMove: { type: Function as PropType<OnStartMove>, required: true },
    onDelete: { type: Function as PropType<(index: number) => void>, required: true },
    onOffsetChange: { type: Function as PropType<(value: number | 'min' | 'max', valueIndex: number) => void>, required: true },
    onFocus: { type: Function as PropType<(e: FocusEvent, index: number) => void>, required: true },
    onMouseenter: { type: Function as PropType<(e: MouseEvent, index: number) => void>, required: true },
    render: { type: Function as PropType<(v: RenderProps) => any> },
    onChangeComplete: Function as PropType<() => void>,
    mock: Boolean,
    classNames: Object as PropType<SliderClassNames>,
    styles: Object as PropType<SliderStyles>,
  },
  emits: ['focus', 'mouseenter', 'startMove', 'delete', 'offsetChange', 'changeComplete'],
  setup(props, { attrs, emit, expose }) {
    const sliderContext = useInjectSlider()

    const divProps = ref({})
    const handleClass = ref({})
    const handleStyle = ref({})
    const handleNodeRef = ref<HTMLDivElement>()

    // ============================ Events ============================
    const onInternalStartMove = (e: MouseEvent | TouchEvent) => {
      const disabled = sliderContext.value.disabled
      if (!disabled) {
        emit('startMove', e, props.valueIndex)
      }
    }

    const onInternalFocus = (e: FocusEvent) => {
      emit('focus', e, props.valueIndex)
    }

    const onInternalMouseEnter = (e: MouseEvent) => {
      emit('mouseenter', e, props.valueIndex)
    }

    // =========================== Keyboard ===========================
    const onKeyDown = (e: KeyboardEvent) => {
      const { keyboard, direction, disabled } = sliderContext.value
      if (!disabled && keyboard) {
        let offset: number | 'min' | 'max' | null = null

        // Change the value
        switch (e.which || e.keyCode) {
          case KeyCode.LEFT:
            offset = direction === 'ltr' || direction === 'btt' ? -1 : 1
            break

          case KeyCode.RIGHT:
            offset = direction === 'ltr' || direction === 'btt' ? 1 : -1
            break

          // Up is plus
          case KeyCode.UP:
            offset = direction !== 'ttb' ? 1 : -1
            break

          // Down is minus
          case KeyCode.DOWN:
            offset = direction !== 'ttb' ? -1 : 1
            break

          case KeyCode.HOME:
            offset = 'min'
            break

          case KeyCode.END:
            offset = 'max'
            break

          case KeyCode.PAGE_UP:
            offset = 2
            break

          case KeyCode.PAGE_DOWN:
            offset = -2
            break

          case KeyCode.BACKSPACE:
          case KeyCode.DELETE:
            emit('delete', e, props.valueIndex)
            break
        }

        if (offset !== null) {
          e.preventDefault()
          emit('offsetChange', offset, props.valueIndex)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.which || e.keyCode) {
        case KeyCode.LEFT:
        case KeyCode.RIGHT:
        case KeyCode.UP:
        case KeyCode.DOWN:
        case KeyCode.HOME:
        case KeyCode.END:
        case KeyCode.PAGE_UP:
        case KeyCode.PAGE_DOWN:
          emit('changeComplete')
          break
      }
    }
    expose({
      focus: () => {
        handleNodeRef.value?.focus()
      },
    })

    return () => {
      const {
        prefixCls,
        value,
        valueIndex,
        onStartMove,
        onDelete,
        render,
        dragging,
        draggingDelete,
        onOffsetChange,
        onChangeComplete,
        onFocus,
        onMouseenter,
        styles,
        classNames,
        ...restProps
      } = props

      const {
        min,
        max,
        direction,
        disabled,
        range,
        tabIndex,
        ariaLabelForHandle,
        ariaLabelledByForHandle,
        ariaRequired,
        ariaValueTextFormatterForHandle,
      } = sliderContext.value
      // ============================ Offset ============================
      const positionStyle = getDirectionStyle(direction, value, min, max)
      // ============================ Render ============================

      if (valueIndex !== null) {
        divProps.value = {
          'tabindex': disabled ? null : getIndex(tabIndex, valueIndex),
          'role': 'slider',
          'aria-valuemin': min,
          'aria-valuemax': max,
          'aria-valuenow': value,
          'aria-disabled': disabled,
          'aria-label': getIndex(ariaLabelForHandle, valueIndex),
          'aria-labelledby': getIndex(ariaLabelledByForHandle, valueIndex),
          'aria-required': getIndex(ariaRequired, valueIndex),
          'aria-valuetext': getIndex(ariaValueTextFormatterForHandle, valueIndex)?.(value),
          'aria-orientation': direction === 'ltr' || direction === 'rtl' ? 'horizontal' : 'vertical',
          'onMousedown': onInternalStartMove,
          'onTouchstart': onInternalStartMove,
          'onFocus': onInternalFocus,
          'onMouseenter': onInternalMouseEnter,
          'onKeydown': onKeyDown,
          'onKeyup': handleKeyUp,
          ...restProps,
        }
      }
      else {
        divProps.value = {
          ...restProps,
        }
      }
      const handlePrefixCls = `${prefixCls}-handle`
      handleClass.value = cls(
        handlePrefixCls,
        {
          [`${handlePrefixCls}-${valueIndex! + 1}`]: valueIndex !== null && range,
          [`${handlePrefixCls}-dragging`]: dragging,
          [`${handlePrefixCls}-dragging-delete`]: draggingDelete,
        },
        classNames?.handle,
      )
      handleStyle.value = {
        ...positionStyle,
        ...attrs.style as CSSProperties,
        ...styles?.handle,
      }
      const handleNode = (
        <div
          ref={handleNodeRef}
          class={handleClass.value}
          style={handleStyle.value}
          {...divProps.value}
        />
      )
      // Customize
      if (render) {
        const renderProps = {
          index: valueIndex,
          prefixCls,
          value,
          dragging,
          draggingDelete,
          node: handleNode,
        }

        const RenderNode = () => render(renderProps)
        return <RenderNode />
      }
      return handleNode
    }
  },
})
