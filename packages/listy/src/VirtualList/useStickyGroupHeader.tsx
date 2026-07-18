import type { Key } from '@v-c/util/dist/type'
import type { ListProps } from '@v-c/virtual-list'
import type { CSSProperties, Ref } from 'vue'
import type { Group } from '../interface'
import Portal from '@v-c/portal'
import GroupHeader from '../GroupHeader'
import { toTaggedKey } from '../util'

// ============================== Types ===============================
type ExtraRenderInfo = Parameters<
  NonNullable<ListProps['extraRender']>
>[0]

// ============================== Utils ===============================
const HEADER_TOP_TOLERANCE = 1

function findActiveHeaderIndex<K extends Key>(
  groupKeys: K[],
  getHeaderTop: (groupKey: K) => number,
  scrollTop: number,
) {
  let left = 0
  let right = groupKeys.length - 1
  let activeIndex = 0

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)

    if (getHeaderTop(groupKeys[mid]) <= scrollTop + HEADER_TOP_TOLERANCE) {
      activeIndex = mid
      left = mid + 1
    }
    else {
      right = mid - 1
    }
  }

  return activeIndex
}

// ============================== Params ==============================
export interface StickyHeaderParams {
  enabled: boolean
  group: Group | undefined
  groupKeys: any[]
  groupKeyToItems: Map<any, any[]>
  prefixCls: string
  listRef: Ref
  headerClassName?: string
  headerStyle?: CSSProperties
}

export default function useStickyGroupHeader(params: StickyHeaderParams) {
  // ============================== Props ==============================
  const {
    enabled,
    group,
    groupKeys,
    groupKeyToItems,
    prefixCls,
    listRef,
    headerClassName,
    headerStyle,
  } = params

  const extraRender = (info: ExtraRenderInfo) => {
    const { getSize, scrollTop, virtual } = info

    if (!enabled || !group || !groupKeys.length || !virtual) {
      return null
    }

    const container = listRef.value?.nativeElement
    if (!container) {
      return null
    }

    const getGroupSize = (groupKey: any) =>
      getSize(toTaggedKey(groupKey, 'group'))

    // The sticky header is the group whose section the viewport top sits in.
    const activeHeaderIdx = findActiveHeaderIndex(
      groupKeys,
      groupKey => getGroupSize(groupKey).top,
      scrollTop,
    )
    const currGroupKey = groupKeys[activeHeaderIdx]

    const groupItems = groupKeyToItems.get(currGroupKey) || []
    const currentSize = getGroupSize(currGroupKey)
    const headerHeight = currentSize.bottom - currentSize.top

    const nextGroupKey = groupKeys[activeHeaderIdx + 1]
    // Explicit undefined check: a falsy group key (0, '') is still a group.
    const top
      = nextGroupKey !== undefined
        ? Math.min(
            0,
            getGroupSize(nextGroupKey).top - headerHeight - scrollTop,
          )
        : 0

    // Render a cloned header pinned over the virtual list.
    return (
      <Portal open getContainer={() => container}>
        <div class={`${prefixCls}-group-header-holder`}>
          <GroupHeader
            fixed
            group={group}
            groupKey={currGroupKey}
            groupItems={groupItems}
            prefixCls={prefixCls}
            className={headerClassName}
            // `top` is the computed sticky-push offset and must win over any
            // user-supplied top in headerStyle, or the sticky behavior breaks.
            style={{ ...headerStyle, top }}
          />
        </div>
      </Portal>
    )
  }

  return extraRender
}
