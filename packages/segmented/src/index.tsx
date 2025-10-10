import type { ChangeEvent } from '@v-c/util/dist/EventInterface'
import type { CustomSlotsType, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, ExtractPropTypes, FunctionalComponent, PropType } from 'vue'
import { initDefaultProps } from '@v-c/util/dist/props-util'
import { arrayType, booleanType, functionType, someType, stringType } from '@v-c/util/dist/type'
import { classNames } from '@v-c/util'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import MotionThumb from './MotionThumb'

export type SegmentedValue = string | number
export type segmentedSize = 'large' | 'small'
export interface SegmentedBaseOption {
  value: string | number
  disabled?: boolean
  payload?: any
  /**
   * html `title` property for label
   */
  title?: string
  className?: string
}
export interface SegmentedOption extends SegmentedBaseOption {
  label?: VueNode | ((option: SegmentedBaseOption) => VueNode)
}

function getValidTitle(option: SegmentedOption) {
  if (typeof option.title !== 'undefined') {
    return option.title
  }

  // read `label` when title is `undefined`
  if (typeof option.label !== 'object') {
    return option.label?.toString()
  }
}

function normalizeOptions(options: (SegmentedOption | string | number)[]) {
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
      value: option as unknown as SegmentedBaseOption['value'],
    }
  })
}
export function segmentedProps() {
  return {
    'prefixCls': String,
    'options': arrayType<(SegmentedOption | string | number)[]>(),
    'block': booleanType(),
    'disabled': booleanType(),
    'size': stringType<segmentedSize>(),
    'value': { ...someType<SegmentedValue>([String, Number]), required: true },
    'motionName': String,
    'onChange': functionType<(val: SegmentedValue) => void>(),
    'onUpdate:value': functionType<(val: SegmentedValue) => void>(),
    'direction': String as PropType<'rtl' | 'ltr'>,
    'vertical': Boolean,
  }
}
export type SegmentedProps = Partial<ExtractPropTypes<ReturnType<typeof segmentedProps>>>

const InternalSegmentedOption: FunctionalComponent<
  SegmentedOption & {
    prefixCls: string
    checked: boolean
    onChange: (_event: ChangeEvent, val: SegmentedValue) => void
    class: string
    onFocus: () => void
    onBlur: () => void
    onKeydown: (e: KeyboardEvent) => void
    onKeyup: (e: KeyboardEvent) => void
    onMousedown: (e: MouseEvent) => void
  }
> = (props, { slots, emit, attrs }) => {
  const {
    value,
    disabled,
    payload,
    title,
    prefixCls,
    label = slots.label,
    checked,
    onKeyup,
    onFocus,
    onBlur,
    onKeydown,
    onMousedown,
  } = props
  const handleChange = (event: Event) => {
    if (disabled) {
      return
    }

    emit('change', event, value)
  }

  return (
    <label
      class={classNames(
        {
          [`${prefixCls}-item-disabled`]: disabled,
        },
        [attrs.class],
      )}
      onMousedown={onMousedown}
    >
      <input
        class={`${prefixCls}-item-input`}
        type="radio"
        disabled={disabled}
        checked={checked}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeydown={onKeydown}
        onKeyup={onKeyup}
      />
      <div class={`${prefixCls}-item-label`} title={typeof title === 'string' ? title : ''}>
        {typeof label === 'function'
          ? label({
              value,
              disabled,
              payload,
              title,
            })
          : label ?? value}
      </div>
    </label>
  )
}
InternalSegmentedOption.inheritAttrs = false

export default defineComponent({
  name: 'Segmented',
  inheritAttrs: false,
  props: initDefaultProps(segmentedProps(), {
    options: [],
    motionName: 'thumb-motion',
  }),
  slots: Object as CustomSlotsType<{
    label: SegmentedBaseOption
  }>,
  setup(props, { emit, slots, attrs }) {
    const containerRef = ref<HTMLDivElement>()
    const thumbShow = shallowRef(false)

    const segmentedOptions = computed(() => normalizeOptions(props.options))
    const handleChange = (_event: ChangeEvent, val: SegmentedValue) => {
      if (props.disabled) {
        return
      }
      emit('update:value', val)
      emit('change', val)
    }
    // ======================= Focus ========================
    const isKeyboard = ref(false)
    const isFocused = ref(false)

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
        option => option.value === props.value,
      )

      const total = segmentedOptions.value.length
      const nextIndex = (currentIndex + offset + total) % total

      const nextOption = segmentedOptions.value[nextIndex]
      if (nextOption) {
        emit('update:value', nextOption.value)
        emit('change', nextOption.value)
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
        prefixCls = 'vc-segmented',
        direction,
        vertical,
        disabled,
        value,
        motionName = 'thumb-motion',
      } = props

      return (
        <div
          role="radiogroup"
          aria-label="segmented control"
          tabindex={disabled ? undefined : 0}
          style={{ ...attrs.style as CSSProperties }}
          {...attrs}
          class={classNames(
            prefixCls,
            {
              [`${prefixCls}-rtl`]: direction === 'rtl',
              [`${prefixCls}-disabled`]: disabled,
              [`${prefixCls}-vertical`]: vertical,
            },
            [attrs.class],
          )}
          ref={containerRef}
        >
          <div class={`${prefixCls}-group`}>
            <MotionThumb
              containerRef={containerRef}
              prefixCls={prefixCls}
              value={value}
              motionName={`${prefixCls}-${motionName}`}
              direction={direction}
              getValueIndex={val => segmentedOptions.value.findIndex(n => n.value === val)}
              onMotionStart={() => {
                thumbShow.value = true
              }}
              onMotionEnd={() => {
                thumbShow.value = false
              }}
            />
            {segmentedOptions.value.map(segmentedOption => (
              <InternalSegmentedOption
                key={segmentedOption.value}
                prefixCls={prefixCls}
                checked={segmentedOption.value === value}
                onChange={handleChange}
                {...segmentedOption}
                class={classNames(segmentedOption.className, `${prefixCls}-item`, {
                  [`${prefixCls}-item-selected`]: segmentedOption.value === value && !thumbShow.value,
                  [`${prefixCls}-item-focused`]: isFocused.value && isKeyboard.value && segmentedOption.value === value,
                })}
                disabled={!!disabled || !!segmentedOption.disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeydown={handleKeyDown}
                onKeyup={handleKeyUp}
                onMousedown={handleMouseDown}
                v-slots={slots}
              />
            ))}
          </div>
        </div>
      )
    }
  },
})
