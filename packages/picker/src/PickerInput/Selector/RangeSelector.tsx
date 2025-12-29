import type { VueNode } from '@v-c/util/dist/type'
import type { PropType } from 'vue'
import type { SelectorProps } from '../../interface'
import type { InputRef } from './Input'
import ResizeObserver from '@v-c/resize-observer'
import { clsx } from '@v-c/util'
import { computed, defineComponent, reactive, ref, toRefs, watch } from 'vue'
import { usePickerContext } from '../context'
import useInputProps from './hooks/useInputHooks'
import useRootProps from './hooks/useRootProps'
import Icon, { ClearIcon } from './Icon'
import Input from './Input'

export type SelectorIdType
  = | string
    | {
      start?: string
      end?: string
    }

export interface RangeSelectorProps<DateType = any> extends SelectorProps<DateType> {
  id?: SelectorIdType
  activeIndex: number | null
  separator?: VueNode
  value?: [DateType?, DateType?]
  onChange: (date: DateType, index?: number) => void
  disabled: [boolean, boolean]
  allHelp: boolean
  placeholder?: string | [string, string]
  invalid: [boolean, boolean]
  placement?: string
  onActiveInfo: (
    info: [activeInputLeft: number, activeInputRight: number, selectorWidth: number],
  ) => void
}

