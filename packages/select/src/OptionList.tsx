import type { CSSProperties } from 'vue'
import type { FlattenOptionData, RawValueType } from './interface'
import type { BaseOptionType } from './Select'
import { clsx } from '@v-c/util'
import KeyCode from '@v-c/util/dist/KeyCode'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import List from '@v-c/virtual-list'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import useBaseProps from './hooks/useBaseProps'
import { useSelectContext } from './SelectContext'
import TransBtn from './TransBtn'
import { isPlatformMac } from './utils/platformUtil'
import { isValidCount } from './utils/valueUtil'

export interface ScrollConfig {
  index?: number
  key?: string | number
  align?: 'top' | 'bottom' | 'auto'
  offset?: number
}

export interface RefOptionListProps {
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  scrollTo?: (args: number | ScrollConfig) => void
}

function isTitleType(content: any): content is string | number {
  return typeof content === 'string' || typeof content === 'number'
}

/**
 * Using virtual list of option display.
 * Will fallback to dom if use customize render.
 */
const OptionList = defineComponent({
  name: 'OptionList',
  inheritAttrs: false,
  setup(_, { expose }) {
    const baseProps = useBaseProps()
    const context = useSelectContext()

    const itemPrefixCls = computed(() => `${baseProps.value?.prefixCls}-item`)

    // Memoized flatten options (only update when open or options change)
    const memoFlattenOptions = computed(() => {
      if (!baseProps.value?.open) {
        return context.value?.flattenOptions || []
      }
      return context.value?.flattenOptions || []
    })

    // =========================== List ===========================
    const listRef = shallowRef<any>(null)

    const overMaxCount = computed<boolean>(() => {
      const { maxCount, rawValues } = context.value || {}
      return !!(baseProps.value?.multiple && isValidCount(maxCount!) && rawValues && rawValues.size >= maxCount!)
    })

    const onListMouseDown = (event: MouseEvent) => {
      event.preventDefault()
    }

    const scrollIntoView = (args: number | ScrollConfig) => {
      listRef.value?.scrollTo(typeof args === 'number' ? { index: args } : args)
    }

    // https://github.com/ant-design/ant-design/issues/34975
    const isSelected = (value: RawValueType): boolean => {
      if (baseProps.value?.mode === 'combobox') {
        return false
      }
      return context.value?.rawValues?.has(value) || false
    }

    // ========================== Active ==========================
    const getEnabledActiveIndex = (index: number, offset: number = 1): number => {
      const len = memoFlattenOptions.value.length

      for (let i = 0; i < len; i += 1) {
        const current = (index + i * offset + len) % len

        const { group, data } = memoFlattenOptions.value[current] || {}

        if (!group && !data?.disabled && (isSelected(data?.value) || !overMaxCount.value)) {
          return current
        }
      }

      return -1
    }

    const activeIndex = shallowRef(-1)

    const setActive = (index: number, fromKeyboard = false) => {
      activeIndex.value = index

      const info = { source: fromKeyboard ? ('keyboard' as const) : ('mouse' as const) }

      // Trigger active event
      const flattenItem = memoFlattenOptions.value[index]
      if (!flattenItem) {
        context.value?.onActiveValue?.(null as any, -1, info)
        return
      }
      context.value?.onActiveValue?.(flattenItem.value!, index, info)
    }

    // Auto active first item when list length or searchValue changed
    watch(
      [() => memoFlattenOptions.value.length, () => baseProps.value?.searchValue],
      () => {
        const defaultFirst = context.value?.defaultActiveFirstOption !== false
        setActive(defaultFirst ? getEnabledActiveIndex(0) : -1)
      },
      { immediate: true },
    )

    // https://github.com/ant-design/ant-design/issues/48036
    const isAriaSelected = (value: RawValueType): boolean => {
      if (baseProps.value?.mode === 'combobox') {
        return String(value).toLowerCase() === (baseProps.value?.searchValue || '').toLowerCase()
      }
      return context.value?.rawValues?.has(value) || false
    }

    // Auto scroll to item position in single mode
    watch(
      [() => baseProps.value?.open, () => baseProps.value?.searchValue],
      () => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined

        const rawValues = context.value?.rawValues
        if (!baseProps.value?.multiple && baseProps.value?.open && rawValues?.size === 1) {
          const value: RawValueType = Array.from(rawValues)[0]
          const searchValue = baseProps.value?.searchValue
          // Scroll to the option closest to the searchValue if searching.
          const index = memoFlattenOptions.value.findIndex(({ data }) =>
            searchValue ? String(data.value).startsWith(searchValue) : data.value === value,
          )

          if (index !== -1) {
            setActive(index)
            timeoutId = setTimeout(() => {
              scrollIntoView(index)
            })
          }
        }

        // Force trigger scrollbar visible when open
        if (baseProps.value?.open) {
          listRef.value?.scrollTo(undefined as any)
        }

        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
        }
      },
    )

    // ========================== Values ==========================
    const onSelectValue = (value?: RawValueType) => {
      if (value !== undefined) {
        context.value?.onSelect?.(value, { selected: !context.value?.rawValues?.has(value) })
      }

      // Single mode should always close by select
      if (!baseProps.value?.multiple) {
        baseProps.value?.toggleOpen?.(false)
      }
    }

    // ========================= Keyboard =========================
    const onKeyDown = (event: KeyboardEvent) => {
      const { which, ctrlKey } = event
      switch (which) {
        // >>> Arrow keys & ctrl + n/p on Mac
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

        // >>> Select (Tab / Enter)
        case KeyCode.TAB:
        case KeyCode.ENTER: {
          // value
          const item = memoFlattenOptions.value[activeIndex.value]
          if (!item || item.data.disabled) {
            onSelectValue(undefined)
            return
          }

          if (!overMaxCount.value || context.value?.rawValues?.has(item.value!)) {
            onSelectValue(item.value)
          }
          else {
            onSelectValue(undefined)
          }

          if (baseProps.value?.open) {
            event.preventDefault()
          }

          break
        }

        // >>> Close
        case KeyCode.ESC: {
          baseProps.value?.toggleOpen?.(false)
          if (baseProps.value?.open) {
            event.stopPropagation()
          }
        }
      }
    }

    const onKeyUp = () => {}

    // Expose methods
    expose({
      onKeyDown,
      onKeyUp,
      scrollTo: (index: number | ScrollConfig) => {
        scrollIntoView(index)
      },
    })

    return () => {
      const {
        id,
        notFoundContent,
        onPopupScroll,
      } = baseProps.value || {}

      const {
        menuItemSelectedIcon,
        fieldNames,
        virtual,
        direction,
        listHeight,
        listItemHeight,
        optionRender,
        classNames: contextClassNames,
        styles: contextStyles,
      } = context.value || {}

      // ========================== Render ==========================
      if (memoFlattenOptions.value.length === 0) {
        return (
          <div
            role="listbox"
            id={`${id}_list`}
            class={`${itemPrefixCls.value}-empty`}
            onMousedown={onListMouseDown}
          >
            {notFoundContent}
          </div>
        )
      }

      const omitFieldNameList = Object.keys(fieldNames || {}).map(
        key => (fieldNames as any)?.[key],
      )

      const getLabel = (item: FlattenOptionData<BaseOptionType>) => item.label

      function getItemAriaProps(item: FlattenOptionData<BaseOptionType>, index: number) {
        const { group } = item

        return {
          role: group ? 'presentation' : 'option',
          id: `${id}_list_${index}`,
        }
      }

      const renderItem = (index: number) => {
        const item = memoFlattenOptions.value[index]
        if (!item) {
          return null
        }
        const itemData = item.data || {}
        const { value } = itemData
        const { group } = item
        const attrs = pickAttrs(itemData, true)
        const mergedLabel = getLabel(item)
        return item
          ? (
              <div
                aria-label={typeof mergedLabel === 'string' && !group ? mergedLabel : undefined}
                {...attrs}
                key={index}
                {...getItemAriaProps(item, index)}
                aria-selected={isAriaSelected(value)}
              >
                {value}
              </div>
            )
          : null
      }

      const a11yProps = {
        role: 'listbox',
        id: `${id}_list`,
      }

      return (
        <>
          {virtual && (
            <div {...a11yProps} style={{ height: 0, width: 0, overflow: 'hidden' }}>
              {renderItem(activeIndex.value - 1)}
              {renderItem(activeIndex.value)}
              {renderItem(activeIndex.value + 1)}
            </div>
          )}
          <List
            itemKey="key"
            ref={(el: any) => { listRef.value = el }}
            data={memoFlattenOptions.value}
            height={listHeight}
            itemHeight={listItemHeight}
            fullHeight={false}
            {...{ onMousedown: onListMouseDown }}
            onScroll={onPopupScroll as any}
            virtual={virtual}
            direction={direction}
            innerProps={virtual ? undefined : a11yProps}
            class={contextClassNames?.popup?.list}
            style={contextStyles?.popup?.list}
          >
            {{
              default: ({
                item,
                index: itemIndex,
              }: {
                item: FlattenOptionData<BaseOptionType>
                index: number
              }) => {
                const { group, groupOption, data, label, value } = item
                const { key } = data

                // Group
                if (group) {
                  const groupTitle = data.title ?? (isTitleType(label) ? label.toString() : undefined)

                  return (
                    <div
                      class={clsx(itemPrefixCls.value, `${itemPrefixCls.value}-group`, data.className)}
                      title={groupTitle}
                    >
                      {label !== undefined ? label : key}
                    </div>
                  )
                }

                const { disabled, title, children, style, className, ...otherProps } = data
                const passedProps: Record<string, any> = {}
                Object.keys(otherProps).forEach((propKey) => {
                  if (!omitFieldNameList.includes(propKey)) {
                    passedProps[propKey] = otherProps[propKey]
                  }
                })

                // Option
                const selected = isSelected(value!)

                const mergedDisabled = disabled || (!selected && overMaxCount.value)

                const optionPrefixCls = `${itemPrefixCls.value}-option`

                const optionClassName = clsx(
                  itemPrefixCls.value,
                  optionPrefixCls,
                  className,
                  contextClassNames?.popup?.listItem,
                  {
                    [`${optionPrefixCls}-grouped`]: groupOption,
                    [`${optionPrefixCls}-active`]: activeIndex.value === itemIndex && !mergedDisabled,
                    [`${optionPrefixCls}-disabled`]: mergedDisabled,
                    [`${optionPrefixCls}-selected`]: selected,
                  },
                )

                const mergedLabel = getLabel(item)

                const iconVisible
                  = !menuItemSelectedIcon || typeof menuItemSelectedIcon === 'function' || selected

                // https://github.com/ant-design/ant-design/issues/34145
                const content = typeof mergedLabel === 'number' ? mergedLabel : mergedLabel || value
                // https://github.com/ant-design/ant-design/issues/26717
                let optionTitle = isTitleType(content) ? content.toString() : undefined
                if (title !== undefined) {
                  optionTitle = title
                }

                return (
                  <div
                    {...pickAttrs(passedProps)}
                    {...(!virtual ? getItemAriaProps(item, itemIndex) : {})}
                    aria-selected={virtual ? undefined : isAriaSelected(value!)}
                    class={optionClassName}
                    title={optionTitle}
                    onMousemove={() => {
                      if (activeIndex.value === itemIndex || mergedDisabled) {
                        return
                      }
                      setActive(itemIndex)
                    }}
                    onClick={() => {
                      if (!mergedDisabled) {
                        onSelectValue(value)
                      }
                    }}
                    style={{ ...contextStyles?.popup?.listItem, ...style } as CSSProperties}
                  >
                    <div class={`${optionPrefixCls}-content`}>
                      {typeof optionRender === 'function'
                        ? optionRender(item, { index: itemIndex })
                        : content}
                    </div>
                    {iconVisible && (
                      <TransBtn
                        className={`${itemPrefixCls.value}-option-state`}
                        customizeIcon={menuItemSelectedIcon}
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
          </List>
        </>
      )
    }
  },
})

export default OptionList
