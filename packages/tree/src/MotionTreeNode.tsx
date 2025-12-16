import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { FlattenNode, TreeNodeProps } from './interface'
import type { TreeNodeRequiredProps } from './utils/treeUtil'
import { clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, inject, onBeforeUnmount, ref, Transition, watch } from 'vue'
import { TreeContextKey } from './contextTypes'
import TreeNode from './TreeNode'
import { getTreeNodeProps } from './utils/treeUtil'

export interface MotionTreeNodeProps extends Omit<TreeNodeProps, 'domRef'> {
  active?: boolean
  motion?: CSSMotionProps
  motionNodes?: FlattenNode[] | null
  motionType?: 'show' | 'hide' | null
  onMotionStart?: () => void
  onMotionEnd?: () => void
  treeNodeRequiredProps: TreeNodeRequiredProps
}

const MotionTreeNode = defineComponent<MotionTreeNodeProps>(
  (props) => {
    const context = inject(TreeContextKey, null as any)
    const prefixCls = computed(() => context?.prefixCls)

    const targetVisible = computed(() => props.motionNodes && props.motionType !== 'hide')
    const triggerMotionEndRef = ref(false)
    const visible = ref(false)

    const motionName = computed(() => props?.motion?.name)

    const triggerMotionEnd = () => {
      if (props.motionNodes && !triggerMotionEndRef.value) {
        triggerMotionEndRef.value = true
        props.onMotionEnd?.()
      }
    }

    const triggerMotionStart = () => {
      if (props.motionNodes) {
        props?.onMotionStart?.()
      }
    }

    onBeforeUnmount(() => {
      triggerMotionStart()
      triggerMotionEnd()
    })

    watch(
      () => props.motionNodes,
      () => {
        if (props.motionNodes) {
          if (targetVisible.value !== visible.value) {
            visible.value = !!targetVisible.value
          }
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

    const onVisibleChanged = (newVisible: boolean) => {
      if (targetVisible.value === newVisible) {
        triggerMotionEnd()
      }
    }
    return () => {
      const { motionNodes, treeNodeRequiredProps, active } = props
      if (motionNodes) {
        const motionNodes = props.motionNodes || []
        const requiredProps = treeNodeRequiredProps

        return (
          <Transition
            {...getTransitionProps(motionName.value)}
            onBeforeEnter={() => {
              onVisibleChanged(true)
            }}
            onAfterLeave={() => {
              onVisibleChanged(false)
            }}
          >
            {visible.value && (
              <div
                class={clsx(`${prefixCls.value}-treenode-motion`, motionName.value)}
              >
                {motionNodes.map((treeNode) => {
                  const {
                    data: nodeData,
                    title,
                    key,
                    isStart,
                    isEnd,
                  } = treeNode as any

                  const restProps = { ...(nodeData || {}) }
                  delete restProps.children
                  delete restProps.key

                  const treeNodeProps = getTreeNodeProps(key, requiredProps)

                  return (
                    <TreeNode
                      {...restProps}
                      {...treeNodeProps}
                      title={title}
                      active={active}
                      data={nodeData}
                      key={key}
                      isStart={isStart}
                      isEnd={isEnd}
                    />
                  )
                })}
              </div>
            )}
          </Transition>
        )
      }

      return (
        <TreeNode
          {...omit(props, ['motion', 'motionNodes', 'motionType', 'onMotionStart', 'onMotionEnd', 'treeNodeRequiredProps'])}
          active={active}
        />
      )
    }
  },
  {
    name: 'MotionTreeNode',
    inheritAttrs: false,
  },
)

export default MotionTreeNode
