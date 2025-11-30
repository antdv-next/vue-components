import Overflow from '@v-c/overflow'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import Input from '../Input'
import { useSelectInputContext } from '../context'
import type { SharedContentProps } from '.'
import type { DisplayValueType, RawValueType } from '../../interface'
import type { RenderNode, CustomTagProps } from '../../BaseSelect'
import TransBtn from '../../TransBtn'
import { getTitle } from '../../utils/commonUtil'
import useBaseProps from '../../hooks/useBaseProps'
import Placeholder from './Placeholder'

function itemKey(value: DisplayValueType) {
  return value.key ?? value.value
}

const onPreventMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

export default defineComponent<{ inputProps: SharedContentProps['inputProps'] }>(
  (props, { expose }) => {
    const { inputProps } = props
    const {
      prefixCls,
      displayValues,
      searchValue,
      mode,
      onSelectorRemove,
      removeIcon: removeIconFromContext,
    } = useSelectInputContext().value || {}
    const {
      disabled,
      showSearch,
      triggerOpen,
      toggleOpen,
      autoClearSearchValue,
      tagRender: tagRenderFromContext,
      maxTagPlaceholder: maxTagPlaceholderFromContext,
      maxTagTextLength,
      maxTagCount,
      classNames,
      styles,
    } = useBaseProps().value || {}

    const selectionItemPrefixCls = `${prefixCls}-selection-item`

    let computedSearchValue = searchValue
    if (!triggerOpen && mode === 'multiple' && autoClearSearchValue !== false) {
      computedSearchValue = ''
    }

    const inputValue = showSearch ? computedSearchValue || '' : ''
    const inputEditable: boolean = showSearch && !disabled

    const removeIcon: RenderNode = removeIconFromContext ?? '×'
    const maxTagPlaceholder:
      | any
      | ((omittedValues: DisplayValueType[]) => any) =
      maxTagPlaceholderFromContext ??
      ((omittedValues: DisplayValueType[]) => `+ ${omittedValues.length} ...`)
    const tagRender: ((props: CustomTagProps) => any) | undefined = tagRenderFromContext

    const onToggleOpen = (newOpen?: boolean) => {
      toggleOpen?.(newOpen)
    }

    const onRemove = (value: DisplayValueType) => {
      onSelectorRemove?.(value)
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
          selectionItemPrefixCls,
          {
            [`${selectionItemPrefixCls}-disabled`]: itemDisabled,
          },
          classNames?.item,
        )}
        style={styles?.item}
      >
        <span
          class={clsx(`${selectionItemPrefixCls}-content`, classNames?.itemContent)}
          style={styles?.itemContent}
        >
          {content}
        </span>
        {closable && (
          <TransBtn
            className={clsx(`${selectionItemPrefixCls}-remove`, classNames?.itemRemove)}
            style={styles?.itemRemove}
            onMouseDown={onPreventMouseDown}
            onClick={onClose as any}
            customizeIcon={removeIcon}
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
        onToggleOpen(!triggerOpen)
      }
      return (
        <span onMousedown={onMouseDown}>
          {tagRender?.({
            label: content,
            value,
            index: info?.index,
            disabled: itemDisabled,
            closable,
            onClose,
            isMaxTag: !!isMaxTag,
          })}
        </span>
      )
    }

    const renderItem = (valueItem: DisplayValueType, info: { index: number }) => {
      const { disabled: itemDisabled, label, value } = valueItem
      const closable = !disabled && !itemDisabled

      let displayLabel: any = label

      if (typeof maxTagTextLength === 'number') {
        if (typeof label === 'string' || typeof label === 'number') {
          const strLabel = String(displayLabel)
          if (strLabel.length > maxTagTextLength) {
            displayLabel = `${strLabel.slice(0, maxTagTextLength)}...`
          }
        }
      }

      const onClose = (event?: MouseEvent) => {
        if (event) {
          event.stopPropagation()
        }
        onRemove(valueItem)
      }

      return typeof tagRender === 'function'
        ? customizeRenderSelector(value as any, displayLabel, itemDisabled, closable, onClose, undefined, info)
        : defaultRenderSelector(valueItem, displayLabel, itemDisabled, closable, onClose)
    }

    const renderRest = (omittedValues: DisplayValueType[]) => {
      if (!displayValues.length) {
        return null
      }
      const content =
        typeof maxTagPlaceholder === 'function'
          ? maxTagPlaceholder(omittedValues)
          : maxTagPlaceholder
      return typeof tagRender === 'function'
        ? customizeRenderSelector(undefined as any, content, false, false, undefined, true)
        : defaultRenderSelector({ title: content } as any, content, false)
    }

    expose()

    return (
      <Overflow
        prefixCls={`${prefixCls}-content`}
        class={classNames?.content}
        style={styles?.content}
        prefix={!displayValues.length && (!searchValue || !triggerOpen) ? <Placeholder /> : null}
        data={displayValues}
        renderItem={renderItem}
        renderRest={renderRest}
        suffix={
          <Input
            disabled={disabled}
            readOnly={!inputEditable}
            {...(inputProps as any)}
            value={inputValue || ''}
            syncWidth
          />
        }
        itemKey={itemKey as any}
        maxCount={maxTagCount as any}
      />
    )
  },
)
