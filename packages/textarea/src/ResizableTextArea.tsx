import type { CSSProperties } from 'vue'
import ResizeObserver from '@v-c/resize-observer'
import { classNames } from '@v-c/util'
import raf from '@v-c/util/dist/raf'
import { computed, defineComponent, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import calculateAutoSizeStyle from './calculateNodeHeight'

const RESIZE_START = 0
const RESIZE_MEASURING = 1
const RESIZE_STABLE = 2

export default defineComponent({
  name: 'ResizableTextArea',
  props: {
    prefixCls: String,
    defaultValue: [String, Number],
    value: [String, Number],
    autoSize: [Boolean, Object],
    onResize: Function,
    disabled: Boolean,
    onChange: Function,
    onInternalAutoSize: Function,
    onKeydown: Function,
    onFocus: Function,
    onBlur: Function,
    onCompositionstart: Function,
    onCompositionend: Function,
    readOnly: Boolean,
    maxLength: Number,
  },
  emits: ['change', 'internalAutoSize', 'resize'],
  setup(props, { expose, attrs, emit }) {
    // =============================== Value ================================
    const mergedValue = shallowRef(props.value || props.defaultValue)

    watch(
      () => props.value,
      (val) => {
        mergedValue.value = val
      },
    )

    const onInternalChange = (event: Event) => {
      const target = event.target as HTMLTextAreaElement
      mergedValue.value = target.value
      emit('change', event)
    }

    // ================================ Ref =================================
    const textareaRef = ref<HTMLTextAreaElement>()

    expose({
      textArea: () => textareaRef.value,
      setValue: (val: string | number) => {
        mergedValue.value = val
      },
    })

    // ============================== AutoSize ==============================
    const minRows = ref<number>()
    const maxRows = ref<number>()
    watch(() => props.autoSize, () => {
      const { autoSize } = props
      if (autoSize && typeof autoSize === 'object') {
        minRows.value = autoSize.minRows
        maxRows.value = autoSize.maxRows
      }
      else {
        minRows.value = undefined
        maxRows.value = undefined
      }
    }, { immediate: true })

    const needAutoSize = computed(() => !!props.autoSize)

    // =============================== Scroll ===============================
    const fixFirefoxAutoScroll = () => {
      try {
        if (document.activeElement === textareaRef.value) {
          const { selectionStart, selectionEnd, scrollTop } = textareaRef.value
          textareaRef.value.setSelectionRange(selectionStart, selectionEnd)
          textareaRef.value.scrollTop = scrollTop
        }
      }
      catch (e) {
        // Fix error in Chrome:
        // Failed to read the 'selectionStart' property from 'HTMLInputElement'
        // http://stackoverflow.com/q/21177489/3040605
      }
    }

    // =============================== Resize ===============================
    const resizeState = ref(RESIZE_STABLE)
    const autoSizeStyle = ref<CSSProperties>()

    const startResize = () => {
      resizeState.value = RESIZE_START
      if (process.env.NODE_ENV === 'test') {
        emit('internalAutoSize')
      }
    }

    // Change to trigger resize measure
    watch(
      [() => props.value, minRows, maxRows, needAutoSize],
      () => {
        if (needAutoSize.value) {
          startResize()
        }
      },
    )

    watch(
      resizeState,
      () => {
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
          resizeState.value = RESIZE_STABLE
          autoSizeStyle.value = textareaStyles
        }
        else {
          fixFirefoxAutoScroll()
        }
      },
    )

    // We lock resize trigger by raf to avoid Safari warning
    const resizeRafRef = ref<number>()
    const cleanRaf = () => {
      raf.cancel(resizeRafRef.value!)
    }

    const onInternalResize = (size: { width: number, height: number }) => {
      if (resizeState.value === RESIZE_STABLE) {
        emit('resize', size)

        if (props.autoSize) {
          cleanRaf()
          resizeRafRef.value = raf(() => {
            startResize()
          })
        }
      }
    }

    onBeforeUnmount(() => cleanRaf())

    return () => {
      const {
        prefixCls,
        autoSize,
        onResize,
        disabled,
        ...resetProps
      } = props
      // =============================== Render ===============================
      const mergedAutoSizeStyle = needAutoSize.value ? autoSizeStyle.value : null

      const mergedStyle = {
        ...attrs.style as CSSProperties,
        ...mergedAutoSizeStyle,
        overflowY:
          resizeState.value === RESIZE_START
          || resizeState.value === RESIZE_MEASURING
            ? 'hidden'
            : undefined,
        overflowX:
          resizeState.value === RESIZE_START
          || resizeState.value === RESIZE_MEASURING
            ? 'hidden'
            : undefined,
      }
      return (
        <ResizeObserver
          onResize={onInternalResize}
          disabled={!(autoSize || onResize)}
        >
          <textarea
            {...attrs as any}
            {...resetProps}
            ref={textareaRef}
            style={mergedStyle}
            class={classNames(prefixCls, [attrs.className], {
              [`${prefixCls}-disabled`]: disabled,
            })}
            disabled={disabled}
            value={mergedValue.value}
            onChange={onInternalChange}
            onInput={onInternalChange}
          />
        </ResizeObserver>
      )
    }
  },
})
