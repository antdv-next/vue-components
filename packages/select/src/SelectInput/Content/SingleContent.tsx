import type { InputRef } from '../Input'
import type { SharedContentProps } from './index'
import { clsx } from '@v-c/util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import { useSelectContext } from '../../SelectContext'
import { getTitle } from '../../utils/commonUtil'
import { useSelectInputContext } from '../context'
import Input from '../Input'
import Placeholder from './Placeholder'

const SingleContent = defineComponent<SharedContentProps>(
  (props, { expose }) => {
    const selectInputContext = useSelectInputContext()
    const baseProps = useBaseProps()
    const selectContext = useSelectContext()

    const inputChanged = shallowRef(false)
    const combobox = computed(() => selectInputContext.value?.mode === 'combobox')
    const displayValue = computed(() => selectInputContext.value?.displayValues[0])

    // Implement the same logic as the old SingleSelector
    const mergedSearchValue = computed(() => {
      if (combobox.value && selectInputContext.value?.activeValue && !inputChanged.value && baseProps.value?.triggerOpen) {
        return selectInputContext.value.activeValue
      }
      return baseProps.value?.showSearch ? selectInputContext.value?.searchValue : ''
    })

    const optionClassName = computed(() => {
      if (displayValue.value && selectContext.value?.flattenOptions) {
        const option = selectContext.value.flattenOptions.find(opt => opt.value === displayValue.value?.value)
        if (option?.data) {
          return option.data.className || option.data.class
        }
      }
      return undefined
    })

    const optionStyle = computed(() => {
      if (displayValue.value && selectContext.value?.flattenOptions) {
        const option = selectContext.value.flattenOptions.find(opt => opt.value === displayValue.value?.value)
        if (option?.data) {
          return option.data.style
        }
      }
      return undefined
    })

    const optionTitle = computed(() => {
      let titleValue: string | undefined

      if (displayValue.value && selectContext.value?.flattenOptions) {
        const option = selectContext.value.flattenOptions.find(opt => opt.value === displayValue.value?.value)
        if (option?.data) {
          titleValue = getTitle(option.data)
        }
      }

      if (displayValue.value && !titleValue) {
        titleValue = getTitle(displayValue.value)
      }

      if (baseProps.value?.title !== undefined) {
        titleValue = baseProps.value.title
      }

      return titleValue
    })

    const hasOptionStyle = computed(() => !!optionClassName.value || !!optionStyle.value)

    watch(
      [combobox, () => selectInputContext.value?.activeValue],
      () => {
        if (combobox.value) {
          inputChanged.value = false
        }
      },
      {
        immediate: true,
      },
    )
    const inputRef = shallowRef<InputRef>()
    expose({
      input: computed(() => inputRef.value?.input),
    })
    return () => {
      const { prefixCls, mode, maxLength } = selectInputContext.value ?? {}
      const { classNames, styles } = baseProps.value ?? {}
      const { inputProps } = props

      // Render value
      const renderValue = displayValue.value
        ? (hasOptionStyle.value
            ? (
                <div
                  class={clsx(`${prefixCls}-content-value`, optionClassName.value)}
                  style={{
                    ...(mergedSearchValue.value ? { visibility: 'hidden' as const } : {}),
                    ...optionStyle.value,
                  }}
                  title={optionTitle.value}
                >
                  {displayValue.value.label}
                </div>
              )
            : displayValue.value.label)
        : (<Placeholder show={!mergedSearchValue.value} />)

      return (
        <div
          class={clsx(
            `${prefixCls}-content`,
            displayValue.value && `${prefixCls}-content-has-value`,
            mergedSearchValue.value && `${prefixCls}-content-has-search-value`,
            hasOptionStyle.value && `${prefixCls}-content-has-option-style`,
            classNames?.content,
          )}
          style={styles?.content}
          title={hasOptionStyle.value ? undefined : optionTitle.value}
        >
          {renderValue}
          <Input
            {...inputProps as any}
            value={mergedSearchValue.value}
            maxLength={mode === 'combobox' ? maxLength : undefined}
            onChange={(e: any) => {
              inputChanged.value = true
              inputProps.onChange?.(e)
            }}
            ref={inputRef}
          />
        </div>
      )
    }
  },
  {
    name: 'SingleContent',
    inheritAttrs: false,
  },
)
export default SingleContent
