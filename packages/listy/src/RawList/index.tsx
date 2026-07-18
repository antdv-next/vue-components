import type { Key } from '@v-c/util/dist/type'
import type { ListComponentProps } from '../interface'
import type { KeyType } from '../util'
import { clsx } from '@v-c/util'
import { defineComponent, ref } from 'vue'
import GroupHeader from '../GroupHeader'
import useGroupSegments from '../hooks/useGroupSegments'
import useItemKey from '../hooks/useItemKey'
import { toTaggedKey } from '../util'
import useRawListScroll from './useRawListScroll'

export default defineComponent<ListComponentProps>((props, { expose }) => {
  // =============================== Refs ===============================
  const holderRef = ref<HTMLDivElement | null>(null)
  const scrollTo = useRawListScroll(holderRef, props.prefixCls, !!(props.sticky && props.group))
  // =============================== Data ===============================
  const groupData = useGroupSegments(props.data, props.group)

  // ============================== Utils ===============================
  const getItemKey = useItemKey(props.rowKey)

  const getScrollTargetProps = (key: Key, type: KeyType) => ({
    'data-key': toTaggedKey(key, type),
  })

  expose({
    scrollTo,
  })

  return () => {
    // ============================== Props ==============================
    const {
      data,
      group,
      height,
      itemRender,
      onScroll,
      prefixCls,
      sticky,
      direction,
      classNames,
      styles,
    } = props

    const renderItem = (item: unknown, index: number) => {
      const key = getItemKey(item)
      const scrollTargetProps = getScrollTargetProps(key, 'item')

      return (
        <div
          key={key}
          class={clsx(`${prefixCls}-item`, classNames?.item)}
          style={styles?.item}
          {...scrollTargetProps}
        >
          {itemRender(item, index)}
        </div>
      )
    }
    // ============================= Content ==============================
    const rawContent = group
      ? Array.from(groupData.value, ([groupKey, groupItems]) => {
          const currentGroupItems = groupItems.map(({ item }) => item)

          return (
            <div
              key={groupKey}
              class={`${prefixCls}-group-section`}
              {...getScrollTargetProps(groupKey, 'group')}
            >
              <GroupHeader
                group={group}
                groupKey={groupKey}
                groupItems={currentGroupItems}
                prefixCls={prefixCls}
                sticky={sticky}
                className={classNames?.groupHeader}
                style={styles?.groupHeader}
              />
              {groupItems.map(({ item, index }) => {
                return renderItem(item, index)
              })}
            </div>
          )
        })
      : data.map((item, index) => {
          return renderItem(item, index)
        })

    return (
      <div
        ref={holderRef}
        class={clsx(
          prefixCls,
          { [`${prefixCls}-rtl`]: direction === 'rtl' },
          classNames?.root,
        )}
        dir={direction}
        style={{
          maxHeight: height,
          overflowY: height === undefined ? undefined : 'auto',
          overflowAnchor: 'none',
          ...styles?.root,
        }}
        onScroll={onScroll}
      >
        {rawContent}
      </div>
    )
  }
})
