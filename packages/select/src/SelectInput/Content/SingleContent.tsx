import type { SharedContentProps } from '.'
import { clsx } from '@v-c/util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import useSelectContext from '../../SelectContext'
import { getTitle } from '../../utils/commonUtil'
import { useSelectInputContext } from '../context'
import Input from '../Input'
import Placeholder from './Placeholder'

const SingleContent = defineComponent<{ inputProps: SharedContentProps['inputProps'] }>(
  (props, { expose, attrs }) => {
    const { inputProps } = props
    const selectInputCtx = useSelectInputContext()
    const { prefixCls, searchValue, activeValue, displayValues, maxLength, mode }
      = selectInputCtx.value || {}
    const baseProps = useBaseProps()
    const { triggerOpen, title: rootTitle, showSearch, classNames, styles } = baseProps.value || {}
    const selectContext = useSelectContext()

    const inputChanged = shallowRef(false)

    const combobox = computed(() => mode === 'combobox')
    const displayValue = computed(() => displayValues?.[0])

    const mergedSearchValue = computed(() => {
      if (combobox.value && activeValue && !inputChanged.value && triggerOpen) {
        return activeValue
      }
      return showSearch ? searchValue : ''
    })

    const optionProps = computed(() => {
      let restProps: any = {
        className: `${prefixCls}-content-value`,
        style: { visibility: mergedSearchValue.value ? 'hidden' : 'visible' },
      }
      if (displayValue.value && selectContext.value?.flattenOptions) {
        const option = selectContext.value.flattenOptions.find(
          opt => opt.value === displayValue.value?.value,
        )
        if (option?.data) {
          const { label, value, className, style, key, ...rest } = option.data as any
          restProps = {
            ...restProps,
            ...rest,
            title: getTitle(option.data as any),
            className: clsx(restProps.className, className),
            style: { ...restProps.style, ...style },
          }
        }
      }
      if (displayValue.value && !restProps.title) {
        restProps.title = getTitle(displayValue.value)
      }
      if (rootTitle !== undefined) {
        restProps.title = rootTitle
      }
      return restProps
    })

    watch(
      () => [combobox.value, activeValue],
      () => {
        if (combobox.value) {
          inputChanged.value = false
        }
      },
    )

    expose()

    return () => (
      <div class={clsx(`${prefixCls}-content`, classNames?.content)} style={styles?.content}>
        {displayValue.value
          ? (
              <div {...optionProps.value}>{displayValue.value.label}</div>
            )
          : (
              <Placeholder show={!mergedSearchValue.value} />
            )}
        <Input
          {...(inputProps as any)}
          {...attrs}
          value={mergedSearchValue.value}
          maxLength={mode === 'combobox' ? maxLength : undefined}
          onInput={(e: any) => {
            inputChanged.value = true
            inputProps.onInput?.(e)
          }}
        />
      </div>
    )
  },
)

export default SingleContent
