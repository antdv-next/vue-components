import type { CommonInputProps } from '@v-c/input'
import type { TextAreaProps, TextAreaRef } from '@v-c/textarea'
import type { VueNode } from '@v-c/util'
import type { CSSProperties } from 'vue'
import type { OptionProps } from './Option'
import { useId } from '@v-c/util'
import { toArray } from '@v-c/util/dist/Children/toArray'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useUnstableContext } from './context'
import useEffectState from './hooks/useEffectState.ts'
import {
  filterOption as defaultFilterOption,
  validateSearch as defaultValidateSearch,
} from './util'

type BaseTextareaAttrs = Omit<
  TextAreaProps,
    'prefix' | 'onChange' | 'onSelect' | 'showCount' | 'classNames'
>

export type Placement = 'top' | 'bottom'
export type Direction = 'ltr' | 'rtl'

export interface DataDrivenOptionProps extends OptionProps {
  label?: VueNode
}

export interface MentionsProps extends BaseTextareaAttrs {
  id?: string
  autoFocus?: boolean
  className?: string
  defaultValue?: string
  notFoundContent?: VueNode
  split?: string
  style?: CSSProperties
  transitionName?: string
  placement?: Placement
  direction?: Direction
  prefix?: string | string[]
  prefixCls?: string
  value?: string
  silent?: boolean
  filterOption?: false | typeof defaultFilterOption
  validateSearch?: typeof defaultValidateSearch
  onChange?: (text: string) => void
  onSelect?: (option: OptionProps, prefix: string) => void
  onSearch?: (text: string, prefix: string) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  getPopupContainer?: () => HTMLElement
  popupClassName?: string
  options?: DataDrivenOptionProps[]
  classNames?: CommonInputProps['classNames'] & {
    mentions?: string
    textarea?: string
    popup?: string
  }
  styles?: {
    suffix?: CSSProperties
    textarea?: CSSProperties
    popup?: CSSProperties
  }
  onPopupScroll?: (event: UIEvent) => void
}

export interface MentionsRef {
  focus: VoidFunction
  blur: VoidFunction

  /** @deprecated It may not work as expected */
  textarea: HTMLTextAreaElement | null

  nativeElement: HTMLElement
}

interface InternalMentionsProps extends MentionsProps {
  hasWrapper: boolean
}

const defaults = {
  prefix: '@',
  split: ' ',
  notFoundContent: 'Not Found',
  validateSearch: defaultValidateSearch,
  filterOption: defaultFilterOption,
  rows: 1,
} as any

const InternalMentions = defineComponent<InternalMentionsProps>(
  (props = defaults, { slots, expose, attrs }) => {
    const mergedPrefix = computed(() => {
      const prefix = props.prefix
      return Array.isArray(prefix) ? prefix : [prefix]
    })

    // =============================== Refs ===============================
    const containerRef = shallowRef<HTMLDivElement>()
    const textareaRef = shallowRef<TextAreaRef>()
    const measureRef = shallowRef<HTMLDivElement>()

    const getTextArea = () => textareaRef.value?.resizableTextArea?.textArea

    expose({
      focus: () => textareaRef.value?.focus?.(),
      blur: () => textareaRef.value?.blur?.(),
      textarea: computed(() => textareaRef.value?.resizableTextArea?.textArea),
      nativeElement: containerRef,
    })

    // ============================== State ===============================
    const measuring = shallowRef(false)
    const measureText = shallowRef('')
    const measurePrefix = shallowRef('')
    const measureLocation = shallowRef(0)
    const activeIndex = shallowRef(0)
    const isFocus = shallowRef(false)
    // ================================ Id ================================
    const uniqueKey = useId(props.id)

    // ============================== Value ===============================
    const mergedValue = shallowRef(props.value ?? props?.defaultValue ?? '')
    watch(
      () => props?.value,
      () => {
        mergedValue.value = props.value ?? ''
      },
    )

    // =============================== Open ===============================
    const { open } = useUnstableContext()

    watch(
      measuring,
      () => {
      // Sync measure div top with textarea for rc-trigger usage
        if (measuring.value && measureRef.value) {
          ;(measureRef.value as any).scrollTop = getTextArea()?.scrollTop
        }
      },
      {
        immediate: true,
      },
    )
    const mergedMeasuringInfo = computed(() => {
      if (open?.value) {
        for (let i = 0; i < mergedPrefix.value.length; i += 1) {
          const curPrefix = mergedPrefix.value[i]
          const index = mergedValue.value.lastIndexOf(curPrefix!)
          if (index >= 0) {
            return [true, '', curPrefix, index]
          }
        }
      }
      return [measuring.value, measureText.value, measurePrefix.value, measureLocation.value] as const
    })
    const mergedMeasuring = computed(() => mergedMeasuringInfo.value[0] as boolean)
    const mergedMeasureText = computed(() => mergedMeasuringInfo.value[1] as string)
    const mergedMeasurePrefix = computed(() => mergedMeasuringInfo.value[2] as string)
    const mergedMeasureLocation = computed(() => mergedMeasuringInfo.value[3] as number)

    const children = computed(() => {
      const _child = slots?.default ? slots?.default?.() : []
      if (_child) {
        return filterEmpty(_child).filter(Boolean)
      }
      return _child
    })

    // ============================== Option ==============================
    const getOptions = (targetMeasureText: string) => {
      let list
      const options = props?.options ?? []
      const filterOption = props?.filterOption

      if (options && options.length > 0) {
        list = options.map(item => ({
          ...item,
          key: `${item?.key ?? item.value}-${uniqueKey}`,
        }))
      }
      else {
        list = toArray(children.value).map(
          ({
            props: optionProps,
            key,
          }: any) => ({
            ...optionProps,
            label: optionProps.children?.default?.(),
            key: `${key || optionProps.value}-${uniqueKey}`,
          }),
        )
      }

      return list.filter((option: OptionProps) => {
        /** Return all result if `filterOption` is false. */
        if (filterOption === false) {
          return true
        }
        return filterOption?.(targetMeasureText, option)
      })
    }

    const mergedOptions = computed(() => getOptions(mergedMeasureText.value))

    // ============================= Measure ==============================
    // Mark that we will reset input selection to target position when user select option
    const onSelectionEffect = useEffectState()

    return () => {
      return null
    }
  },
  {
    name: 'VMentions',
    inheritAttrs: false,
  },
)
