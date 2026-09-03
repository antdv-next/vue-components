import type { ScrollConfig, ScrollOffsetInfo, ListRef as VcVirtualListRef } from '@v-c/virtual-list'
import type { ListComponentProps, ListyRef } from '../interface'
import type { Row } from './useFlattenRows'
import { clsx } from '@v-c/util'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import VcVirtualList from '@v-c/virtual-list'
import { computed, defineComponent, ref } from 'vue'
import GroupHeader from '../GroupHeader'
import useGroupSegments from '../hooks/useGroupSegments'
import useItemKey from '../hooks/useItemKey'
import { toTaggedKey } from '../util'
import useFlattenRows from './useFlattenRows'
import useStickyGroupHeader from './useStickyGroupHeader'

type VirtualListProps = ListComponentProps

export default defineComponent<VirtualListProps>((props, { expose }) => {
  // =============================== Refs ===============================
  const listRef = ref<VcVirtualListRef | null>(null)
  // =============================== Data ===============================
  const groupData = useGroupSegments(props.data, props.group)

  // =============================== Keys ===============================
  const getItemKey = useItemKey(props.rowKey)

  // ============================== Rows ================================
  const flattenRows = computed(() => useFlattenRows(
    props.data,
    groupData.value,
    getItemKey,
    props.group,
  ))
  const itemKeyToGroupKey = computed(() => {
    const itemGroupMap = new Map<string, any>()
    let currentGroupKey: any | undefined

    flattenRows.value.rows.forEach((row) => {
      if (row.type === 'group') {
        currentGroupKey = row.groupKey
      }
      else if (currentGroupKey !== undefined) {
        itemGroupMap.set(row.taggedKey, currentGroupKey)
      }
    })

    return itemGroupMap
  })
  const scrollTo = useEvent<ListyRef['scrollTo']>((config) => {
    if (!config || typeof config !== 'object') {
      listRef.value?.scrollTo(config as number | ScrollConfig | null)
      return
    }

    if ('groupKey' in config) {
      const { groupKey, align, offset } = config
      listRef.value?.scrollTo({
        key: toTaggedKey(groupKey, 'group'),
        align,
        offset,
      })
      return
    }

    if ('key' in config) {
      const taggedItemKey = toTaggedKey(config.key, 'item')
      const stickyGroupKey
        = props.sticky && props.group && config.align !== 'bottom'
          ? itemKeyToGroupKey.value.get(taggedItemKey)
          : undefined

      if (stickyGroupKey === undefined) {
        listRef.value?.scrollTo({ ...config, key: taggedItemKey })
        return
      }

      listRef.value?.scrollTo({
        ...config,
        key: taggedItemKey,
        offset: ({ getSize, align }: ScrollOffsetInfo) => {
          const baseOffset = config.offset ?? 0

          if (align !== 'top') {
            return baseOffset
          }

          // Use the measured header height so the item stays below it.
          const headerSize = getSize(toTaggedKey(stickyGroupKey, 'group'))
          const headerHeight = headerSize.bottom - headerSize.top

          return (
            baseOffset + (Number.isFinite(headerHeight) ? headerHeight : 0)
          )
        },
      })
      return
    }

    listRef.value?.scrollTo(config)
  })
  expose({
    scrollTo,
  })
  return () => {
    // ============================== Props ==============================
    const {
      group,
      height,
      itemHeight,
      itemRender,
      onScroll,
      prefixCls,
      sticky,
      scrollWidth,
      direction,
      classNames,
      styles,
    } = props
    // ============================== Sticky ==============================
    const extraRender = useStickyGroupHeader({
      enabled: !!(sticky && group),
      group,
      groupKeys: flattenRows.value.groupKeys,
      groupKeyToItems: flattenRows.value.groupKeyToItems,
      prefixCls,
      listRef,
      scrollWidth,
      headerClassName: classNames?.groupHeader,
      headerStyle: styles?.groupHeader,
    })
    // ============================ Render Row ============================
    const renderHeaderRow = (groupKey: unknown) => {
      const groupItems = flattenRows.value.groupKeyToItems.get(groupKey) || []

      return (
        <GroupHeader
          group={group!}
          groupKey={groupKey}
          groupItems={groupItems}
          prefixCls={prefixCls}
          className={classNames?.groupHeader}
          style={{ ...styles?.groupHeader, ...(scrollWidth ? { width: `${scrollWidth}px` } : {}) }}
        />
      )
    }
    return (
      <VcVirtualList
        ref={listRef}
        data={flattenRows.value.rows}
        direction={direction}
        fullHeight={false}
        height={height}
        itemHeight={itemHeight}
        itemKey="taggedKey"
        onScroll={onScroll}
        scrollWidth={scrollWidth}
        prefixCls={prefixCls}
        virtual
        extraRender={extraRender as any}
        class={classNames?.root}
        style={styles?.root}
      >
        {({ item: row }: { item: Row }) => {
          if (row.type === 'group') {
            return renderHeaderRow(row.groupKey)
          }
          return (
            <div
              class={clsx(`${prefixCls}-item`, classNames?.item)}
              style={{ ...styles?.item, ...(scrollWidth ? { width: `${scrollWidth}px` } : {}) }}
            >
              {itemRender(row.item, row.index)}
            </div>
          )
        }}
      </VcVirtualList>
    )
  }
})
