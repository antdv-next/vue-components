import type { Key } from '@v-c/util/dist/type'
import type { ListRef } from '@v-c/virtual-list'
import type { Row } from './hooks/useFlattenRows'
import type { ListyProps, ListyRef } from './interface'
import { clsx } from '@v-c/util'
import VirtualList from '@v-c/virtual-list'
import { computed, defineComponent, ref } from 'vue'
import {
  useFlattenRows,
  useGroupSegments,
  useOnEndReached,
  useStickyGroupHeader
} from './hooks'
import { isGroupScrollConfig } from './util'

export default defineComponent<ListyProps>((props, { expose }) => {
  const data = computed(() => props.items || [])
  const group = computed(() => props.group)

  const listRef = ref<ListRef | null>(null);
  const containerRef = ref<HTMLDivElement | null>(null);

  expose({
    scrollTo: (config: any) => {
      if (isGroupScrollConfig(config)) {
        const { groupKey, align, offset } = config;
        listRef.value?.scrollTo({
          key: groupKey,
          align,
          offset,
        });
        return;
      }
      listRef.value?.scrollTo(config);
    },
  })

  const groupSegments = useGroupSegments(data, group);

  // =================================== Keys ===================================
  const getKey = (row: Row): Key => {
    if (row.type === 'header') {
      return row.groupKey;
    }

    if (typeof props.rowKey === 'function') {
      return props.rowKey(row.item);
    }
    return row.item?.[props.rowKey as string];
  };

  // ======================= Flatten rows (header + item) =======================
  const flattenRows = useFlattenRows(
    data,
    group,
    groupSegments,
  );

  // Pre-compute each group's items to simplify header rendering
  const groupKeyToItems = computed(() => {
    const map = new Map<Key, any[]>();
    if (!props.group) {
      return map;
    }
    flattenRows.value.groupKeyToSeg.forEach(({ startIndex, endIndex }, key) => {
      map.set(key, data.value.slice(startIndex, endIndex + 1));
    });
    return map;
  })

  const handleOnScroll = useOnEndReached({
    enabled: !!props.onEndReached,
    onEndReached: props.onEndReached,
  });
  return () => {
    const {
      itemRender,
      height,
      itemHeight,
      virtual = true,
      prefixCls = 'vc-listy',
      group,
      sticky
    } = props;

  // Sticky header overlay via Portal (anchored on header rows)
  const extraRender = useStickyGroupHeader({
    enabled: !!(sticky && group),
    group,
    headerRows: flattenRows.value.headerRows,
    groupKeyToItems: groupKeyToItems.value,
    containerRef,
    listRef,
    prefixCls,
  });

  const renderHeaderRow = (groupKey: Key) => {
    const groupItems = groupKeyToItems.value.get(groupKey) || [];
    const headerClassName = clsx(`${prefixCls}-group-header`, {
      [`${prefixCls}-group-header-sticky`]: sticky && !virtual,
    });

    return (
      <div class={headerClassName}>
        {group?.title(groupKey, groupItems)}
      </div>
    );
  }
    return (
      <div ref={containerRef} class={prefixCls}>
        <VirtualList
          virtual={virtual}
          ref={listRef}
          data={flattenRows.value.rows}
          fullHeight={false}
          itemHeight={itemHeight}
          itemKey={getKey}
          height={height}
          extraRender={extraRender}
          onScroll={handleOnScroll}
          prefixCls={prefixCls}
        >
          {({ item: row }: { item: Row }) =>
            row.type === 'header'
              ? renderHeaderRow(row.groupKey)
              : itemRender(row.item, row.index)
          }
        </VirtualList>
      </div>
    )
  }
})
