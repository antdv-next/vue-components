import type { VueNode } from '@v-c/util/dist/type'
import type { SetupContext } from 'vue'
import type { SelectorProps } from '../../interface'
import type { InputRef } from './Input'
import ResizeObserver from '@v-c/resize-observer'
import { clsx } from '@v-c/util'
import { computed, defineComponent, ref, watch } from 'vue'
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
  onMouseDown?: (e: MouseEvent) => void
  autoFocus?: boolean
  tabIndex?: number | string
  onActiveInfo: (
    info: [activeInputLeft: number, activeInputRight: number, selectorWidth: number],
  ) => void
}

const RangeSelector = defineComponent(
  (
    props: RangeSelectorProps,
    { attrs, expose }: SetupContext,
  ) => {
    const pickerContext = usePickerContext()
    const prefixCls = computed(() => pickerContext.value.prefixCls)
    const classNames = computed(() => pickerContext.value.classNames)
    const styles = computed(() => pickerContext.value.styles)

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
      nativeElement: rootRef,
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
    // Filter root-level events like onMouseEnter/onMouseLeave.
    const rootProps = useRootProps(props as any)

    // ===================== Placeholder ======================
    const mergedPlaceholder = computed(() =>
      Array.isArray(props.placeholder)
        ? props.placeholder
        : [props.placeholder, props.placeholder],
    )

    // ======================== Inputs ========================
    const inputPropsArgs = computed(() => {
      return {
        ...props,
        id: ids.value,
        placeholder: mergedPlaceholder.value,
      }
    })

    const [getInputProps] = useInputProps(inputPropsArgs as any)

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
    const autoFocus = computed(
      () => (props as any).autoFocus ?? (props as any).autofocus,
    )
    const tabIndex = computed(
      () => (props as any).tabIndex ?? (props as any).tabindex,
    )
    const startAutoFocus = computed(() => autoFocus.value && !props.disabled?.[0])
    const endAutoFocus = computed(() => autoFocus.value && !startAutoFocus.value && !props.disabled?.[1])

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
      } = props

      const rootDivProps = {
        ...rootProps.value,
        class: clsx(prefixCls.value, `${prefixCls.value}-range`, {
          [`${prefixCls.value}-focused`]: props.focused,
          [`${prefixCls.value}-disabled`]: disabled?.every(i => i),
          [`${prefixCls.value}-invalid`]: invalid?.some(i => i),
          [`${prefixCls.value}-rtl`]: rtl.value,
        }, attrs.class as string),
        style: attrs.style as any,
        onClick: (event: MouseEvent) => {
          if (Array.isArray(onClick)) {
            onClick.forEach(fn => fn?.(event))
          }
          else {
            onClick?.(event)
          }
        },
        onMousedown: (e: MouseEvent) => {
          const target = e.target as HTMLElement
          if (
            target !== inputStartRef.value?.inputElement
            && target !== inputEndRef.value?.inputElement
          ) {
            e.preventDefault()
          }

          props.onMouseDown?.(e)
        },
      }

      return (
        <ResizeObserver onResize={syncActiveOffset}>
          <div
            {...rootDivProps}
          >
            {prefix && (
              <div class={clsx(`${prefixCls.value}-prefix`, classNames.value.prefix)} style={styles.value.prefix}>
                {prefix}
              </div>
            )}
            <Input
              ref={inputStartRef}
              {...getInputProps(0)}
              class={`${prefixCls.value}-input-start`}
              autofocus={startAutoFocus.value}
              tabindex={tabIndex.value}
              data-range="start"
            />
            <div class={`${prefixCls.value}-range-separator`}>{separator}</div>
            <Input
              ref={inputEndRef}
              {...getInputProps(1)}
              class={`${prefixCls.value}-input-end`}
              autofocus={endAutoFocus.value}
              tabindex={tabIndex.value}
              data-range="end"
            />
            <div class={`${prefixCls.value}-active-bar`} style={activeBarStyle.value} />
            <Icon type="suffix" icon={suffixIcon} />
            {showClear.value && <ClearIcon icon={clearIcon} onClear={onClear!} />}
          </div>
        </ResizeObserver>
      )
    }
  },
  {
    name: 'RangeSelector',
    inheritAttrs: false,
  },
)

export default RangeSelector
