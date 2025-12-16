import type { FlattenNode, TreeNodeProps } from './interface'
import type { TreeNodeRequiredProps } from './utils/treeUtil'
import { clsx } from '@v-c/util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, inject, nextTick, onBeforeUnmount, ref, shallowRef, Transition, watch } from 'vue'
import { TreeContextKey } from './contextTypes'
import TreeNode from './TreeNode'
import { getTreeNodeProps } from './utils/treeUtil'

export interface MotionTreeNodeProps extends Omit<TreeNodeProps, 'domRef'> {
  active?: boolean
  motion?: any
  motionNodes?: FlattenNode[] | null
  motionType?: 'show' | 'hide' | null
  onMotionStart?: () => void
  onMotionEnd?: () => void
  treeNodeRequiredProps: TreeNodeRequiredProps
}

function toStyleValue(value: any) {
  if (value === undefined || value === null)
    return ''
  if (typeof value === 'number')
    return `${value}px`
  return String(value)
}

function toStyleObject(style: Record<string, any> | undefined) {
  const mergedStyle: Record<string, any> = {}
  if (!style)
    return mergedStyle
  Object.keys(style).forEach((key) => {
    mergedStyle[key] = toStyleValue((style as any)[key])
  })
  return mergedStyle
}

const MotionTreeNode = defineComponent<MotionTreeNodeProps>(
  (props) => {
    const context = inject(TreeContextKey, null as any)
    const prefixCls = computed(() => context?.prefixCls)

    const motionEndCalled = ref(false)
    const visible = ref(false)
    const motionStyle = shallowRef<Record<string, any>>({})
    let motionLeaveTimer: any = null

    const motionName = computed(() => (props.motion as any)?.motionName)

    const triggerMotionEnd = () => {
      if (props.motionNodes && !motionEndCalled.value) {
        motionEndCalled.value = true
        props.onMotionEnd?.()
      }
    }

    onBeforeUnmount(() => {
      if (motionLeaveTimer) {
        clearTimeout(motionLeaveTimer)
        motionLeaveTimer = null
      }
      triggerMotionEnd()
    })

    watch(
      () => [props.motionNodes, props.motionType] as const,
      ([nodes, type], prev) => {
        if (!nodes)
          return
        if (nodes === prev?.[0] && type === prev?.[1])
          return

        motionEndCalled.value = false
        props.onMotionStart?.()

        if (type === 'hide') {
          visible.value = true
          nextTick(() => {
            visible.value = false
          })
        }
        else {
          visible.value = false
          nextTick(() => {
            visible.value = true
          })
        }
      },
      { immediate: true },
    )

    const getStartStyle = (el: HTMLElement, entering: boolean) => {
      if (entering) {
        return (props.motion as any)?.onEnterStart?.(el) ?? (props.motion as any)?.onAppearStart?.(el)
      }
      return (props.motion as any)?.onLeaveStart?.(el)
    }

    const getActiveStyle = (el: HTMLElement, entering: boolean) => {
      if (entering) {
        return (props.motion as any)?.onEnterActive?.(el) ?? (props.motion as any)?.onAppearActive?.(el)
      }
      return (props.motion as any)?.onLeaveActive?.(el)
    }

    return () => {
      if (props.motionNodes) {
        const motionNodes = props.motionNodes || []
        const requiredProps = props.treeNodeRequiredProps

        return (
          <Transition
            {...getTransitionProps(motionName.value, { appear: false })}
            onBeforeEnter={(el: any) => {
              motionStyle.value = toStyleObject(getStartStyle(el as HTMLElement, true))
            }}
            onEnter={(el: any) => {
              nextTick(() => {
                motionStyle.value = toStyleObject(getActiveStyle(el as HTMLElement, true))
              })
            }}
            onAfterEnter={() => {
              motionStyle.value = {}
              triggerMotionEnd()
            }}
            onBeforeLeave={(el: any) => {
              motionStyle.value = toStyleObject(getStartStyle(el as HTMLElement, false))
            }}
            onLeave={(el: any) => {
              if (motionLeaveTimer) {
                clearTimeout(motionLeaveTimer)
                motionLeaveTimer = null
              }
              motionLeaveTimer = setTimeout(() => {
                motionStyle.value = toStyleObject(getActiveStyle(el as HTMLElement, false))
              })
            }}
            onAfterLeave={() => {
              if (motionLeaveTimer) {
                clearTimeout(motionLeaveTimer)
                motionLeaveTimer = null
              }
              motionStyle.value = {}
              triggerMotionEnd()
            }}
          >
            {visible.value && (
              <div
                class={clsx(`${prefixCls.value}-treenode-motion`, motionName.value)}
                style={motionStyle.value}
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
                      active={props.active}
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

      const { motion: _motion, motionNodes: _motionNodes, motionType: _motionType, onMotionStart: _onMotionStart, onMotionEnd: _onMotionEnd, treeNodeRequiredProps: _treeNodeRequiredProps, ...restProps } = props as any
      return <TreeNode {...restProps} active={props.active} />
    }
  },
  {
    name: 'MotionTreeNode',
    inheritAttrs: false,
  },
)

export default MotionTreeNode
