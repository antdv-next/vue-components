import type { VueNode } from '@v-c/util/dist/type'
import type { CustomTagProps, RenderNode } from '../../BaseSelect'
import type { DisplayValueType, RawValueType } from '../../interface'
import type { SharedContentProps } from './index'
import Overflow from '@v-c/overflow'
import { clsx } from '@v-c/util'
import { computed, defineComponent, shallowRef } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import TransBtn from '../../TransBtn'
import { getTitle } from '../../utils/commonUtil'
import { useSelectInputContext } from '../context'
import Input from '../Input'
import Placeholder from './Placeholder'

function itemKey(value: DisplayValueType) {
  return value.key ?? value.value ?? ''
}

function onPreventMouseDown(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

const MultipleContent = defineComponent<SharedContentProps>(
  (props) => {
    const selectInputContext = useSelectInputContext()
    const baseProps = useBaseProps()

    const inputRef = shallowRef<HTMLInputElement>()

    // ===================== Computed Values ======================
    const prefixCls = computed(() => selectInputContext.value?.prefixCls ?? '')
    const displayValues = computed(() => selectInputContext.value?.displayValues ?? [])
    const searchValue = computed(() => selectInputContext.value?.searchValue ?? '')
    const mode = computed(() => selectInputContext.value?.mode)
    const removeIconFromContext = computed(() => selectInputContext.value?.removeIcon)
    const onSelectorRemove = computed(() => selectInputContext.value?.onSelectorRemove)

    const disabled = computed(() => baseProps.value?.disabled ?? false)
    const showSearch = computed(() => baseProps.value?.showSearch ?? false)
    const triggerOpen = computed(() => baseProps.value?.triggerOpen ?? false)
    const toggleOpen = computed(() => baseProps.value?.toggleOpen)
    const autoClearSearchValue = computed(() => baseProps.value?.autoClearSearchValue)
    const tagRenderFromContext = computed(() => baseProps.value?.tagRender)
    const maxTagPlaceholderFromContext = computed(() => baseProps.value?.maxTagPlaceholder)
    const maxTagTextLength = computed(() => baseProps.value?.maxTagTextLength)
    const maxTagCount = computed(() => baseProps.value?.maxTagCount)
    const classNamesConfig = computed(() => baseProps.value?.classNames)
    const stylesConfig = computed(() => baseProps.value?.styles)

    const selectionItemPrefixCls = computed(() => `${prefixCls.value}-selection-item`)

    // ===================== Search ======================
    // Apply autoClearSearchValue logic: when dropdown is closed and autoClearSearchValue is not false (default true), clear search value
    const computedSearchValue = computed(() => {
      if (!triggerOpen.value && mode.value === 'multiple' && autoClearSearchValue.value !== false) {
        return ''
      }
      return searchValue.value
    })

    const inputValue = computed(() => showSearch.value ? (computedSearchValue.value || '') : '')
    const inputEditable = computed(() => showSearch.value && !disabled.value)

    // Props from context with safe defaults
    const removeIcon = computed<RenderNode>(() => removeIconFromContext.value ?? '×')
    const maxTagPlaceholder = computed<VueNode | ((omittedValues: DisplayValueType[]) => VueNode)>(() =>
      maxTagPlaceholderFromContext.value
      ?? ((omittedValues: DisplayValueType[]) => `+ ${omittedValues.length} ...`),
    )
    const tagRender = computed<((props: CustomTagProps) => VueNode) | undefined>(() => tagRenderFromContext.value)

    const onToggleOpen = (newOpen?: boolean) => {
      toggleOpen.value?.(newOpen)
    }

    const onRemove = (value: DisplayValueType) => {
      onSelectorRemove.value?.(value)
    }

    // ======================== Item ========================
    // >>> Render Selector Node. Includes Item & Rest
    const defaultRenderSelector = (
      item: DisplayValueType,
      content: VueNode,
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
          classNamesConfig.value?.item,
        )}
        style={stylesConfig.value?.item}
      >
        <span
          class={clsx(`${selectionItemPrefixCls.value}-content`, classNamesConfig.value?.itemContent)}
          style={stylesConfig.value?.itemContent}
        >
          {content}
        </span>
        {closable && (
          <TransBtn
            className={clsx(`${selectionItemPrefixCls.value}-remove`, classNamesConfig.value?.itemRemove)}
            style={stylesConfig.value?.itemRemove}
            onMouseDown={onPreventMouseDown}
            onClick={onClose}
            customizeIcon={removeIcon.value}
          >
            ×
          </TransBtn>
        )}
      </span>
    )

    const customizeRenderSelector = (
      value: RawValueType | undefined,
      content: VueNode,
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
            index: info?.index ?? 0,
            disabled: itemDisabled,
            closable: !!closable,
            onClose: onClose as any,
            isMaxTag: !!isMaxTag,
          })}
        </span>
      )
    }

    // ====================== Overflow ======================
    const renderItem = (valueItem: DisplayValueType, info: { index: number }) => {
      const { disabled: itemDisabled, label, value } = valueItem
      const closable = !disabled.value && !itemDisabled

      let displayLabel: VueNode = label

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
        ? customizeRenderSelector(
            value,
            displayLabel,
            !!itemDisabled,
            closable,
            onClose,
            undefined,
            info,
          )
        : defaultRenderSelector(valueItem, displayLabel, !!itemDisabled, closable, onClose)
    }

    const renderRest = (omittedValues: DisplayValueType[]) => {
      // https://github.com/ant-design/ant-design/issues/48930
      if (!displayValues.value.length) {
        return null
      }
      const content
        = typeof maxTagPlaceholder.value === 'function'
          ? (maxTagPlaceholder.value as (omittedValues: DisplayValueType[]) => VueNode)(omittedValues)
          : maxTagPlaceholder.value
      return typeof tagRender.value === 'function'
        ? customizeRenderSelector(undefined, content, false, false, undefined, true)
        : defaultRenderSelector({ title: content }, content, false)
    }

    return () => {
      const { inputProps } = props

      // ======================= Render =======================
      const prefixNode = !displayValues.value.length && (!searchValue.value || !triggerOpen.value)
        ? () => <Placeholder />
        : null

      const suffixNode = () => (
        <Input
          ref={inputRef}
          disabled={disabled.value}
          readOnly={!inputEditable.value}
          {...inputProps as any}
          value={inputValue.value || ''}
          syncWidth
        />
      )

      return (
        <Overflow
          prefixCls={`${prefixCls.value}-content`}
          class={classNamesConfig.value?.content}
          style={stylesConfig.value?.content}
          prefix={prefixNode}
          data={displayValues.value}
          renderItem={renderItem}
          renderRest={renderRest}
          suffix={suffixNode}
          itemKey={itemKey}
          maxCount={maxTagCount.value}
        />
      )
    }
  },
  {
    name: 'MultipleContent',
    inheritAttrs: false,
  },
)

export default MultipleContent
