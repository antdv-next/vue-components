import type { PropType } from 'vue'
import { clsx } from '@v-c/util'
import { computed, defineComponent, onBeforeUnmount, ref, toRef, toRefs, watch } from 'vue'
import { leftPad } from '../../utils/miscUtil'
import { usePickerContext } from '../context'
import useLockEffect from '../hooks/useLockEffect'
import Icon from './Icon'
import MaskFormat from './MaskFormat'
import { getMaskRange, raf } from './util'

export interface InputRef {
  nativeElement?: HTMLDivElement
  inputElement?: HTMLInputElement
  focus: (options?: FocusOptions) => void
  blur: () => void
}

export default defineComponent({
  name: 'Input',
  inheritAttrs: false,
  props: {
    format: String,
    validateFormat: { type: Function as PropType<(value: string) => boolean>, required: true },
    active: { type: Boolean, default: undefined },
    showActiveCls: { type: Boolean, default: true },
    suffixIcon: [Object, String] as PropType<any>,
    value: String,
    onChange: { type: Function as PropType<(value: string) => void>, required: true },
    onSubmit: { type: Function as PropType<() => void>, required: true },
    helped: { type: Boolean, default: undefined },
    onHelp: { type: Function as PropType<() => void>, required: true },
    preserveInvalidOnBlur: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    clearIcon: [Object, String] as PropType<any>,

    // HTML Input props
    onFocus: Function as PropType<(e: FocusEvent) => void>,
    onBlur: Function as PropType<(e: FocusEvent) => void>,
    onMouseUp: Function as PropType<(e: MouseEvent) => void>,
    onKeyDown: Function as PropType<(e: KeyboardEvent) => void>,
    inputReadOnly: { type: Boolean, default: undefined },
    autofocus: { type: Boolean, default: undefined },
  },
  setup(props, { attrs, expose }) {
    const pickerCtx = usePickerContext()

    const {
      prefixCls,
      classNames,
      styles,
    } = toRefs(pickerCtx.value)

    const inputPrefixCls = computed(() => `${prefixCls.value}-input`)

    // ======================== Value =========================
    const focused = ref(false)
    const internalInputValue = ref(props.value)
    const focusCellText = ref('')
    const focusCellIndex = ref<number | null>(null)
    const forceSelectionSyncMark = ref<object | null>(null)

    const inputValue = computed(() => internalInputValue.value || '')

    // Sync value if needed
    watch(() => props.value, (val) => {
      internalInputValue.value = val
    })

    // ========================= Refs =========================
    const holderRef = ref<HTMLDivElement>()
    const inputRef = ref<HTMLInputElement>()

    expose({
      get nativeElement() {
        return holderRef.value
      },
      get inputElement() {
        return inputRef.value
      },
      focus: (options?: FocusOptions) => {
        inputRef.value?.focus(options)
      },
      blur: () => {
        inputRef.value?.blur()
      },
    })

    // ======================== Format ========================
    const maskFormat = computed(() => new MaskFormat(props.format || ''))

    const selectionRange = computed(() => {
      if (props.helped) {
        return [0, 0]
      }
      return maskFormat.value.getSelection(focusCellIndex.value!)
    })

    const selectionStart = computed(() => selectionRange.value[0])
    const selectionEnd = computed(() => selectionRange.value[1])

    // ======================== Modify ========================
    // When input modify content, trigger `onHelp` if is not the format
    const onModify = (text: string) => {
      if (text && text !== props.format && text !== props.value) {
        props.onHelp()
      }
    }

    // ======================== Change ========================
    /**
     * Triggered by paste, keyDown and focus to show format
     */
    const triggerInputChange = (text: string) => {
      if (props.validateFormat(text)) {
        props.onChange(text)
      }
      internalInputValue.value = text
      onModify(text)
    }

    // Directly trigger `onChange` if `format` is empty
    const onInternalChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      // Hack `onChange` with format to do nothing
      if (!props.format) {
        const text = target.value

        onModify(text)
        internalInputValue.value = text
        props.onChange(text)
      }
    }

    const onFormatPaste = (event: ClipboardEvent) => {
      // Get paste text
      const pasteText = event.clipboardData?.getData('text') || ''

      if (props.validateFormat(pasteText)) {
        triggerInputChange(pasteText)
      }
    }

    // ======================== Mouse =========================
    // When `mouseDown` get focus, it's better to not to change the selection
    // Since the up position maybe not is the first cell
    const mouseDownRef = ref(false)

    const onFormatMouseDown = () => {
      mouseDownRef.value = true
    }

    const onFormatMouseUp = (event: MouseEvent) => {
      const { selectionStart: start } = event.target as HTMLInputElement

      const closeMaskIndex = maskFormat.value.getMaskCellIndex(start!)
      focusCellIndex.value = closeMaskIndex

      // Force update the selection
      forceSelectionSyncMark.value = {}

      props.onMouseUp?.(event)

      mouseDownRef.value = false
    }

    // ====================== Focus Blur ======================
    const onFormatFocus = (event: FocusEvent) => {
      focused.value = true
      focusCellIndex.value = 0
      focusCellText.value = ''

      props.onFocus?.(event)
    }

    const onSharedBlur = (event: FocusEvent) => {
      props.onBlur?.(event)
    }

    const onFormatBlur = (event: FocusEvent) => {
      focused.value = false

      onSharedBlur(event)
    }

    // ======================== Active ========================
    // Check if blur need reset input value
    useLockEffect(toRef(props, 'active'), () => {
      if (!props.active && !props.preserveInvalidOnBlur) {
        internalInputValue.value = props.value
      }
    })

    // ======================= Keyboard =======================
    const onSharedKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && props.validateFormat(inputValue.value)) {
        props.onSubmit()
      }

      props.onKeyDown?.(event)
    }

    const onFormatKeyDown = (event: KeyboardEvent) => {
      onSharedKeyDown(event)

      const { key } = event

      // Save the cache with cell text
      let nextCellText: string | null = null

      // Fill in the input
      let nextFillText: string | null = null

      const maskCellLen = selectionEnd.value - selectionStart.value
      const cellFormat = props.format!.slice(selectionStart.value, selectionEnd.value)

      // Cell Index
      const offsetCellIndex = (offset: number) => {
        const idx = focusCellIndex.value!
        let nextIndex = idx + offset
        nextIndex = Math.max(nextIndex, 0)
        nextIndex = Math.min(nextIndex, maskFormat.value.size() - 1)
        focusCellIndex.value = nextIndex
      }

      // Range
      const offsetCellValue = (offset: number) => {
        const [rangeStart, rangeEnd, rangeDefault] = getMaskRange(cellFormat)

        const currentText = inputValue.value.slice(selectionStart.value, selectionEnd.value)
        const currentTextNum = Number(currentText)

        if (Number.isNaN(currentTextNum)) {
          return String(rangeDefault || (offset > 0 ? rangeStart : rangeEnd))
        }

        const num = currentTextNum + offset
        const range = rangeEnd - rangeStart + 1
        return String(rangeStart + ((range + num - rangeStart) % range))
      }

      switch (key) {
        // =============== Remove ===============
        case 'Backspace':
        case 'Delete':
          nextCellText = ''
          nextFillText = cellFormat
          break

        // =============== Arrows ===============
        // Left key
        case 'ArrowLeft':
          nextCellText = ''
          offsetCellIndex(-1)
          break

        // Right key
        case 'ArrowRight':
          nextCellText = ''
          offsetCellIndex(1)
          break

        // Up key
        case 'ArrowUp':
          nextCellText = ''
          nextFillText = offsetCellValue(1)
          break

        // Down key
        case 'ArrowDown':
          nextCellText = ''
          nextFillText = offsetCellValue(-1)
          break

        // =============== Number ===============
        default:
          if (!Number.isNaN(Number(key))) {
            nextCellText = focusCellText.value + key
            nextFillText = nextCellText
          }
          break
      }

      // Update cell text
      if (nextCellText !== null) {
        focusCellText.value = nextCellText

        if (nextCellText.length >= maskCellLen) {
          // Go to next cell
          offsetCellIndex(1)
          focusCellText.value = ''
        }
      }

      // Update the input text
      if (nextFillText !== null) {
        // Replace selection range with `nextCellText`
        const nextFocusValue
          // before
          = inputValue.value.slice(0, selectionStart.value)
          // replace
            + leftPad(nextFillText, maskCellLen)
          // after
            + inputValue.value.slice(selectionEnd.value)
        triggerInputChange(nextFocusValue.slice(0, props.format!.length))
      }

      // Always trigger selection sync after key down
      forceSelectionSyncMark.value = {}
    }

    // ======================== Format ========================
    const rafRef = ref<any>()

    watch([
      maskFormat,
      () => props.format,
      focused,
      inputValue,
      focusCellIndex,
      selectionStart,
      selectionEnd,
      forceSelectionSyncMark,
    ], () => {
      if (!focused.value || !props.format || mouseDownRef.value) {
        return
      }

      // Reset with format if not match
      if (!maskFormat.value.match(inputValue.value)) {
        triggerInputChange(props.format)
        return
      }

      // Match the selection range
      inputRef.value?.setSelectionRange(selectionStart.value, selectionEnd.value)

      // Chrome has the bug anchor position looks not correct but actually correct
      rafRef.value = raf(() => {
        inputRef.value?.setSelectionRange(selectionStart.value, selectionEnd.value)
      })
    }, { flush: 'post' })

    onBeforeUnmount(() => {
      raf.cancel(rafRef.value)
    })

    return () => {
      const {
        className,
        active, // unused in render
        showActiveCls, // unused in render (logic used above)
        suffixIcon, // unused in render (props.suffixIcon)
        format, // unused in render
        validateFormat, // unused in render
        onChange, // unused in render
        onInput, // unused in render
        helped, // unused in render
        onHelp, // unused in render
        onSubmit, // unused in render
        onKeyDown, // unused in render
        preserveInvalidOnBlur, // unused in render
        invalid, // unused in render
        clearIcon, // unused in render
        // Pass to input
        ...restProps
      } = props as any

      // Input props for format
      const inputProps = props.format
        ? {
            onFocus: onFormatFocus,
            onBlur: onFormatBlur,
            onKeydown: onFormatKeyDown,
            onMousedown: onFormatMouseDown,
            onMouseup: onFormatMouseUp,
            onPaste: onFormatPaste,
          }
        : {}

      const Component = pickerCtx.value.input ?? 'input'

      return (
        <div
          ref={holderRef}
          class={clsx(
            inputPrefixCls.value,
            {
              [`${inputPrefixCls.value}-active`]: props.active && props.showActiveCls,
              [`${inputPrefixCls.value}-placeholder`]: props.helped,
            },
            attrs.class as string,
          )}
          style={attrs.style as any}
        >
          <Component
            ref={inputRef}
            aria-invalid={props.invalid}
            autoComplete="off"
            {...attrs}
            {...restProps}
            onKeydown={onSharedKeyDown}
            onBlur={onSharedBlur}
            // Replace with format
            {...inputProps}
            // Value
            value={inputValue.value}
            onInput={onInternalChange}
            class={classNames.value.input}
            style={styles.value.input}
            readonly={props.inputReadOnly}
          />
          <Icon type="suffix" icon={props.suffixIcon} />
          {props.clearIcon}
        </div>
      )
    }
  },
})
