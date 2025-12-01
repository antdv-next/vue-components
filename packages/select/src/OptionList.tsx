import type { FlattenOptionData } from './interface'
import type { BaseOptionType, RawValueType } from './Select'
import { clsx } from '@v-c/util'
import KeyCode from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import List from '@v-c/virtual-list'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import useBaseProps from './hooks/useBaseProps'
import useSelectContext from './SelectContext'
import TransBtn from './TransBtn'
import { isPlatformMac } from './utils/platformUtil'
import { isValidCount } from './utils/valueUtil'

export interface OptionListProps {}

export interface RefOptionListProps {
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  scrollTo?: (args: number | any) => void
}

function isTitleType(content: any) {
  return typeof content === 'string' || typeof content === 'number'
}

const OptionList = defineComponent<OptionListProps>((_props, { expose }) => {
  const baseProps = useBaseProps()
  const base = computed(() => (baseProps.value || {}) as any)
  const selectCtx = useSelectContext()
  const select = computed(() => (selectCtx.value || {}) as any)

  const itemPrefixCls = computed(() => `${base.value.prefixCls}-item`)

  // const memoFlattenOptions = useMemo<any[]>(
  //   () => select.value.flattenOptions || [],
  //   [() => base.value.open, () => select.value.flattenOptions],
  //   (prev: any[], next: any[]) => next[0] && prev[1] !== next[1],
  // )
  const memoFlattenOptions = computed<any[]>(() => {
    return select.value?.flattenOptions || []
  })

  const listRef = shallowRef<any>()

  const overMaxCount = computed<boolean>(
    () =>
      base.value.multiple
      && isValidCount(select.value.maxCount)
      && select.value.rawValues?.size >= select.value.maxCount,
  )

  const onListMouseDown = (event: MouseEvent) => {
    event.preventDefault()
  }

  const scrollIntoView = (args: number | any) => {
    listRef.value?.scrollTo(typeof args === 'number' ? { index: args } : args)
  }

  const isSelected = (value: RawValueType) => {
    if (base.value.mode === 'combobox') {
      return false
    }
    return select.value.rawValues?.has(value)
  }

  const getEnabledActiveIndex = (index: number, offset: number = 1): number => {
    const len = memoFlattenOptions.value.length
    for (let i = 0; i < len; i += 1) {
      const current = (index + i * offset + len) % len
      const { group, data } = memoFlattenOptions.value[current] || {}
      if (!group && !(data as any)?.disabled && (isSelected((data as any).value) || !overMaxCount.value)) {
        return current
      }
    }
    return -1
  }

  const activeIndex = shallowRef<number>(getEnabledActiveIndex(0))
  const setActive = (index: number, fromKeyboard = false) => {
    activeIndex.value = index
    const info = { source: fromKeyboard ? ('keyboard' as const) : ('mouse' as const) }
    const flattenItem = memoFlattenOptions.value[index]
    if (!flattenItem) {
      select.value.onActiveValue?.(null as any, -1, info)
      return
    }
    select.value.onActiveValue?.(flattenItem.value as any, index, info)
  }

  watch(
    () => [memoFlattenOptions.value.length, base.value.searchValue],
    () => {
      setActive(select.value.defaultActiveFirstOption !== false ? getEnabledActiveIndex(0) : -1)
    },
    { immediate: true },
  )

  const isAriaSelected = (value: RawValueType) => {
    if (base.value.mode === 'combobox') {
      return String(value).toLowerCase() === ((base.value.searchValue || '') as any).toLowerCase()
    }
    return select.value.rawValues?.has(value)
  }

  watch(
    () => [base.value.open, base.value.searchValue],
    ([nextOpen]) => {
      let timeoutId: any
      if (!base.value.multiple && nextOpen && select.value.rawValues?.size === 1) {
        const value: RawValueType = Array.from(select.value.rawValues as any)[0] as RawValueType
        const index = memoFlattenOptions.value.findIndex(({ data }: any) =>
          base.value.searchValue
            ? String((data as any).value).startsWith(base.value.searchValue as any)
            : (data as any).value === value,
        )
        if (index !== -1) {
          setActive(index)
          timeoutId = setTimeout(() => {
            scrollIntoView(index)
          })
        }
      }
      if (nextOpen) {
        listRef.value?.scrollTo(undefined)
      }
      return () => clearTimeout(timeoutId)
    },
  )

  const onSelectValue = (value: RawValueType | undefined) => {
    if (value !== undefined) {
      select.value.onSelect?.(value, { selected: !select.value.rawValues?.has(value) })
    }
    if (!base.value.multiple) {
      base.value.toggleOpen?.(false)
    }
  }

  expose({
    onKeyDown: (event: KeyboardEvent) => {
      const { which, ctrlKey } = event as any
      switch (which) {
        case KeyCode.N:
        case KeyCode.P:
        case KeyCode.UP:
        case KeyCode.DOWN: {
          let offset = 0
          if (which === KeyCode.UP) {
            offset = -1
          }
          else if (which === KeyCode.DOWN) {
            offset = 1
          }
          else if (isPlatformMac() && ctrlKey) {
            if (which === KeyCode.N) {
              offset = 1
            }
            else if (which === KeyCode.P) {
              offset = -1
            }
          }
          if (offset !== 0) {
            const nextActiveIndex = getEnabledActiveIndex(activeIndex.value + offset, offset)
            scrollIntoView(nextActiveIndex)
            setActive(nextActiveIndex, true)
          }
          break
        }
        case KeyCode.TAB:
        case KeyCode.ENTER: {
          const item = memoFlattenOptions.value[activeIndex.value]
          if (!item || (item.data as any).disabled) {
            return onSelectValue(undefined)
          }
          if (!overMaxCount.value || select.value.rawValues?.has(item.value as any)) {
            onSelectValue(item.value as any)
          }
          else {
            onSelectValue(undefined)
          }
          if (base.value.open) {
            event.preventDefault()
          }
          break
        }
        case KeyCode.ESC: {
          base.value.toggleOpen?.(false)
          if (base.value.open) {
            event.stopPropagation()
          }
        }
      }
    },
    onKeyUp: () => {},
    scrollTo: (index) => {
      scrollIntoView(index as any)
    },
  } as RefOptionListProps)

  return () => {
    if (!memoFlattenOptions.value.length) {
      return (
        <div
          role="listbox"
          id={`${base.value.id}_list`}
          class={`${itemPrefixCls.value}-empty`}
          onMousedown={onListMouseDown}
        >
          {base.value.notFoundContent}
        </div>
      )
    }

    const omitFieldNameList = Object.keys(select.value.fieldNames || {}).map(
      key => (select.value.fieldNames as any)[key],
    )
    const getLabel = (item: Record<string, any>) => item.label

    const getItemAriaProps = (item: FlattenOptionData<BaseOptionType>, index: number) => {
      const { group } = item
      return {
        role: group ? 'presentation' : 'option',
        id: `${base.value.id}_list_${index}`,
      }
    }

    const renderItem = (index: number) => {
      const item = memoFlattenOptions.value[index]
      if (!item)
        return null
      const itemData = (item as any).data || {}
      const { value } = itemData
      const { group } = item
      const attrs = pickAttrs(itemData, true)
      const mergedLabel = getLabel(item as any)
      return item
        ? (
            <div
              aria-label={typeof mergedLabel === 'string' && !group ? mergedLabel : null}
              {...attrs as any}
              key={index}
              {...getItemAriaProps(item, index)}
              aria-selected={isAriaSelected(value)}
            >
              {value as any}
            </div>
          )
        : null
    }

    const a11yProps = {
      role: 'listbox',
      id: `${base.value.id}_list`,
    }

    return (
      <>
        {select.value.virtual && (
          <div {...a11yProps} style={{ height: 0, width: 0, overflow: 'hidden' }}>
            {renderItem((activeIndex.value as any) - 1)}
            {renderItem(activeIndex.value as any)}
            {renderItem((activeIndex.value as any) + 1)}
          </div>
        )}
        <List
          itemKey="key"
          ref={listRef as any}
          data={memoFlattenOptions.value}
          height={select.value.listHeight}
          itemHeight={select.value.listItemHeight}
          fullHeight={false}
          {
            ...{
              onMousedown: onListMouseDown,
            } as any
          }
          onScroll={base.value.onPopupScroll as any}
          virtual={select.value.virtual}
          direction={select.value.direction as any}
          innerProps={(select.value.virtual ? null : a11yProps) as any}
          showScrollBar={base.value.showScrollBar}
          class={select.value.classNames?.popup?.list}
          style={select.value.styles?.popup?.list}
          v-slots={{
            default: ({ item, index }: any) => {
              const { group, groupOption, data, label, value } = item
              const { key } = data
              if (group) {
                const groupTitle = (data as any).title ?? (isTitleType(label) ? (label as any).toString() : undefined)
                return (
                  <div
                    class={clsx(itemPrefixCls.value, `${itemPrefixCls.value}-group`, (data as any).className)}
                    title={groupTitle}
                  >
                    {label !== undefined ? label : key}
                  </div>
                )
              }

              const { disabled, title, style, className, ...otherProps } = data as any
              const passedProps = omit(otherProps, omitFieldNameList as any)
              const selected = isSelected(value)
              const mergedDisabled = disabled || (!selected && overMaxCount.value)
              const optionPrefixCls = `${itemPrefixCls.value}-option`
              const optionClassName = clsx(
                itemPrefixCls.value,
                optionPrefixCls,
                className,
                select.value.classNames?.popup?.listItem,
                {
                  [`${optionPrefixCls}-grouped`]: groupOption,
                  [`${optionPrefixCls}-active`]: activeIndex.value === index && !mergedDisabled,
                  [`${optionPrefixCls}-disabled`]: mergedDisabled,
                  [`${optionPrefixCls}-selected`]: selected,
                },
              )
              const mergedLabel = getLabel(item as any)
              const iconVisible
                = !select.value.menuItemSelectedIcon
                  || typeof select.value.menuItemSelectedIcon === 'function'
                  || selected

              const content = typeof mergedLabel === 'number' ? mergedLabel : mergedLabel || value
              let optionTitle = isTitleType(content) ? (content as any).toString() : undefined
              if (title !== undefined) {
                optionTitle = title
              }

              return (
                <div
                  {...pickAttrs(passedProps)}
                  {...(!select.value.virtual ? getItemAriaProps(item, index) : {})}
                  aria-selected={select.value.virtual ? undefined : isAriaSelected(value)}
                  class={optionClassName}
                  title={optionTitle}
                  onMousemove={() => {
                    if (activeIndex.value === index || mergedDisabled) {
                      return
                    }
                    setActive(index)
                  }}
                  onClick={() => {
                    if (!mergedDisabled) {
                      onSelectValue(value as any)
                    }
                  }}
                  style={{ ...select.value.styles?.popup?.listItem, ...style }}
                >
                  <div class={`${optionPrefixCls}-content`}>
                    {typeof select.value.optionRender === 'function'
                      ? select.value.optionRender(item, { index })
                      : content}
                  </div>
                  {iconVisible && (
                    <TransBtn
                      className={`${itemPrefixCls.value}-option-state`}
                      customizeIcon={select.value.menuItemSelectedIcon as any}
                      customizeIconProps={{
                        value,
                        disabled: mergedDisabled,
                        isSelected: selected,
                      }}
                    >
                      {selected ? '✓' : null}
                    </TransBtn>
                  )}
                </div>
              )
            },
          }}
        />
      </>
    )
  }
})

export default OptionList
