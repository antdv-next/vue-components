import type { RefOptionListProps } from '@v-c/select'
import type { DataEntity, FlattenNode, ScrollTo } from '@v-c/tree'
import type { DataNode, Key } from './interface'
import { useBaseProps } from '@v-c/select'
import Tree, { flattenTreeData, UnstableContextKey } from '@v-c/tree'
import { KeyCode } from '@v-c/util'
import { computed, defineComponent, provide, ref, shallowRef, watch } from 'vue'
import { useLegacyContext } from './LegacyContext'
import { useTreeSelectContext } from './TreeSelectContext'
import { getAllKeys, isCheckDisabled } from './utils/valueUtil'

const HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0,
}

interface TreeEventInfo {
  node: { key: Key }
  selected?: boolean
  checked?: boolean
}

const OptionList = defineComponent({
  name: 'OptionList',
  inheritAttrs: false,
  setup(_, { expose }) {
    const baseProps = useBaseProps()
    const context = useTreeSelectContext()
    const legacyContext = useLegacyContext()

    const treeRef = ref<{ scrollTo: ScrollTo } | null>(null)

    const memoTreeData = computed(() => context.value?.treeData || [])

    const mergedCheckedKeys = computed(() => {
      if (!legacyContext.value?.checkable) {
        return null
      }

      return {
        checked: legacyContext.value.checkedKeys,
        halfChecked: legacyContext.value.halfCheckedKeys,
      }
    })

    // ========================== Scroll ==========================
    watch(
      () => baseProps.value?.open,
      (open) => {
        if (open && !baseProps.value?.multiple && legacyContext.value?.checkedKeys?.length) {
          treeRef.value?.scrollTo({ key: legacyContext.value.checkedKeys[0] })
        }
      },
      { immediate: true },
    )

    // ========================== Events ==========================
    const onListMouseDown = (event: MouseEvent) => {
      event.preventDefault()
    }

    const onInternalSelect = (_: Key[], info: TreeEventInfo) => {
      const { node } = info as any

      if (legacyContext.value?.checkable && isCheckDisabled(node as any)) {
        return
      }

      const checkedKeys = legacyContext.value?.checkedKeys || []

      context.value?.onSelect(node.key, {
        selected: !checkedKeys.includes(node.key),
        source: 'option',
      })

      if (!baseProps.value?.multiple) {
        baseProps.value?.toggleOpen(false)
      }
    }

    // =========================== Keys ===========================
    const expandedKeys = ref<Key[]>(legacyContext.value?.treeDefaultExpandedKeys || [])
    const searchExpandedKeys = ref<Key[] | null>(null)

    const mergedExpandedKeys = computed<Key[] | undefined>(() => {
      if (legacyContext.value?.treeExpandedKeys) {
        return [...legacyContext.value.treeExpandedKeys]
      }

      if (baseProps.value?.searchValue) {
        return (searchExpandedKeys.value || expandedKeys.value) || []
      }

      return expandedKeys.value
    })

    const onInternalExpand = (keys: Key[]) => {
      expandedKeys.value = keys
      searchExpandedKeys.value = keys

      legacyContext.value?.onTreeExpand?.(keys)
    }

    // ========================== Search ==========================
    const filterTreeNode = (treeNode: any) => {
      const searchValue = String(baseProps.value?.searchValue || '')
      if (!searchValue) {
        return false
      }

      const lowerSearchValue = searchValue.toLowerCase()
      const treeNodeFilterProp = legacyContext.value?.treeNodeFilterProp || 'value'

      return String(treeNode?.[treeNodeFilterProp]).toLowerCase().includes(lowerSearchValue)
    }

    watch(
      () => baseProps.value?.searchValue,
      (val) => {
        if (val) {
          searchExpandedKeys.value = getAllKeys(memoTreeData.value, context.value?.fieldNames || {})
        }
      },
      { immediate: true },
    )

    // ========================= Disabled =========================
    const disabledCache = shallowRef<Map<Key, boolean>>(new Map())

    watch(
      () => context.value?.leftMaxCount,
      (val) => {
        if (val) {
          disabledCache.value = new Map()
        }
      },
      { immediate: true },
    )

    function getDisabledWithCache(node: DataNode) {
      const value = (node as any)[context.value!.fieldNames.value as any] as Key
      if (!disabledCache.value.has(value)) {
        const entity = context.value?.valueEntities.get(value)
        const isLeaf = ((entity?.children || []) as DataEntity[]).length === 0

        if (!isLeaf) {
          const checkedKeys = legacyContext.value?.checkedKeys || []
          const checkableChildren = (entity?.children || []).filter(child =>
            !child.node.disabled
            && !(child.node as any).disableCheckbox
            && !checkedKeys.includes((child.node as any)[context.value!.fieldNames.value as any]),
          )

          disabledCache.value.set(value, checkableChildren.length > (context.value?.leftMaxCount || 0))
        }
        else {
          disabledCache.value.set(value, false)
        }
      }
      return disabledCache.value.get(value)
    }

    const nodeDisabled = (node: DataNode) => {
      const checkedKeys = legacyContext.value?.checkedKeys || []
      const nodeValue = (node as any)[context.value!.fieldNames.value as any] as Key

      if (checkedKeys.includes(nodeValue)) {
        return false
      }

      const leftMaxCount = context.value?.leftMaxCount ?? null
      if (leftMaxCount === null) {
        return false
      }

      if (leftMaxCount <= 0) {
        return true
      }

      // This is a low performance calculation
      if (context.value?.leafCountOnly && leftMaxCount) {
        return getDisabledWithCache(node) || false
      }

      return false
    }

    provide(UnstableContextKey, { nodeDisabled })

    // ========================== Get First Selectable Node ==========================
    const getFirstMatchingNode = (nodes: DataNode[]): DataNode | null => {
      for (const node of nodes) {
        if ((node as any).disabled || (node as any).selectable === false) {
          continue
        }

        if (baseProps.value?.searchValue) {
          if (filterTreeNode(node)) {
            return node
          }
        }
        else {
          return node
        }

        const children = (node as any)[context.value!.fieldNames.children as any] as DataNode[] | undefined
        if (children) {
          const matchInChildren = getFirstMatchingNode(children)
          if (matchInChildren) {
            return matchInChildren
          }
        }
      }
      return null
    }

    // ========================== Active ==========================
    const activeKey = ref<Key | null>(null)
    const activeEntity = computed(() => legacyContext.value?.keyEntities?.[String(activeKey.value)] as DataEntity | undefined)

    watch(
      () => [baseProps.value?.open, baseProps.value?.searchValue],
      ([open]) => {
        if (!open) {
          return
        }

        const fieldNames = context.value?.fieldNames

        const getFirstNode = () => {
          const firstNode = getFirstMatchingNode(memoTreeData.value)
          return firstNode ? (firstNode as any)[fieldNames?.value as any] : null
        }

        // single mode active first checked node
        if (!baseProps.value?.multiple && legacyContext.value?.checkedKeys?.length && !baseProps.value?.searchValue) {
          activeKey.value = legacyContext.value.checkedKeys[0]
        }
        else {
          activeKey.value = getFirstNode()
        }
      },
      { immediate: true },
    )

    const flattenNodes = computed<FlattenNode<any>[]>(() =>
      flattenTreeData(memoTreeData.value as any, mergedExpandedKeys.value || [], context.value?.fieldNames as any),
    )

    const activeItem = computed(() => {
      if (activeKey.value === null) {
        return null
      }
      return flattenNodes.value.find(({ key }) => key === activeKey.value) || null
    })

    function offsetActiveKey(offset: number) {
      const nodes = flattenNodes.value
      if (!nodes.length) {
        return
      }

      const currentActiveKey = activeKey.value

      let index = nodes.findIndex(({ key }) => key === currentActiveKey)
      if (index === -1 && offset < 0) {
        index = nodes.length
      }

      index = (index + offset + nodes.length) % nodes.length
      const newActiveKey = nodes[index].key
      activeKey.value = newActiveKey
      treeRef.value?.scrollTo({ key: newActiveKey, offset: context.value?.listItemScrollOffset || 0 })
    }

    // ========================= Keyboard =========================
    const onKeyDown = (event: KeyboardEvent) => {
      const which = (event as any).which || (event as any).keyCode
      const expandedKeysSet = new Set(mergedExpandedKeys.value || [])
      console.log(which, 'which')
      switch (which) {
        case KeyCode.UP:
          offsetActiveKey(-1)
          event.preventDefault()
          return
        case KeyCode.DOWN:
          offsetActiveKey(1)
          event.preventDefault()
          return
        case KeyCode.LEFT:
        case KeyCode.RIGHT: {
          const item = activeItem.value
          if (!item) {
            return
          }

          const children = (item.data as any)?.[context.value?.fieldNames.children as any] || []
          const expandable = (item.data as any)?.isLeaf === false || !!children.length

          if (which === KeyCode.LEFT) {
            if (expandable && expandedKeysSet.has(activeKey.value!)) {
              onInternalExpand((mergedExpandedKeys.value || []).filter(k => k !== activeKey.value))
            }
            else if (item.parent) {
              activeKey.value = item.parent.key
              treeRef.value?.scrollTo({ key: item.parent.key, offset: context.value?.listItemScrollOffset || 0 })
            }
            event.preventDefault()
          }
          else if (which === KeyCode.RIGHT) {
            if (expandable && !expandedKeysSet.has(activeKey.value!)) {
              onInternalExpand(Array.from(new Set([...(mergedExpandedKeys.value || []), activeKey.value!])))
            }
            else if (item.children && item.children.length) {
              activeKey.value = item.children[0].key
              treeRef.value?.scrollTo({ key: item.children[0].key, offset: context.value?.listItemScrollOffset || 0 })
            }
            event.preventDefault()
          }
          return
        }
        case KeyCode.ENTER: {
          if (activeEntity.value) {
            const isNodeDisabled = nodeDisabled(activeEntity.value.node as any)
            const { selectable, value, disabled } = activeEntity.value.node as any
            if (selectable !== false && !disabled && !isNodeDisabled) {
              onInternalSelect([] as any, {
                node: { key: activeKey.value! },
                selected: !(legacyContext.value?.checkedKeys || []).includes(value),
              })
            }
          }
          return
        }
        case KeyCode.ESC:
          baseProps.value?.toggleOpen(false)
      }
    }

    const onKeyUp = () => {}
    expose<RefOptionListProps>({
      scrollTo: (scroll) => {
        treeRef.value?.scrollTo(scroll)
      },
      onKeyDown,
      onKeyUp,
    })

    // ========================== Render ==========================
    return () => {
      const prefixCls = baseProps.value?.prefixCls
      const open = baseProps.value?.open
      const notFoundContent = baseProps.value?.notFoundContent

      const checkable = legacyContext.value?.checkable
      const checkedKeys = legacyContext.value?.checkedKeys || []
      const treeLoadedKeys = legacyContext.value?.treeLoadedKeys
      const treeDefaultExpandAll = legacyContext.value?.treeDefaultExpandAll
      const treeIcon = legacyContext.value?.treeIcon
      const showTreeIcon = legacyContext.value?.showTreeIcon
      const switcherIcon = legacyContext.value?.switcherIcon
      const treeLine = legacyContext.value?.treeLine
      const treeMotion = legacyContext.value?.treeMotion
      const loadData = legacyContext.value?.loadData
      const onTreeLoad = legacyContext.value?.onTreeLoad

      const {
        fieldNames,
        virtual,
        listHeight,
        listItemHeight,
        listItemScrollOffset,
        popupMatchSelectWidth,
        treeExpandAction,
        treeTitleRender,
        onPopupScroll,
        classNames,
        styles,
      } = context.value || ({} as any)

      if (memoTreeData.value.length === 0) {
        return (
          <div role="listbox" class={`${prefixCls}-empty`} onMousedown={onListMouseDown}>
            {notFoundContent}
          </div>
        )
      }

      const syncLoadData = baseProps.value?.searchValue ? undefined : loadData
      return (
        <div onMousedown={onListMouseDown}>
          {activeEntity.value && open && (
            <span style={HIDDEN_STYLE} aria-live="assertive">
              {(activeEntity.value.node as any).value}
            </span>
          )}
          <Tree
            ref={(el: any) => {
              treeRef.value = el
            }}
            focusable={false}
            prefixCls={`${prefixCls}-tree`}
            treeData={memoTreeData.value as any}
            fieldNames={fieldNames as any}
            height={listHeight}
            itemHeight={listItemHeight}
            itemScrollOffset={listItemScrollOffset}
            virtual={virtual !== false && popupMatchSelectWidth !== false}
            multiple={baseProps.value?.multiple}
            icon={treeIcon}
            showIcon={showTreeIcon}
            switcherIcon={switcherIcon}
            showLine={treeLine}
            loadData={syncLoadData as any}
            motion={treeMotion}
            activeKey={activeKey.value as any}
            // We handle keys by out instead tree self
            checkable={checkable}
            checkStrictly
            checkedKeys={mergedCheckedKeys.value as any}
            selectedKeys={!checkable ? checkedKeys : []}
            defaultExpandAll={treeDefaultExpandAll}
            titleRender={treeTitleRender}
            expandedKeys={mergedExpandedKeys.value as any}
            loadedKeys={treeLoadedKeys as any}
            // Proxy event out
            onActiveChange={(key) => {
              activeKey.value = key
            }}
            onSelect={onInternalSelect as any}
            onCheck={onInternalSelect as any}
            onExpand={onInternalExpand as any}
            onLoad={onTreeLoad as any}
            filterTreeNode={filterTreeNode as any}
            expandAction={treeExpandAction}
            onScroll={onPopupScroll}
            classNames={(classNames as any)?.popup}
            styles={(styles as any)?.popup}
          />
        </div>
      )
    }
  },
})

export default OptionList
