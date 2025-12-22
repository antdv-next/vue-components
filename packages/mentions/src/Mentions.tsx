import type { CommonInputProps } from '@v-c/input'
import type { TextAreaProps, TextAreaRef } from '@v-c/textarea'
import type { VueNode } from '@v-c/util'
import type { CSSProperties } from 'vue'
import type { OptionProps } from './Option'
import { BaseInput } from '@v-c/input'
import TextArea from '@v-c/textarea'
import { clsx, KeyCode, omit, useId } from '@v-c/util'
import { toArray } from '@v-c/util/dist/Children/toArray'
import { filterEmpty, getAttrStyleAndClass } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useUnstableContext } from './context'
import useEffectState from './hooks/useEffectState'
import KeywordTrigger from './KeywordTrigger'
import { MentionsProvider } from './MentionsContext.ts'

import {
  filterOption as defaultFilterOption,
  validateSearch as defaultValidateSearch,
  getBeforeSelectionText,
  getLastMeasureIndex,
  replaceWithMeasure,
  setInputSelection,
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
  rows?: HTMLTextAreaElement['rows']
}

const omitKeys = [
  'prefixCls',
  'className',
  'style',
  'classNames',
  'styles',

  'prefix',
  'split',
  'notFoundContent',
  'value',
  'defaultValue',
  'children',
  'options',
  'allowClear',
  'suffix',
  'hasWrapper',
  'silent',

  'validateSearch',
  'filterOption',
  'onChange',
  'onKeydown',
  'onKeyup',
  'onPressEnter',
  'onSearch',
  'onSelect',
  'onFocus',
  'onBlur',

  'transitionName',
  'placement',
  'direction',
  'getPopupContainer',
  'popupClassName',

  'rows',
  'visible',
  'onPopupScroll',
]

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
  prefixCls: 'vc-mentions',
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
    const setActiveIndex = (index: number) => {
      activeIndex.value = index
    }
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
      const filterOption = props?.filterOption ?? defaultFilterOption

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
        if (typeof filterOption !== 'function') {
          return true
        }
        return filterOption(targetMeasureText, option)
      })
    }

    const mergedOptions = computed(() => getOptions(mergedMeasureText.value))

    // ============================= Measure ==============================
    // Mark that we will reset input selection to target position when user select option
    const onSelectionEffect = useEffectState()

    const startMeasure = (
      nextMeasureText: string,
      nextMeasurePrefix: string,
      nextMeasureLocation: number,
    ) => {
      measuring.value = true
      measureText.value = nextMeasureText
      measurePrefix.value = nextMeasurePrefix
      measureLocation.value = nextMeasureLocation
      activeIndex.value = 0
    }

    const stopMeasure = (callback?: VoidFunction) => {
      measuring.value = false
      measureLocation.value = 0
      measureText.value = ''
      onSelectionEffect(callback)
    }

    // ============================== Change ==============================
    const triggerChange = (nextValue: string) => {
      mergedValue.value = nextValue
      props?.onChange?.(nextValue)
    }

    const onInternalChange = (e: any) => {
      const nextValue = e?.target?.value
      triggerChange(nextValue)
    }

    const selectOption = (option: OptionProps) => {
      const { value: mentionValue = '' } = option
      const textArea = getTextArea()!
      const { text, selectionLocation } = replaceWithMeasure(mergedValue.value, {
        measureLocation: mergedMeasureLocation.value,
        targetText: mentionValue,
        prefix: mergedMeasurePrefix.value,
        selectionStart: textArea?.selectionStart as number,
        split: props.split!,
      })
      triggerChange(text)
      stopMeasure(() => {
        // We need restore the selection position
        setInputSelection(textArea, selectionLocation)
      })

      props?.onSelect?.(option, mergedMeasurePrefix.value)
    }

    // ============================= KeyEvent =============================
    // Check if hit the measure keyword
    const onInternalKeyDown = (event: any) => {
      const { which } = event
      props?.onKeydown?.(event)
      // Skip if not measuring
      if (!mergedMeasuring.value) {
        return
      }
      if (which === KeyCode.UP || which === KeyCode.DOWN) {
        // Control arrow function
        const optionLen = mergedOptions.value.length
        const offset = which === KeyCode.UP ? -1 : 1
        activeIndex.value = (activeIndex.value + offset + optionLen) % optionLen
        event.preventDefault()
      }
      else if (which === KeyCode.ESC) {
        stopMeasure()
      }
      else if (which === KeyCode.ENTER) {
        // Measure hit
        event.preventDefault()
        // loading skip
        if (props?.silent) {
          return
        }

        if (!mergedOptions.value.length) {
          stopMeasure()
          return
        }

        const option = mergedOptions.value[activeIndex.value]
        selectOption(option)
      }
    }

    /**
     * When to start measure:
     * 1. When user press `prefix`
     * 2. When measureText !== prevMeasureText
     *  - If measure hit
     *  - If measuring
     *
     * When to stop measure:
     * 1. Selection is out of range
     * 2. Contains `space`
     * 3. ESC or select one
     */
    const onInternalKeyUp = (event: any) => {
      const { key, which } = event
      const target = event.target as HTMLTextAreaElement
      const selectionStartText = getBeforeSelectionText(target)
      const { location: measureIndex, prefix: nextMeasurePrefix } = getLastMeasureIndex(selectionStartText, mergedPrefix.value as string[])

      // If the client implements an onKeyUp handler, call it
      props?.onKeyup?.(event)
      // Skip if match the white key list
      if (
        [KeyCode.ESC, KeyCode.UP, KeyCode.DOWN, KeyCode.ENTER].includes(which)
      ) {
        return
      }
      if (measureIndex !== -1) {
        const nextMeasureText = selectionStartText.slice(
          measureIndex + nextMeasurePrefix.length,
        )
        const validateSearchFn
          = typeof props.validateSearch === 'function' ? props.validateSearch : defaultValidateSearch
        const validateMeasure: boolean = validateSearchFn(nextMeasureText, props.split!)
        const matchOption = !!getOptions(nextMeasureText).length

        if (validateMeasure) {
          // adding AltGraph also fort azert keyboard
          if (
            key === nextMeasurePrefix
            || key === 'Shift'
            || which === KeyCode.ALT
            || key === 'AltGraph'
            || mergedMeasuring.value
            || (nextMeasureText !== mergedMeasureText.value && matchOption)
          ) {
            startMeasure(nextMeasureText, nextMeasurePrefix, measureIndex)
          }
        }
        else if (mergedMeasuring.value) {
          // Stop if measureText is invalidate
          stopMeasure()
        }
        /**
         * We will trigger `onSearch` to developer since they may use for async update.
         * If met `space` means user finished searching.
         */
        const onSearch = props?.onSearch
        if (onSearch && validateMeasure) {
          onSearch(nextMeasureText, nextMeasurePrefix)
        }
      }
      else if (mergedMeasuring.value) {
        stopMeasure()
      }
    }

    const onInternalPressEnter = (event: any) => {
      const onPressEnter = props?.onPressEnter
      if (!mergedMeasuring.value && onPressEnter) {
        onPressEnter(event)
      }
    }
    // ============================ Focus Blur ============================
    const focusRef = shallowRef<number>()
    const onInternalFocus = (event?: FocusEvent) => {
      window.clearTimeout(focusRef.value)
      const onFocus = props?.onFocus
      if (!isFocus.value && event && onFocus) {
        onFocus(event)
      }
      isFocus.value = true
    }

    const onInternalBlur = (event?: any) => {
      focusRef.value = window.setTimeout(() => {
        isFocus.value = false
        stopMeasure()
        props?.onBlur?.(event)
      }, 0)
    }

    const onDropdownFocus = () => {
      onInternalFocus()
    }

    const onDropdownBlur = () => {
      onInternalBlur()
    }

    // ============================== Scroll ===============================
    const onInternalPopupScroll = (event: UIEvent) => {
      props?.onPopupScroll?.(event)
    }
    return () => {
      const {
        classNames: mentionClassNames,
        styles,
        rows = 1,
        prefixCls,
        notFoundContent,
      } = props
      const restProps = omit(props, omitKeys as any)

      const { className, restAttrs, style } = getAttrStyleAndClass(attrs)
      // ============================== Styles ==============================
      const resizeStyle = styles?.textarea?.resize ?? style?.resize
      const mergedTextareaStyle = {
        ...styles?.textarea,
      }
      // Only add resize if it has a valid value, avoid setting undefined
      if (resizeStyle !== undefined) {
        mergedTextareaStyle.resize = resizeStyle
      }
      const mergedStyles = {
        ...styles,
        textarea: mergedTextareaStyle,
      }

      // ============================== Render ==============================
      const mentionNode = (
        <>
          <TextArea
            classNames={{
              textarea: mentionClassNames?.textarea,
            } as any}
            /**
             * Example:<Mentions style={{ resize: 'none' }} />.
             * If written this way, resizing here will become invalid.
             * The TextArea component code and found that the resize parameter in the style of the ResizeTextArea component is obtained from prop.style.
             * Just pass the resize attribute and leave everything else unchanged.
             */
            styles={mergedStyles}
            ref={textareaRef as any}
            value={mergedValue.value}
            {...restAttrs}
            {...restProps}
            {
              ...{
                rows,
              }
            }
            onChange={onInternalChange}
            onKeydown={onInternalKeyDown}
            onKeyup={onInternalKeyUp}
            onPressEnter={onInternalPressEnter}
            onFocus={onInternalFocus}
            onBlur={onInternalBlur}
          />
          { mergedMeasuring.value && (
            <div ref={measureRef} class={`${prefixCls}-measure`}>
              {mergedValue.value.slice(0, mergedMeasureLocation.value)}
              <MentionsProvider
                value={{
                  notFoundContent,
                  activeIndex: activeIndex.value,
                  setActiveIndex,
                  selectOption,
                  onFocus: onDropdownFocus,
                  onBlur: onDropdownBlur,
                  onScroll: onInternalPopupScroll,
                }}
              >
                <KeywordTrigger
                  prefixCls={prefixCls}
                  transitionName={props.transitionName}
                  placement={props.placement}
                  direction={props.direction}
                  options={mergedOptions.value}
                  visible
                  getPopupContainer={props.getPopupContainer}
                  popupClassName={clsx(props.popupClassName, mentionClassNames?.popup)}
                  popupStyle={styles?.popup}
                >
                  <span>{mergedMeasurePrefix.value}</span>
                </KeywordTrigger>
              </MentionsProvider>
              {mergedValue.value.slice(
                mergedMeasureLocation.value + mergedMeasurePrefix.value.length,
              )}
            </div>
          )}
        </>
      )
      if (!props.hasWrapper) {
        return (
          <div
            class={clsx(prefixCls, props.className, className)}
            style={style}
            ref={containerRef}
          >
            {mentionNode}
          </div>
        )
      }
      return mentionNode
    }
  },
  {
    name: 'VMentions',
    inheritAttrs: false,
  },
)

