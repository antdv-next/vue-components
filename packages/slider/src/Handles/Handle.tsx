import type { CSSProperties, PropType } from 'vue'
import type { OnStartMove, SliderClassNames, SliderStyles } from '../interface'
import KeyCode from '@v-c/util/dist/KeyCode'
import cls from 'classnames'
import { defineComponent, ref } from 'vue'
import { useInjectSlider } from '../context'
import { getDirectionStyle, getIndex } from '../util'

export default defineComponent({
  name: 'Handle',
  props: {
    prefixCls: { type: String, required: true },
    value: { type: Number, required: true },
    valueIndex: { type: Number, required: true },
    dragging: { type: Boolean, default: false },
    draggingDelete: { type: Boolean, default: false },
    onStartMove: { type: Function as PropType<OnStartMove>, required: true },
    onDelete: { type: Function as PropType<(index: number) => void>, required: true },
    onOffsetChange: { type: Function as PropType<(value: number | 'min' | 'max', valueIndex: number) => void>, required: true },
    onFocus: { type: Function as PropType<(e: FocusEvent, index: number) => void>, required: true },
    onMouseenter: { type: Function as PropType<(e: MouseEvent, index: number) => void>, required: true },
    render: Function,
    onChangeComplete: Function as PropType<() => void>,
    mock: Boolean,
    classNames: Object as PropType<SliderClassNames>,
    styles: Object as PropType<SliderStyles>,
  },
  emits: ['focus', 'mouseenter', 'startMove', 'delete', 'offsetChange', 'changeComplete'],
  setup(props, { attrs, emit, expose }) {
    const {
      min,
      max,
      direction,
      disabled,
      keyboard,
      range,
      tabIndex,
      ariaLabelForHandle,
      ariaLabelledByForHandle,
      ariaRequired,
      ariaValueTextFormatterForHandle,
    } = useInjectSlider()

    const divProps = ref({})
    const handleClass = ref({})
    const handleStyle = ref({})

    // ============================ Events ============================
    const onInternalStartMove = (e: MouseEvent | TouchEvent) => {
      console.log('emit-start')
      if (!disabled) {
        emit('startMove', e, props.valueIndex)
      }
    }

    const onInternalFocus = (e: FocusEvent) => {
      console.log('emit-focus')
      emit('focus', e, props.valueIndex)
    }

    const onInternalMouseEnter = (e: MouseEvent) => {
      console.log('emit-enter')
      emit('mouseenter', e, props.valueIndex)
    }

    // =========================== Keyboard ===========================
    const onKeyDown = (e: KeyboardEvent) => {
      if (!disabled && keyboard) {
        let offset: number | 'min' | 'max' | null = null

        // Change the value
        switch (e.which || e.keyCode) {
          case KeyCode.LEFT:
            offset = direction.value === 'ltr' || direction.value === 'btt' ? -1 : 1
            break

          case KeyCode.RIGHT:
            offset = direction.value === 'ltr' || direction.value === 'btt' ? 1 : -1
            break

          // Up is plus
          case KeyCode.UP:
            offset = direction.value !== 'ttb' ? 1 : -1
            break

          // Down is minus
          case KeyCode.DOWN:
            offset = direction.value !== 'ttb' ? -1 : 1
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
      focus: () => props.valueIndex,
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
      // ============================ Offset ============================
      const positionStyle = getDirectionStyle(direction.value, value, min.value, max.value)
      // ============================ Render ============================

      if (valueIndex !== null) {
        divProps.value = {
          'tabindex': disabled ? null : getIndex(tabIndex, valueIndex),
          'role': 'slider',
          'aria-valuemin': min.value,
          'aria-valuemax': max.value,
          'aria-valuenow': value,
          'aria-disabled': disabled,
          'aria-label': getIndex(ariaLabelForHandle, valueIndex),
          'aria-labelledby': getIndex(ariaLabelledByForHandle, valueIndex),
          'aria-required': getIndex(ariaRequired, valueIndex),
          'aria-valuetext': getIndex(ariaValueTextFormatterForHandle, valueIndex)?.(value),
          'aria-orientation': direction.value === 'ltr' || direction.value === 'rtl' ? 'horizontal' : 'vertical',
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
          [`${handlePrefixCls}-${valueIndex + 1}`]: valueIndex !== null && range,
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
        console.log('render', renderProps)
        const RenderNode = () => render(renderProps)
        return <RenderNode />
      }
      return handleNode
    }
  },
})
