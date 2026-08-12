import type { Key, TreeRef } from '../src'
import { defineComponent, nextTick, ref, shallowRef } from 'vue'
import Tree, { useTree } from '../src'
import './assets/index.less'

const ROOT_KEY = 'root'
const TARGET_KEY = 'root-nested'

const treeData = [
  {
    key: ROOT_KEY,
    title: 'Root',
    children: Array.from({ length: 20 }, (_, index) =>
      index === 12
        ? {
            key: TARGET_KEY,
            title: 'Nested Node',
            children: [
              {
                key: `${TARGET_KEY}-0`,
                title: 'Nested Node 0',
                children: [{ key: `${TARGET_KEY}-0-0`, title: 'Nested Node 0-0' }],
              },
              { key: `${TARGET_KEY}-1`, title: 'Nested Node 1' },
            ],
          }
        : {
            key: `${ROOT_KEY}-${index}`,
            title: `Node ${index}`,
          }),
  },
]

export default defineComponent(() => {
  const controlledRef = ref<TreeRef>()
  const uncontrolledRef = ref<TreeRef>()
  const virtual = ref(true)
  const expandedKeys = shallowRef<Key[]>([ROOT_KEY])
  const { getPath } = useTree(treeData as any, {})

  const scrollTo = async () => {
    // Controlled: expand the whole path by hand, then scroll once rendered
    const pathKeys = getPath(TARGET_KEY).map(entity => entity.key)
    expandedKeys.value = [...new Set([...expandedKeys.value, ...pathKeys])]
    await nextTick()
    controlledRef.value?.scrollTo({ key: TARGET_KEY, align: 'top' })

    // Uncontrolled: `autoExpand` lets the tree expand the target itself
    uncontrolledRef.value?.scrollTo({
      key: TARGET_KEY,
      align: 'top',
      autoExpand: true,
    })
  }

  return () => {
    const treeProps = {
      prefixCls: 'vc-tree',
      height: 200,
      itemHeight: 24,
      treeData: treeData as any,
      virtual: virtual.value,
    }

    return (
      <div class="expandNestNode-demo">
        <h2>expand nest node</h2>
        <p>Compare controlled and uncontrolled ways to expand and scroll to a nested node.</p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <label>
            <input
              type="checkbox"
              checked={virtual.value}
              onChange={(event: Event) => {
                virtual.value = (event.target as HTMLInputElement).checked
              }}
            />
            {' '}
            Virtual
          </label>
          <button type="button" onClick={scrollTo}>
            scrollTo
          </button>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <h3>Controlled</h3>
            <Tree
              {...treeProps}
              ref={controlledRef}
              expandedKeys={expandedKeys.value}
              onExpand={(keys: Key[]) => {
                expandedKeys.value = keys
              }}
            />
          </div>

          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <h3>Uncontrolled</h3>
            <Tree {...treeProps} ref={uncontrolledRef} defaultExpandedKeys={[ROOT_KEY]} />
          </div>
        </div>
      </div>
    )
  }
})
