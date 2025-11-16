import type { CSSProperties, PropType, SlotsType } from 'vue'
import type { OnStartMove } from '../interface'
import { defineComponent, ref } from 'vue'
import { getIndex } from '../util'
import Handle from './Handle'

export interface RenderProps {
  index: number
  prefixCls: string
  value: number
  dragging: boolean
  draggingDelete: boolean
  node: any
}
export interface HandlesRef {
  focus: (index: number) => void
  hideHelp: VoidFunction
}

export default defineComponent({
  name: 'Handles',
  props: {
    prefixCls: { type: String, required: true },
    values: { type: Array, required: true },
    handleStyle: { type: [Object, Array] as PropType<CSSProperties | CSSProperties[]> },
    onStartMove: { type: Function as PropType<OnStartMove>, required: true },
    onOffsetChange: { type: Function as PropType<(value: number | 'min' | 'max', valueIndex: number) => void>, required: true },
    onFocus: { type: Function as PropType<(e: FocusEvent) => void> },
    onBlur: { type: Function as PropType<(e: FocusEvent) => void> },
    onDelete: { type: Function as PropType<(index: number) => void>, required: true },
    handleRender: { type: Function as PropType<(props: RenderProps) => any> },
    activeHandleRender: { type: Function as PropType<(props: RenderProps) => any> },
    draggingIndex: { type: Number, default: -1 },
    draggingDelete: { type: Boolean, default: false },
    onChangeComplete: Function as PropType<() => void>,
  },
  emits: ['focus'],
  slots: Object as SlotsType<{
    activeHandleRender: any
    handleRender: any
  }>,
  setup(props, { emit, expose }) {
    const handlesRef = ref()

    // =========================== Active ===========================
    const activeVisible = ref(false)
    const activeIndex = ref(-1)

    const onActive = (index: number) => {
      activeIndex.value = index
      activeVisible.value = true
    }

    const onHandleFocus = (e: FocusEvent, index: number) => {
      onActive(index)
      emit('focus', e)
    }

    const onHandleMouseEnter = (_e: MouseEvent, index: number) => {
      onActive(index)
    }

    expose({
      focus: () => handlesRef.value?.focus(),
      hideHelp: () => {
        activeVisible.value = false
      },
    })

    return () => {
      const {
        prefixCls,
        onStartMove,
        onOffsetChange,
        values,
        handleRender,
        activeHandleRender,
        draggingIndex,
        draggingDelete,
        onFocus,
        handleStyle,
        ...restProps
      } = props

      // =========================== Render ===========================
      // Handle Props
      const handleProps = {
        prefixCls,
        onStartMove,
        onOffsetChange,
        render: handleRender,
        onFocus: onHandleFocus,
        onMouseenter: onHandleMouseEnter,
        ...restProps,
      }
      return (
        <>
          {values?.map((value: unknown, index: number) => {
            const dragging = draggingIndex === index
            return (
              <Handle
                ref={handlesRef.value}
                dragging={dragging}
                draggingDelete={dragging && draggingDelete}
                style={getIndex(handleStyle, index)}
                key={index}
                value={value as number}
                valueIndex={index}
                {...handleProps}
              />
            )
          })}

          {/* Used for render tooltip, this is not a real handle */}
          {activeHandleRender && activeVisible.value && (
            <Handle
              key="a11y"
              {...handleProps}
              value={values[activeIndex.value] as number}
              valueIndex={1}
              dragging={draggingIndex !== -1}
              draggingDelete={draggingDelete}
              render={activeHandleRender}
              style={{ pointerEvents: 'none' }}
              aria-hidden
            />
          )}
        </>
      )
    }
  },
})
