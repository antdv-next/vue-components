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
    const baseProps = useBaseProps()
    const selectContext = useSelectContext()

    // 从 selectInputCtx 中获取响应式值
    const prefixCls = computed(() => selectInputCtx.value?.prefixCls)
    const searchValue = computed(() => selectInputCtx.value?.searchValue)
    const activeValue = computed(() => selectInputCtx.value?.activeValue)
    const displayValues = computed(() => selectInputCtx.value?.displayValues)
    const maxLength = computed(() => selectInputCtx.value?.maxLength)
    const mode = computed(() => selectInputCtx.value?.mode)

    // 从 baseProps 中获取响应式值
    const triggerOpen = computed(() => baseProps.value?.triggerOpen)
    const rootTitle = computed(() => baseProps.value?.title)
    const showSearch = computed(() => baseProps.value?.showSearch)
    const classNames = computed(() => baseProps.value?.classNames)
    const styles = computed(() => baseProps.value?.styles)

    const inputChanged = shallowRef(false)

    const combobox = computed(() => mode.value === 'combobox')
    const displayValue = computed(() => displayValues.value?.[0])

    const mergedSearchValue = computed(() => {
      if (combobox.value && activeValue.value && !inputChanged.value && triggerOpen.value) {
        return activeValue.value
      }
      return showSearch.value ? searchValue.value : ''
    })

    const optionProps = computed(() => {
      let restProps: any = {
        className: `${prefixCls.value}-content-value`,
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
      if (rootTitle.value !== undefined) {
        restProps.title = rootTitle.value
      }
      return restProps
    })

    watch(
      () => [combobox.value, activeValue.value],
      () => {
        if (combobox.value) {
          inputChanged.value = false
        }
      },
    )

    expose()

    return () => (
      <div class={clsx(`${prefixCls.value}-content`, classNames.value?.content)} style={styles.value?.content}>
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
          maxLength={mode.value === 'combobox' ? maxLength.value : undefined}
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
