import type { FlattenNode, TreeNodeProps } from './interface'
import type { TreeNodeRequiredProps } from './utils/treeUtil'
import { clsx } from '@v-c/util'
import { computed, defineComponent, inject, nextTick, onBeforeUnmount, onMounted, ref, Transition, watch } from 'vue'
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

function applyStyle(el: HTMLElement, style: Record<string, any> | undefined) {
  const keys: string[] = []
  if (!style)
    return keys

  Object.keys(style).forEach((key) => {
    keys.push(key)
    ;(el.style as any)[key] = toStyleValue((style as any)[key])
  })

  return keys
}

function clearStyle(el: HTMLElement, keys: string[]) {
  keys.forEach((key) => {
    ;(el.style as any)[key] = ''
  })
}

function waitTransitionEnd(el: HTMLElement, done: () => void) {
  let ended = false

  function cleanup() {
    el.removeEventListener('transitionend', onEnd)
    el.removeEventListener('animationend', onEnd)
  }

  function onEnd(e: Event) {
    if (ended)
      return
    if (e.target !== el)
      return
    ended = true
    cleanup()
    done()
  }

  el.addEventListener('transitionend', onEnd)
  el.addEventListener('animationend', onEnd)

  // Fallback
  window.setTimeout(() => {
    if (ended)
      return
    ended = true
    cleanup()
    done()
  }, 1000)
}

const MotionTreeNode = defineComponent<MotionTreeNodeProps>(
  (props) => {
    const context = inject(TreeContextKey, null as any)
    const prefixCls = computed(() => context?.prefixCls)

    const visible = ref(true)
    const mounted = ref(false)
    const motionEndCalled = ref(false)

    const targetVisible = computed(() => !!props.motionNodes && props.motionType !== 'hide')

    const triggerMotionStart = () => {
      if (props.motionNodes) {
        props.onMotionStart?.()
      }
    }

    const triggerMotionEnd = () => {
      if (props.motionNodes && !motionEndCalled.value) {
        motionEndCalled.value = true
        props.onMotionEnd?.()
      }
    }

    onMounted(() => {
      mounted.value = true
      triggerMotionStart()

      if (props.motionNodes && !targetVisible.value) {
        nextTick(() => {
          visible.value = false
        })
      }
    })

    onBeforeUnmount(() => {
      triggerMotionEnd()
    })

    watch(
      () => [props.motionNodes, props.motionType] as const,
      () => {
        if (!props.motionNodes)
          return
        if (!mounted.value)
          return

        const nextVisible = targetVisible.value
        if (visible.value !== nextVisible) {
          visible.value = nextVisible
        }
      },
    )

    const motionName = computed(() => (props.motion as any)?.motionName)

    return () => {
      if (props.motionNodes) {
        const motionNodes = props.motionNodes || []
        const requiredProps = props.treeNodeRequiredProps

        const getStartStyle = (el: HTMLElement, entering: boolean) => {
          if (entering) {
            return (props.motion as any)?.onAppearStart?.(el) ?? (props.motion as any)?.onEnterStart?.(el)
          }
          return (props.motion as any)?.onLeaveStart?.(el)
        }

        const getActiveStyle = (el: HTMLElement, entering: boolean) => {
          if (entering) {
            return (props.motion as any)?.onAppearActive?.(el) ?? (props.motion as any)?.onEnterActive?.(el)
          }
          return (props.motion as any)?.onLeaveActive?.(el)
        }

        return (
          <Transition
            css={false}
            onBeforeEnter={(el: any) => {
              motionEndCalled.value = false
              const keys = applyStyle(el as HTMLElement, getStartStyle(el as HTMLElement, true))
              ;(el as any).__vcTreeMotionKeys = keys
            }}
            onEnter={(el: any, done: () => void) => {
              nextTick(() => {
                applyStyle(el as HTMLElement, getActiveStyle(el as HTMLElement, true))
                waitTransitionEnd(el as HTMLElement, done)
              })
            }}
            onAfterEnter={(el: any) => {
              clearStyle(el as HTMLElement, (el as any).__vcTreeMotionKeys || [])
              triggerMotionEnd()
            }}
            onBeforeLeave={(el: any) => {
              motionEndCalled.value = false
              const keys = applyStyle(el as HTMLElement, getStartStyle(el as HTMLElement, false))
              ;(el as any).__vcTreeMotionKeys = keys
            }}
            onLeave={(el: any, done: () => void) => {
              nextTick(() => {
                applyStyle(el as HTMLElement, getActiveStyle(el as HTMLElement, false))
                waitTransitionEnd(el as HTMLElement, done)
              })
            }}
            onAfterLeave={(el: any) => {
              clearStyle(el as HTMLElement, (el as any).__vcTreeMotionKeys || [])
              triggerMotionEnd()
            }}
          >
            {visible.value && (
              <div class={clsx(`${prefixCls.value}-treenode-motion`, motionName.value)}>
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
