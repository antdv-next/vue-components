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

    // Extract option props, excluding label and value, and handle className/style merging
    const optionProps = computed(() => {
      let restProps: Record<string, any> = {
        class: `${selectInputContext.value?.prefixCls}-content-value`,
        style: {
          visibility: mergedSearchValue.value ? 'hidden' : 'visible',
        },
      }
      if (displayValue.value && selectContext.value?.flattenOptions) {
        const option = selectContext.value.flattenOptions.find(opt => opt.value === displayValue.value?.value)
        if (option?.data) {
          const { label, value, className, style, key, ...rest } = option.data
          restProps = {
            ...restProps,
            ...rest,
            title: getTitle(option.data),
            class: clsx(restProps.className, className),
            style: { ...restProps.style, ...style },
          }
        }
      }

      if (displayValue.value && !restProps.title) {
        restProps.title = getTitle(displayValue.value)
      }
      if (baseProps.value?.title !== undefined) {
        restProps.title = baseProps.value.title
      }
      return restProps
    })

    watch(
      [combobox, () => selectInputContext.value?.displayValues],
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
      return (
        <div
          class={clsx(
            `${prefixCls}-content`,
            classNames?.content,
          )}
          style={styles?.content}
        >
          {displayValue.value
            ? (<div {...optionProps.value}>{displayValue.value.label}</div>)
            : (<Placeholder show={!mergedSearchValue.value} />)}

          <Input
            {...inputProps as any}
            value={mergedSearchValue.value}
            maxLength={mode === 'combobox' ? maxLength : undefined}
            onChange={(e: any) => {
              inputChanged.value = true
              inputProps.onChange?.(e)
              inputProps.onInput?.(e)
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
