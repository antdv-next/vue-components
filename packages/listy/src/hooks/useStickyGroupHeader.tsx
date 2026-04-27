import type { Key } from '@v-c/util/dist/type'
import type { ExtraRenderInfo, ListRef } from '@v-c/virtual-list'
import type { Ref } from 'vue'
import type { Group } from '../interface'
import Portal from '@v-c/portal'
import { ref } from 'vue'

export interface StickyHeaderParams {
  enabled: boolean;
  group: Group | undefined;
  headerRows: { groupKey: Key; rowIndex: number }[];
  groupKeyToItems: Map<Key, any[]>;
  containerRef: Ref<HTMLDivElement | null>;
  listRef: Ref<ListRef | null>;
  prefixCls: string;
}

export default function useStickyGroupHeader(params: StickyHeaderParams) {
  const {
    enabled,
    group,
    headerRows,
    groupKeyToItems,
    containerRef,
    listRef,
    prefixCls,
  } = params;

  const lastHeaderIdxRef = ref(0);

  const extraRender = (info: ExtraRenderInfo) => {
      const { virtual } = info;

      if (!enabled || !headerRows.length || !virtual) {
        lastHeaderIdxRef.value = 0;
        return null;
      }

      // maybe @v-c/virtual-list will expose scrollTop in the future
      const getHolderScrollTop = () => {
        const container = containerRef.value;
        const holder =
          container?.querySelector<HTMLDivElement>(`.${prefixCls}-holder`) ||
          listRef.value?.nativeElement?.querySelector?.(
            `.${prefixCls}-holder`,
          );
        if (holder) {
          return holder.scrollTop;
        }
        const infoScrollTop = listRef.value?.getScrollInfo?.().y;
        return infoScrollTop;
      };

      const resolveByScrollTop = (scrollTop: number) => {
        const cachedIdx = lastHeaderIdxRef.value;
        const cachedRow = headerRows[cachedIdx];
        const cachedTop = cachedRow
          ? info.getSize(cachedRow.groupKey).top
          : null;
        const nextRow = headerRows[cachedIdx + 1];
        const nextTop = nextRow ? info.getSize(nextRow.groupKey).top : null;

        if (
          cachedRow &&
          cachedTop !== null &&
          scrollTop >= cachedTop &&
          (nextTop === null || scrollTop < nextTop)
        ) {
          return cachedIdx;
        }

        let lo = 0;
        let hi = headerRows.length - 1;
        let candidate = 0;

        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          const { top } = info.getSize(headerRows[mid].groupKey);
          if (top <= scrollTop) {
            candidate = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        return candidate;
      };

      const scrollTop = getHolderScrollTop();
      const activeHeaderIdx = resolveByScrollTop(scrollTop);

      lastHeaderIdxRef.value = activeHeaderIdx;

      const currHeader = headerRows[activeHeaderIdx];
      const groupItems = groupKeyToItems.get(currHeader.groupKey) || [];
      const headerNode = (
        <div class={`${prefixCls}-sticky-header`}>
          {group?.title(currHeader.groupKey, groupItems)}
        </div>
      );

      return (
        <Portal open getContainer={() => containerRef.value}>
          {headerNode}
        </Portal>
      );
    }

  return extraRender;
}
