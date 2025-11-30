import type { SharedContentProps } from '.'
import type { CustomTagProps, RenderNode } from '../../BaseSelect'
import type { DisplayValueType, RawValueType } from '../../interface'
import Overflow from '@v-c/overflow'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import TransBtn from '../../TransBtn'
import { getTitle } from '../../utils/commonUtil'
import { useSelectInputContext } from '../context'
import Input from '../Input'
import Placeholder from './Placeholder'

function itemKey(value: DisplayValueType) {
  return value.key ?? value.value
}

function onPreventMouseDown(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

export default defineComponent<
  { inputProps: SharedContentProps['inputProps'] }
>(
  (props, { expose }) => {
    const { inputProps } = props
    const selectInputContext = useSelectInputContext()
    const baseProps = useBaseProps()

    // 从 selectInputContext 中获取响应式值
    const prefixCls = computed(() => selectInputContext.value?.prefixCls)
    const displayValues = computed(() => selectInputContext.value?.displayValues ?? [])
    const searchValue = computed(() => selectInputContext.value?.searchValue)
    const mode = computed(() => selectInputContext.value?.mode)
    const onSelectorRemove = computed(() => selectInputContext.value?.onSelectorRemove)
    const removeIconFromContext = computed(() => selectInputContext.value?.removeIcon)

    // 从 baseProps 中获取响应式值
    const disabled = computed(() => baseProps.value?.disabled)
    const showSearch = computed(() => baseProps.value?.showSearch)
    const triggerOpen = computed(() => baseProps.value?.triggerOpen)
    const toggleOpen = computed(() => baseProps.value?.toggleOpen)
    const autoClearSearchValue = computed(() => baseProps.value?.autoClearSearchValue)
    const tagRenderFromContext = computed(() => baseProps.value?.tagRender)
    const maxTagPlaceholderFromContext = computed(() => baseProps.value?.maxTagPlaceholder)
    const maxTagTextLength = computed(() => baseProps.value?.maxTagTextLength)
    const maxTagCount = computed(() => baseProps.value?.maxTagCount)
    const classNames = computed(() => baseProps.value?.classNames)
    const styles = computed(() => baseProps.value?.styles)

    const selectionItemPrefixCls = computed(() => `${prefixCls.value}-selection-item`)

    const inputValue = computed(() => {
      let computedSearchValue = searchValue.value
      if (!triggerOpen.value && mode.value === 'multiple' && autoClearSearchValue.value !== false) {
        computedSearchValue = ''
      }
      return showSearch.value ? computedSearchValue || '' : ''
    })

    const inputEditable = computed(() => showSearch.value && !disabled.value)

    const removeIcon = computed<RenderNode>(() => removeIconFromContext.value ?? '×')

    const maxTagPlaceholder = computed(() =>
      maxTagPlaceholderFromContext.value
      ?? ((omittedValues: DisplayValueType[]) => `+ ${omittedValues.length} ...`),
    )

    const tagRender = computed<((props: CustomTagProps) => any) | undefined>(
      () => tagRenderFromContext.value,
    )

    const onToggleOpen = (newOpen?: boolean) => {
      toggleOpen.value?.(newOpen)
    }

    const onRemove = (value: DisplayValueType) => {
      onSelectorRemove.value?.(value)
    }

    const defaultRenderSelector = (
      item: DisplayValueType,
      content: any,
      itemDisabled: boolean,
      closable?: boolean,
      onClose?: (event?: MouseEvent) => void,
    ) => (
      <span
        title={getTitle(item)}
        class={clsx(
          selectionItemPrefixCls.value,
          {
            [`${selectionItemPrefixCls.value}-disabled`]: itemDisabled,
          },
          classNames.value?.item,
        )}
        style={styles.value?.item}
      >
        <span
          class={clsx(`${selectionItemPrefixCls.value}-content`, classNames.value?.itemContent)}
          style={styles.value?.itemContent}
        >
          {content}
        </span>
        {closable && (
          <TransBtn
            className={clsx(`${selectionItemPrefixCls.value}-remove`, classNames.value?.itemRemove)}
            style={styles.value?.itemRemove}
            onMouseDown={onPreventMouseDown}
            onClick={onClose as any}
            customizeIcon={removeIcon.value}
          >
            ×
          </TransBtn>
        )}
      </span>
    )

    const customizeRenderSelector = (
      value: RawValueType,
      content: any,
      itemDisabled: boolean,
      closable?: boolean,
      onClose?: (event?: MouseEvent) => void,
      isMaxTag?: boolean,
      info?: { index: number },
    ) => {
      const onMouseDown = (e: MouseEvent) => {
        onPreventMouseDown(e)
        onToggleOpen(!triggerOpen.value)
      }
      return (
        <span onMousedown={onMouseDown}>
          {tagRender.value?.({
            label: content,
            value,
            index: info!.index!,
            disabled: itemDisabled,
            closable,
            onClose,
            isMaxTag: !!isMaxTag,
          } as any)}
        </span>
      )
    }

    const renderItem = (valueItem: DisplayValueType, info: { index: number }) => {
      const { disabled: itemDisabled, label, value } = valueItem
      const closable = !disabled.value && !itemDisabled

      let displayLabel: any = label

      if (typeof maxTagTextLength.value === 'number') {
        if (typeof label === 'string' || typeof label === 'number') {
          const strLabel = String(displayLabel)
          if (strLabel.length > maxTagTextLength.value) {
            displayLabel = `${strLabel.slice(0, maxTagTextLength.value)}...`
          }
        }
      }

      const onClose = (event?: MouseEvent) => {
        if (event) {
          event.stopPropagation()
        }
        onRemove(valueItem)
      }

      return typeof tagRender.value === 'function'
        ? customizeRenderSelector(value as any, displayLabel, !!itemDisabled, closable, onClose, undefined, info)
        : defaultRenderSelector(valueItem, displayLabel, !!itemDisabled, closable, onClose)
    }

    const renderRest = (omittedValues: DisplayValueType[]) => {
      if (!displayValues.value.length) {
        return null
      }
      const content
        = typeof maxTagPlaceholder.value === 'function'
          ? maxTagPlaceholder.value(omittedValues)
          : maxTagPlaceholder.value
      return typeof tagRender.value === 'function'
        ? customizeRenderSelector(undefined as any, content, false, false, undefined, true)
        : defaultRenderSelector({ title: content } as any, content, false)
    }

    expose()

    return () => {
      return (
        <Overflow
          prefixCls={`${prefixCls.value}-content`}
          class={classNames.value?.content}
          style={styles.value?.content}
          prefix={!displayValues.value.length && (!searchValue.value || !triggerOpen.value) ? <Placeholder /> : null}
          data={displayValues.value}
          renderItem={renderItem}
          renderRest={renderRest}
          suffix={(
            <Input
              disabled={disabled.value}
              readOnly={!inputEditable.value}
              {...(inputProps as any)}
              value={inputValue.value || ''}
              syncWidth
            />
          )}
          itemKey={itemKey as any}
          maxCount={maxTagCount.value as any}
        />
      )
    }
  },
)
