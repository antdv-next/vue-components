import type { CSSProperties } from 'vue'
import type { TextAreaProps } from './interface'
import ResizeObserver from '@v-c/resize-observer'
import { clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
import raf from '@v-c/util/dist/raf'
import { computed, defineComponent, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import calculateAutoSizeStyle from './calculateNodeHeight'

const RESIZE_START = 0 as const
const RESIZE_MEASURING = 1 as const
const RESIZE_STABLE = 2 as const

type ResizeState
  = | typeof RESIZE_START
    | typeof RESIZE_MEASURING
    | typeof RESIZE_STABLE

const ResizableTextArea = defineComponent<
  TextAreaProps
>(
  (props, { expose, attrs }) => {
    // =============================== Value ================================
    const internalValue = ref(props?.value ?? props?.defaultValue ?? '')
    watch(
      () => props.value,
      () => {
        internalValue.value = props.value
      },
    )
    const mergedValue = computed(() => internalValue.value ?? '')

    const onInternalChange = (e: any) => {
      if (props.value === undefined) {
        internalValue.value = e.target.value
      }
      props?.onChange?.(e)
    }

    // ================================ Ref =================================
    const textareaRef = shallowRef<HTMLTextAreaElement>()
    expose({
      textArea: textareaRef,
    })

    // ============================== AutoSize ==============================
    const autoSizeData = computed(() => {
      const autoSize = props.autoSize
      if (autoSize && typeof autoSize === 'object') {
        return [autoSize.minRows, autoSize.maxRows]
      }

      return []
    })
    const minRows = computed(() => autoSizeData?.value?.[0])
    const maxRows = computed(() => autoSizeData?.value?.[1])

    // =============================== Resize ===============================
    const resizeState = ref<ResizeState>(RESIZE_STABLE)
    const autoSizeStyle = shallowRef<CSSProperties>({})
    const startResize = () => {
      resizeState.value = RESIZE_START
    }

    const needAutoSize = computed(() => !!props.autoSize)

    // Change to trigger resize measure
    watch(
      [
        () => props.value,
        minRows,
        maxRows,
        needAutoSize,
      ],
      async () => {
        await nextTick()
        if (needAutoSize.value) {
          startResize()
        }
      },
      {
        immediate: true,
      },
    )

    watch(
      resizeState,
      () => {
        if (!textareaRef.value) {
          return
        }
        if (resizeState.value === RESIZE_START) {
          resizeState.value = RESIZE_MEASURING
        }
        else if (resizeState.value === RESIZE_MEASURING) {
          const textareaStyles = calculateAutoSizeStyle(
            textareaRef.value!,
            false,
            minRows.value,
            maxRows.value,
          )

          // Safari has bug that text will keep break line on text cut when it's prev is break line.
          // ZombieJ: This not often happen. So we just skip it.
          // const { selectionStart, selectionEnd, scrollTop } = textareaRef.current;
          // const { value: tmpValue } = textareaRef.current;
          // textareaRef.current.value = '';
          // textareaRef.current.value = tmpValue;

          // if (document.activeElement === textareaRef.current) {
          //   textareaRef.current.scrollTop = scrollTop;
          //   textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
          // }
          resizeState.value = RESIZE_STABLE
          autoSizeStyle.value = textareaStyles
        }
        else {
          // https://github.com/react-component/textarea/pull/23
          // Firefox has blink issue before but fixed in latest version.
        }
      },
    )
    // We lock resize trigger by raf to avoid Safari warning
    const resizeRafRef = shallowRef<number>()
    const cleanRaf = () => {
      raf.cancel(resizeRafRef.value!)
    }

    const onInternalResize = (size: { width: number, height: number }) => {
      if (resizeState.value === RESIZE_STABLE) {
        props?.onResize?.(size)
        if (props.autoSize) {
          cleanRaf()
          resizeRafRef.value = raf(() => {
            startResize()
          })
        }
      }
    }
    onUnmounted(() => {
      cleanRaf()
    })

    return () => {
      const {
        autoSize,
        onResize,
        prefixCls,
        disabled,
      } = props
      const { style, restAttrs, className } = getAttrStyleAndClass(attrs, {
        omits: ['onKeydown'],
      })
      // =============================== Render ===============================
      const mergedAutoSizeStyle = needAutoSize.value ? autoSizeStyle.value : null

      const mergedStyle: CSSProperties = {
        ...style,
        ...mergedAutoSizeStyle,
      }

      if (resizeState.value === RESIZE_START || resizeState.value === RESIZE_MEASURING) {
        mergedStyle.overflowY = 'hidden'
        mergedStyle.overflowX = 'hidden'
      }

      return (
        <ResizeObserver
          onResize={onInternalResize}
          disabled={!(autoSize || onResize)}
        >
          <textarea
            {...restAttrs}
            {...omit(props, [
              'suffix',
              'classNames',
              'styles',
              'prefixCls',
              'allowClear',
              'autoSize',
              'showCount',
              'disabled',
              'hidden',
              'readOnly',
              'onClear',
              'maxLength',
              'onResize',
              'onChange',
            ]) as any}
            ref={textareaRef}
            style={mergedStyle}
            class={clsx(
              prefixCls,
              className,
              {
                [`${prefixCls}-disabled`]: disabled,
              },
            )}
            disabled={disabled}
            value={mergedValue.value as string}
            onInput={onInternalChange}
          />
        </ResizeObserver>
      )
    }
  },
  {
    name: 'ResizableTextArea',
    inheritAttrs: false,
  },
)

export default ResizableTextArea