export default defineComponent({
  name: 'RangeSelector',
  inheritAttrs: false,
  props: {
    // SelectorProps
    picker: { type: String as PropType<any> },
    prefix: { type: [Object, String] as PropType<VueNode> },
    clearIcon: { type: [Object, String] as PropType<VueNode> },
    suffixIcon: { type: [Object, String] as PropType<VueNode> },
    focused: { type: Boolean, default: undefined },
    onFocus: { type: Function as PropType<(e: FocusEvent) => void> },
    onBlur: { type: Function as PropType<(e: FocusEvent) => void> },
    onSubmit: { type: Function as PropType<() => void> },
    onKeyDown: { type: Function as PropType<(e: KeyboardEvent) => void> },
    locale: { type: Object as PropType<any> },
    generateConfig: { type: Object as PropType<any> },
    direction: { type: String as PropType<'ltr' | 'rtl'> },
    onClick: { type: Function as PropType<(e: MouseEvent) => void> },
    onClear: { type: Function as PropType<() => void> },
    format: { type: Array as PropType<any[]> },
    maskFormat: { type: String },
    onInputChange: { type: Function as PropType<() => void> },
    onInvalid: { type: Function as PropType<(valid: boolean, index?: number) => void> },
    preserveInvalidOnBlur: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void> },
    inputReadOnly: { type: Boolean, default: undefined },
    activeHelp: { type: Boolean, default: undefined },
    open: { type: Boolean, default: undefined },

    // RangeSelectorProps
    id: { type: [String, Object] as PropType<SelectorIdType> },
    activeIndex: { type: Number as PropType<number | null> },
    separator: { type: [Object, String] as PropType<VueNode>, default: '~' },
    value: { type: Array as PropType<any[]> },
    onChange: { type: Function as PropType<(date: any, index?: number) => void> },
    disabled: { type: Array as PropType<any[]> },
    allHelp: { type: Boolean, default: undefined },
    placeholder: { type: [String, Array] as PropType<string | [string, string]> },
    invalid: { type: Array as PropType<any[]> },
    placement: { type: String },
    onActiveInfo: { type: Function as PropType<(info: any) => void> },

    // HTML Props
    autoFocus: { type: Boolean, default: undefined },
    tabindex: Number,
  },
  setup(props, { attrs, expose }) {
    const {
      prefixCls,
      classNames,
      styles,
    } = usePickerContext().value

    const rtl = computed(() => props.direction === 'rtl')

    // ========================== Id ==========================
    const ids = computed(() => {
      if (typeof props.id === 'string') {
        return [props.id]
      }
      const mergedId = props.id || {}
      return [mergedId.start, mergedId.end]
    })

    // ========================= Refs =========================
    const rootRef = ref<HTMLDivElement>()
    const inputStartRef = ref<InputRef>()
    const inputEndRef = ref<InputRef>()

    const getInput = (index: number) => [inputStartRef, inputEndRef][index]?.value

    expose({
      nativeElement: () => rootRef.value,
      focus: (options?: any) => {
        if (typeof options === 'object') {
          const { index = 0, ...rest } = options || {}
          getInput(index)?.focus(rest)
        }
        else {
          getInput(options ?? 0)?.focus()
        }
      },
      blur: () => {
        getInput(0)?.blur()
        getInput(1)?.blur()
      },
    })

    // ======================== Props =========================
    // We need to pass rest props to root div, but props in setup contains declared props.
    // attrs contains non-declared props.
    // useRootProps extracts events like onMouseEnter etc.
    // In Vue, attrs includes event listeners if not declared in emits/props.
    const rootProps = useRootProps(attrs as any)

    // ===================== Placeholder ======================
    const mergedPlaceholder = computed(() =>
      Array.isArray(props.placeholder)
        ? props.placeholder
        : [props.placeholder, props.placeholder],
    )

    // ======================== Inputs ========================
    const inputPropsArgs = reactive({
      ...toRefs(props),
      id: ids,
      placeholder: mergedPlaceholder,
    }) as any

    const [getInputProps] = useInputProps(inputPropsArgs)

    // ====================== ActiveBar =======================
    const activeBarStyle = ref<any>({
      position: 'absolute',
      width: 0,
    })

    const syncActiveOffset = () => {
      const input = getInput(props.activeIndex!)
      if (input && rootRef.value && input.nativeElement) {
        // Input component exposes nativeElement
        const inputRect = input.nativeElement.getBoundingClientRect()
        const parentRect = rootRef.value.getBoundingClientRect()

        const rectOffset = inputRect.left - parentRect.left
        activeBarStyle.value = {
          ...activeBarStyle.value,
          width: `${inputRect.width}px`,
          left: `${rectOffset}px`,
        }
        props.onActiveInfo?.([inputRect.left, inputRect.right, parentRect.width])
      }
    }

    watch(() => props.activeIndex, syncActiveOffset, { flush: 'post' })

    // ======================== Clear =========================
    const showClear = computed(() =>
      props.clearIcon
      && ((props.value?.[0] && !props.disabled?.[0]) || (props.value?.[1] && !props.disabled?.[1])),
    )

    // ======================= Disabled =======================
    const startAutoFocus = computed(() => props.autoFocus && !props.disabled?.[0])
    const endAutoFocus = computed(() => props.autoFocus && !startAutoFocus.value && !props.disabled?.[1])

    return () => {
      const {
        prefix,
        suffixIcon,
        clearIcon,
        separator,
        disabled,
        invalid,
        onClick,
        onClear,
        tabindex,
      } = props

      return (
        <ResizeObserver onResize={syncActiveOffset}>
          <div
            {...rootProps.value}
            class={clsx(
              prefixCls,
              `${prefixCls}-range`,
              {
                [`${prefixCls}-focused`]: props.focused,
                [`${prefixCls}-disabled`]: disabled?.every(i => i),
                [`${prefixCls}-invalid`]: invalid?.some(i => i),
                [`${prefixCls}-rtl`]: rtl.value,
              },
              attrs.class as string,
            )}
            style={attrs.style as any}
            ref={rootRef}
            onClick={onClick}
            onMousedown={(e) => {
              const target = e.target as HTMLElement
              if (
                target !== inputStartRef.value?.inputElement
                && target !== inputEndRef.value?.inputElement
              ) {
                e.preventDefault()
              }

              (attrs.onMousedown as any)?.(e)
            }}
          >
            {prefix && (
              <div class={clsx(`${prefixCls}-prefix`, classNames.prefix)} style={styles.prefix}>
                {prefix}
              </div>
            )}
            <Input
              ref={inputStartRef}
              {...getInputProps(0)}
              class={`${prefixCls}-input-start`}
              autofocus={startAutoFocus.value}
              tabindex={tabindex}
              data-range="start"
            />
            <div class={`${prefixCls}-range-separator`}>{separator}</div>
            <Input
              ref={inputEndRef}
              {...getInputProps(1)}
              class={`${prefixCls}-input-end`}
              autofocus={endAutoFocus.value}
              tabindex={tabindex}
              data-range="end"
            />
            <div class={`${prefixCls}-active-bar`} style={activeBarStyle.value} />
            <Icon type="suffix" icon={suffixIcon} />
            {showClear.value && <ClearIcon icon={clearIcon} onClear={onClear!} />}
          </div>
        </ResizeObserver>
      )
    }
  },
})
