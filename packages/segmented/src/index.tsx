import type { ChangeEvent } from '@v-c/util/dist/EventInterface'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import { clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import MotionThumb from './MotionThumb'

export type SemanticName = 'item' | 'label'
export type SegmentedValue = string | number

export type SegmentedRawOption = SegmentedValue

export interface SegmentedLabeledOption<ValueType = SegmentedRawOption> {
  class?: string
  disabled?: boolean
  label: VueNode
  value: ValueType
  /**
   * html `title` property for label
   */
  title?: string
}

type ItemRender = (
  node: VueNode,
  info: { item: SegmentedLabeledOption },
) => VueNode

type SegmentedOptions<T = SegmentedRawOption> = (
  | T
  | SegmentedLabeledOption<T>
)[]

export interface SegmentedProps {
  options: SegmentedOptions
  defaultValue?: SegmentedValue
  value?: SegmentedValue
  onChange?: (value: SegmentedValue) => void
  disabled?: boolean
  prefixCls?: string
  direction?: 'ltr' | 'rtl'
  motionName?: string
  vertical?: boolean
  name?: string
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  itemRender?: ItemRender
}

function getValidTitle(option: SegmentedLabeledOption) {
  if (typeof option.title !== 'undefined') {
    return option.title
  }

  // read `label` when title is `undefined`
  if (typeof option.label !== 'object') {
    return option.label?.toString()
  }
}

function normalizeOptions(options: SegmentedOptions): SegmentedLabeledOption[] {
  return options.map((option) => {
    if (typeof option === 'object' && option !== null) {
      const validTitle = getValidTitle(option)
      return {
        ...option,
        title: validTitle,
      }
    }
    return {
      label: option?.toString(),
      title: option?.toString(),
      value: option,
    }
  })
}

const InternalSegmentedOption = defineComponent<{
  prefixCls: string
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  data: SegmentedLabeledOption
  disabled?: boolean
  checked: boolean
  label: VueNode
  title?: string
  value: SegmentedRawOption
  name?: string
  onChange: (e: ChangeEvent, value: SegmentedRawOption) => void
  onFocus: (e: FocusEvent) => void
  onBlur: (e: FocusEvent) => void
  onKeyDown: (e: KeyboardEvent) => void
  onKeyUp: (e: KeyboardEvent) => void
  onMouseDown: () => void
  itemRender?: ItemRender
}>(
  // @ts-expect-error this
  (props, { attrs }) => {
    const handleChange = (event: Event) => {
      if (props.disabled) {
        return
      }
      props?.onChange?.(event as any, props.value)
    }
    return () => {
      const {
        prefixCls,
        disabled,
        onMouseDown,
        onKeyDown,
        onKeyUp,
        onBlur,
        onFocus,
        name,
        checked,
        classNames: segmentedClassNames,
        styles,
        label,
        title,
        data,
        itemRender,
      } = props
      const itemContent = (
        <label
          class={clsx(
            (attrs as any).class,
            {
              [`${prefixCls}-item-disabled`]: disabled,
            },
          )}
          style={(attrs as any).style}
          onMousedown={onMouseDown}
        >
          <input
            name={name}
            class={`${prefixCls}-item-input`}
            type="radio"
            disabled={disabled}
            checked={checked}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeydown={onKeyDown}
            onKeyup={onKeyUp}
          />
          <div
            class={clsx(`${prefixCls}-item-label`, segmentedClassNames?.label)}
            title={title}
            role="radio"
            aria-checked={checked}
            style={styles?.label}
          >
            {typeof label === 'function' ? (label as any)?.() : label}
          </div>
        </label>
      )
      return itemRender?.(itemContent, { item: data })
    }
  },
)

const defaults = {
  prefixCls: 'vc-segmented',
  options: [],
  motionName: 'thumb-motion',
  itemRender: (node: VueNode) => node,
} as any
const Segmented = defineComponent<SegmentedProps>(
  (props = defaults, { attrs }) => {
    const containerRef = ref<HTMLDivElement>()
    const segmentedOptions = computed(() => {
      return normalizeOptions(props?.options ?? [])
    })

    // Note: We should not auto switch value when value not exist in options
    // which may break single source of truth.
    const rawValue = shallowRef(props?.value ?? props?.defaultValue ?? props?.options?.[0])
    watch(() => props.value, () => {
      rawValue.value = props.value as any
    })
    // ======================= Change ========================
    const thumbShow = shallowRef(false)
    const handleChange = (_event: ChangeEvent, val: SegmentedRawOption) => {
      rawValue.value = val
      props?.onChange?.(val)
    }

    // ======================= Focus ========================

    const isKeyboard = shallowRef(false)
    const isFocused = shallowRef(true)
    const handleFocus = () => {
      isFocused.value = true
    }
    const handleBlur = () => {
      isFocused.value = false
    }
    const handleMouseDown = () => {
      isKeyboard.value = false
    }
    // capture keyboard tab interaction for correct focus style
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        isKeyboard.value = true
      }
    }
    // ======================= Keyboard ========================
    const onOffset = (offset: number) => {
      const currentIndex = segmentedOptions.value.findIndex(
        option => option?.value === rawValue.value,
      )

      const total = segmentedOptions.value.length
      const nextIndex = (currentIndex + offset + total) % total
      const nextOption = segmentedOptions.value[nextIndex]
      if (nextOption) {
        rawValue.value = nextOption.value
        props?.onChange?.(nextOption.value)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          onOffset(-1)
          break
        case 'ArrowRight':
        case 'ArrowDown':
          onOffset(1)
          break
      }
    }
    return () => {
      const {
        itemRender,
        prefixCls,
        classNames: segmentedClassNames,
        styles,
        disabled,
        name,
        direction,
        vertical,
        motionName,
      } = props
      const renderOption = (segmentedOption: SegmentedLabeledOption) => {
        const { value: optionValue, disabled: optionDisabled } = segmentedOption
        return (
          <InternalSegmentedOption
            {...segmentedOption}
            name={name}
            data={segmentedOption}
            itemRender={itemRender}
            key={optionValue}
            prefixCls={prefixCls!}
            class={clsx(
              segmentedOption.class,
              `${prefixCls}-item`,
              segmentedClassNames?.item,
              {
                [`${prefixCls}-item-selected`]: optionValue === rawValue.value && !thumbShow.value,
                [`${prefixCls}-item-focused`]: isFocused.value && isKeyboard.value && optionValue === rawValue.value,
              },
            )}
            style={styles?.item}
            classNames={segmentedClassNames}
            styles={styles}
            checked={optionValue === rawValue.value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onMouseDown={handleMouseDown}
            disabled={!!disabled || !!optionDisabled}
          />
        )
      }
      const divProps = omit(attrs, ['class', 'style'])
      const attrClass = (attrs as any).class
      const attrStyle = (attrs as any).style

      return (
        <div
          role="radiogroup"
          aria-label="segmented control"
          tabindex={disabled ? undefined : 0}
          style={attrStyle}
          {...divProps}
          class={clsx(
            prefixCls,
            {
              [`${prefixCls}-rtl`]: direction === 'rtl',
              [`${prefixCls}-disabled`]: disabled,
              [`${prefixCls}-vertical`]: vertical,
            },
            attrClass,
          )}
          ref={containerRef}
        >
          <div class={`${prefixCls}-group`}>
            <MotionThumb
              vertical={vertical}
              prefixCls={prefixCls!}
              value={rawValue.value as any}
              containerRef={containerRef.value!}
              motionName={`${prefixCls}-${motionName}`}
              direction={direction}
              getValueIndex={val =>
                segmentedOptions.value.findIndex(n => n.value === val)}
              onMotionStart={() => {
                thumbShow.value = true
              }}
              onMotionEnd={() => {
                thumbShow.value = false
              }}
            />
            {segmentedOptions.value.map(renderOption)}
          </div>
        </div>
      )
    }
  },
  {
    name: 'Segmented',
  },
)
export default Segmented
