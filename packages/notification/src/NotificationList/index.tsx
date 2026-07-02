import type { CSSProperties, TransitionGroupProps } from 'vue'
import type { Key, StackConfig } from '../interface'
import type {
  ComponentsType,
  NotificationClassNames as NoticeClassNames,
  NotificationStyles as NoticeStyles,
  NotificationProps,
} from '../Notification'
import { clsx } from '@v-c/util'
import { createElementRef } from '@v-c/util/dist/vnode'
import { unrefElement } from '@v-c/util/dist/vueuse/unref-element'
import { computed, defineComponent, ref, shallowRef, toRef, TransitionGroup, watch, watchEffect } from 'vue'
import useListPosition from '../hooks/useListPosition'
import useStack from '../hooks/useStack'
import Notification from '../Notification'
import { useNotificationContext } from '../NotificationProvider'
import Content from './Content'

/**
 * Map Vue's TransitionGroup enter/leave class hooks onto the rc-motion
 * style class names that antdv-next 6.4.0 notification styles target
 * (-enter-start / -enter-active / -leave-start / -leave-active).
 *
 * The shared @v-c/util getTransitionGroupProps puts -leave-active in the
 * leaveActiveClass, which means the notice jumps straight to opacity:0
 * on leave without animating. Wire each phase to the correct rc-motion
 * suffix so the opacity/transform transition runs.
 */
function buildMotionGroupProps(name: string, override?: Partial<TransitionGroupProps>): TransitionGroupProps {
  return {
    name,
    appear: true,
    // ENTER: from = opacity 0 (-enter-start / -appear-start)
    //        to   = opacity 1 (-enter-active / -appear-active)
    enterFromClass: `${name} ${name}-enter ${name}-appear ${name}-enter-start ${name}-appear-start`,
    enterActiveClass: `${name} ${name}-enter ${name}-appear`,
    enterToClass: `${name} ${name}-enter ${name}-appear ${name}-enter-active ${name}-appear-active`,
    // LEAVE: from = opacity 1 (-leave-start)
    //        to   = opacity 0 (-leave-active)
    leaveFromClass: `${name} ${name}-leave ${name}-leave-start`,
    leaveActiveClass: `${name} ${name}-leave`,
    leaveToClass: `${name} ${name}-leave ${name}-leave-active`,
    moveClass: `${name} ${name}-move`,
    ...override,
  }
}

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'

export type { StackConfig }

export interface NotificationListConfig extends Omit<NotificationProps, 'prefixCls'> {
  key: Key
  placement?: Placement
  times?: number
}

export interface NotificationClassNames extends NoticeClassNames {
  list?: string
  listContent?: string
}

export interface NotificationStyles extends NoticeStyles {
  list?: CSSProperties
  listContent?: CSSProperties
}

export interface NotificationListProps {
  configList?: NotificationListConfig[]
  prefixCls?: string
  placement: Placement
  pauseOnHover?: boolean
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  components?: ComponentsType
  stack?: StackConfig
  motion?: TransitionGroupProps | ((placement: Placement) => TransitionGroupProps)
  className?: string
  style?: CSSProperties
  onNoticeClose?: (key: Key) => void
  onAllRemoved?: (placement: Placement) => void
}

const noticeSlotKeys: (keyof NoticeClassNames)[] = [
  'wrapper',
  'root',
  'icon',
  'section',
  'title',
  'description',
  'actions',
  'close',
  'progress',
]

function fillClassNames(
  list: (NotificationClassNames | undefined)[],
): NotificationClassNames {
  return noticeSlotKeys.reduce<NotificationClassNames>((merged, key) => {
    merged[key] = clsx(...list.map(item => item?.[key]))
    return merged
  }, {})
}

function fillStyles(
  list: (NotificationStyles | undefined)[],
): NotificationStyles {
  return noticeSlotKeys.reduce<NotificationStyles>((merged, key) => {
    merged[key] = Object.assign({}, ...list.map(item => item?.[key]))
    return merged
  }, {})
}

function getIndex(keys: { key: Key }[], key: Key): number | undefined {
  const strKey = String(key)
  const index = keys.findIndex(item => String(item.key) === strKey)
  if (index === -1) {
    return undefined
  }
  return keys.length - index - 1
}

