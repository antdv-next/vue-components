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
  onActiveInfo: (
    info: [activeInputLeft: number, activeInputRight: number, selectorWidth: number],
  ) => void
}

const RangeSelector = defineComponent(
  <DateType extends object = any>(
    rawProps: RangeSelectorProps<DateType>,
    { attrs, expose }: SetupContext,
  ) => {
    const {
      prefixCls,
      classNames,
      styles,
    } = usePickerContext().value

    const rtl = computed(() => props.value.direction === 'rtl')

    // ========================== Id ==========================
    const ids = computed(() => {
      if (typeof props.value.id === 'string') {
        return [props.value.id]
      }
      const mergedId = props.value.id || {}
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

    const props = computed(() => ({
      ...rawProps,
      ...attrs,
    }))

    // ======================== Props =========================
    // We need to pass rest props to root div, but props in setup contains declared props.
    // attrs contains non-declared props.
    // useRootProps extracts events like onMouseEnter etc.
    // In Vue, attrs includes event listeners if not declared in emits/props.
    const rootProps = useRootProps(props.value as any)

    // ===================== Placeholder ======================
    const mergedPlaceholder = computed(() =>
      Array.isArray(props.value.placeholder)
        ? props.value.placeholder
        : [props.value.placeholder, props.value.placeholder],
    )

    // ======================== Inputs ========================
    const inputPropsArgs = computed(() => {
      return {
        ...props.value,
        ...attrs,
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
      const input = getInput(props.value.activeIndex!)
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
        props.value.onActiveInfo?.([inputRect.left, inputRect.right, parentRect.width])
      }
    }

    watch(() => props.value.activeIndex, syncActiveOffset, { flush: 'post' })

    // ======================== Clear =========================
    const showClear = computed(() =>
      props.value.clearIcon
      && ((props.value.value?.[0] && !props.value.disabled?.[0]) || (props.value.value?.[1] && !props.value.disabled?.[1])),
    )

    // ======================= Disabled =======================
    const startAutoFocus = computed(() => props.value.autoFocus && !props.value.disabled?.[0])
    const endAutoFocus = computed(() => props.value.autoFocus && !startAutoFocus.value && !props.value.disabled?.[1])

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
      } = props.value

      const rootDivProps = {
        ...rootProps.value,
        class: clsx(prefixCls, `${prefixCls}-range`, {
          [`${prefixCls}-focused`]: props.value.focused,
          [`${prefixCls}-disabled`]: disabled?.every(i => i),
          [`${prefixCls}-invalid`]: invalid?.some(i => i),
          [`${prefixCls}-rtl`]: rtl.value,
        }, attrs.class as string),
        style: attrs.style as any,
        onClick: (...rest: unknown[]) => {
          if (Array.isArray(onClick)) {
            onClick.forEach(fn => fn(...rest))

            return
          }

          onClick?.(...rest)
        },
        onmousedown: (e: MouseEvent) => {
          const target = e.target as HTMLElement
          if (
            target !== inputStartRef.value?.inputElement
            && target !== inputEndRef.value?.inputElement
          ) {
            e.preventDefault()
          }

          (attrs.onMousedown as any)?.(e)
        },
      }

      return (
        <ResizeObserver onResize={syncActiveOffset}>
          <div
            {...rootDivProps}
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
              // @ts-expect-error: Native Error
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
)

RangeSelector.name = 'RangeSelector'
RangeSelector.inheritAttrs = false

export default RangeSelector