const Mentions = defineComponent<MentionsProps>(
  (props, { expose, attrs }) => {
    const hasSuffix = computed(() => !!(props.suffix || props.allowClear))

    const holderRef = shallowRef<any>()
    const mentionRef = shallowRef<MentionsRef>()

    const mergedValue = shallowRef(props?.value ?? props?.defaultValue ?? '')
    watch(() => props.value, () => {
      mergedValue.value = props.value ?? ''
    })
    const setMergedValue = (value: string) => {
      mergedValue.value = value
    }

    const triggerChange = (nextValue: string) => {
      setMergedValue(nextValue)
      props?.onChange?.(nextValue)
    }

    const handleReset = () => {
      triggerChange('')
    }

    expose({
      focus: () => mentionRef.value?.focus?.(),
      blur: () => mentionRef.value?.blur?.(),
      textarea: computed(() => mentionRef.value?.textarea || null),
      nativeElement: computed(() => holderRef.value?.nativeElement || mentionRef.value?.nativeElement),
    })

    return () => {
      const {
        suffix,
        prefixCls = 'vc-mentions',
        allowClear,
        classNames: mentionsClassNames,
        styles,
        className: propsClassName,
        disabled,
        onClear,
        id,
        value: _value,
        defaultValue: _defaultValue,
        onChange: _onChange,
        ...rest
      } = props

      const { className, style } = getAttrStyleAndClass(attrs)
      const internalClassName = clsx(mentionsClassNames?.mentions, propsClassName)

      const internalProps = {
        ...attrs,
        ...rest,
        id,
        value: mergedValue.value,
        prefixCls,
        className: internalClassName,
        classNames: mentionsClassNames,
        styles,
        disabled,
        hasWrapper: hasSuffix.value,
        onChange: triggerChange,
      }
      return (
        <BaseInput
          ref={holderRef as any}
          suffix={suffix}
          prefixCls={prefixCls}
          value={mergedValue.value}
          allowClear={allowClear}
          handleReset={handleReset}
          class={clsx(
            prefixCls,
            propsClassName,
            className,
            { [`${prefixCls}-has-suffix`]: hasSuffix.value },
          )}
          style={style}
          classNames={mentionsClassNames}
          styles={styles as any}
          disabled={disabled}
          onClear={onClear}
        >
          <InternalMentions
            ref={mentionRef as any}
            {...internalProps}
          />
        </BaseInput>
      )
    }
  },
  {
    name: 'Mentions',
    inheritAttrs: false,
  },
)

export default Mentions