const NotificationList = defineComponent<NotificationListProps>(
  (props, { attrs }) => {
    const ctx = useNotificationContext()

    const configList = computed(() => props.configList ?? [])
    const keys = computed(() =>
      configList.value.map(config => ({ ...config, key: String(config.key) as Key })),
    )

    // ====================== Stack State =======================
    const stackConfig = toRef(props, 'stack')
    const [stackEnabled, stackParams] = useStack(stackConfig)
    const listHovering = shallowRef(false)
    const expanded = computed(() =>
      stackEnabled.value && (listHovering.value || keys.value.length <= (stackParams.threshold?.value ?? 0)),
    )

    const stackPosition = computed(() => {
      if (!stackEnabled.value || expanded.value) {
        return undefined
      }
      return {
        offset: stackParams.offset?.value,
        threshold: stackParams.threshold?.value,
      }
    })

    // ====================== List Measure ======================
    const gap = ref(0)
    const contentRef = ref<{ nativeElement: { value: HTMLDivElement | null } } | null>(null)
    const [position, setNodeSize] = useListPosition(keys as any, stackPosition as any, gap)

    const hasConfigList = computed(() => !!configList.value.length)
    watchEffect(() => {
      if (!hasConfigList.value) {
        return
      }
      const listNode = unrefElement<HTMLDivElement>(contentRef.value?.nativeElement as any)
      if (!listNode) {
        return
      }
      const { gap: cssGap, rowGap } = window.getComputedStyle(listNode)
      const nextGap = Number.parseFloat(rowGap || cssGap) || 0
      if (gap.value !== nextGap) {
        gap.value = nextGap
      }
    }, { flush: 'post' })

    // Notify when list becomes empty (after motion finished).
    const checkAllClosed = () => {
      if (configList.value.length === 0) {
        props.onAllRemoved?.(props.placement)
      }
    }

    // Compute motion props per placement.
    const placementMotion = computed(() => {
      if (typeof props.motion === 'function') {
        return props.placement ? props.motion(props.placement) : undefined
      }
      return props.motion
    })

    // Cleanup node sizes when items leave permanently.
    watch(keys, (next, prev) => {
      if (!prev) {
        return
      }
      const nextKeySet = new Set(next.map(item => String(item.key)))
      prev.forEach((item) => {
        const key = String(item.key)
        if (!nextKeySet.has(key)) {
          setNodeSize(key, null)
        }
      })
    })

    return () => {
      const {
        prefixCls = 'vc-notification',
        pauseOnHover,
        classNames: ncs,
        styles: nss,
        components,
        placement,
        className,
        style,
        onNoticeClose,
      } = props

      const listPrefixCls = `${prefixCls}-list`
      const positionResult = position.value

      let motionGroupProps: TransitionGroupProps = {}
      if (placementMotion.value?.name) {
        motionGroupProps = buildMotionGroupProps(placementMotion.value.name, placementMotion.value)
      }

      const renderItems = () =>
        keys.value.map((config) => {
          const {
            key,
            placement: _itemPlacement,
            classNames: configClassNames,
            styles: configStyles,
            className: configClassName,
            style: configStyle,
            // Extract onClose so the spread below does not also bind it.
            // Vue would otherwise merge our `onClose={...}` and the spread's
            // `onClose` into an Array, breaking `props.onClose?.()` in the
            // notice itself.
            onClose: configOnClose,
            ...notificationConfig
          } = config
          const strKey = String(key)
          const notificationIndex = getIndex(keys.value, key)
          const stackInThreshold
            = stackEnabled.value && notificationIndex !== undefined && notificationIndex < (stackParams.threshold?.value ?? 0)

          return (
            <Notification
              key={strKey}
              {...notificationConfig}
              // vue >=3.5.39 no longer re-invokes function refs reactively, so
              // resolving the exposed `nativeElement` inline would read null on the
              // first render and record a 0 height — making the notices stack on top
              // of each other. `createElementRef` retries once the element resolves.
              // sync antdv-next#623 pattern
              ref={createElementRef<HTMLDivElement>((node) => {
                setNodeSize(strKey, node ?? null)
              }, (el: any) => unrefElement<HTMLDivElement>(el?.nativeElement as any) ?? null)}
              prefixCls={prefixCls}
              class={clsx((ctx.value as any)?.classNames?.notice, configClassName)}
              style={configStyle}
              classNames={fillClassNames([ncs, configClassNames])}
              styles={fillStyles([nss, configStyles])}
              components={{
                ...components,
                ...(config as NotificationListConfig).components,
              }}
              hovering={stackEnabled.value && listHovering.value}
              pauseOnHover={config.pauseOnHover ?? pauseOnHover}
              offset={positionResult.notificationPosition.get(strKey)}
              notificationIndex={notificationIndex}
              stackInThreshold={stackInThreshold}
              onClose={() => {
                configOnClose?.()
                onNoticeClose?.(key)
              }}
            />
          )
        })

      return (
        <div
          class={clsx(
            prefixCls,
            listPrefixCls,
            `${prefixCls}-${placement}`,
            (ctx.value as any)?.classNames?.list,
            className,
            ncs?.list,
            (attrs as any).class,
            {
              [`${prefixCls}-stack`]: stackEnabled.value,
              [`${prefixCls}-stack-expanded`]: expanded.value,
              [`${listPrefixCls}-hovered`]: listHovering.value,
            },
          )}
          onMouseenter={() => {
            listHovering.value = true
          }}
          onMouseleave={() => {
            listHovering.value = false
          }}
          style={{ ...nss?.list, ...style, ...((attrs as any).style ?? {}) } as CSSProperties}
        >
          <Content
            ref={contentRef as any}
            listPrefixCls={listPrefixCls}
            height={positionResult.totalHeight}
            topNoticeHeight={positionResult.topNoticeHeight}
            topNoticeWidth={positionResult.topNoticeWidth}
            className={ncs?.listContent}
            style={nss?.listContent}
          >
            <TransitionGroup
              appear
              {...motionGroupProps}
              onAfterLeave={checkAllClosed}
            >
              {renderItems()}
            </TransitionGroup>
          </Content>
        </div>
      )
    }
  },
  {
    name: 'NotificationList',
    inheritAttrs: false,
  },
)

export default NotificationList
