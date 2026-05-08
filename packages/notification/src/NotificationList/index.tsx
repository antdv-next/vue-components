import type { CSSProperties, PropType, TransitionGroupProps } from 'vue'
import type { StackInput } from '../hooks/useStack'
import type {
  ComponentsType,
  NotificationClassNames as NoticeClassNames,
  NotificationStyles as NoticeStyles,
  NotificationProps,
} from '../Notification'
import { classNames as clsx } from '@v-c/util'
import { getTransitionGroupProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, inject, nextTick, onMounted, ref, shallowRef, toRef, watch } from 'vue'
import useListPosition from '../hooks/useListPosition'
import useStack from '../hooks/useStack'
import Notification from '../Notification'
import { NotificationContext } from '../NotificationProvider'
import Content from './Content'

type Key = string | number | symbol

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'

export type { StackConfig, StackInput } from '../hooks/useStack'
export type { ComponentsType } from '../Notification'

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
  stack?: StackInput
  motion?: TransitionGroupProps | ((placement: Placement) => TransitionGroupProps)
  class?: string
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
  classNamesList: (NotificationClassNames | undefined)[],
): NotificationClassNames {
  return noticeSlotKeys.reduce<NotificationClassNames>((merged, key) => {
    merged[key] = clsx(...classNamesList.map(cn => cn?.[key]))
    return merged
  }, {})
}

function fillStyles(stylesList: (NotificationStyles | undefined)[]): NotificationStyles {
  return noticeSlotKeys.reduce<NotificationStyles>((merged, key) => {
    merged[key] = Object.assign({}, ...stylesList.map(s => s?.[key]))
    return merged
  }, {})
}

const NotificationList = defineComponent({
  name: 'NotificationList',
  inheritAttrs: false,
  props: {
    configList: { type: Array as PropType<NotificationListConfig[]>, default: () => [] },
    prefixCls: { type: String, default: 'vc-notification' },
    placement: { type: String as PropType<Placement>, required: true },
    pauseOnHover: { type: Boolean, default: undefined },
    classNames: { type: Object as PropType<NotificationClassNames>, default: undefined },
    styles: { type: Object as PropType<NotificationStyles>, default: undefined },
    components: { type: Object as PropType<ComponentsType>, default: undefined },
    stack: { type: [Boolean, Object] as PropType<StackInput>, default: undefined },
    motion: {
      type: [Object, Function] as PropType<NotificationListProps['motion']>,
      default: undefined,
    },
    class: { type: String, default: undefined },
    style: { type: Object as PropType<CSSProperties>, default: undefined },
    onNoticeClose: { type: Function as PropType<(key: Key) => void>, default: undefined },
    onAllRemoved: { type: Function as PropType<(placement: Placement) => void>, default: undefined },
  },
  setup(props, { attrs }) {
    const ctx = inject(NotificationContext, ref({}))

    // ========================== Data ==========================
    const keys = computed(() =>
      props.configList.map(config => ({
        config,
        key: String(config.key),
      })),
    )

    // ===================== Motion Config ======================
    const placementMotion = computed(() => {
      if (typeof props.motion === 'function') {
        return props.motion(props.placement)
      }
      return props.motion
    })

    const motionGroupProps = computed<TransitionGroupProps>(() => {
      const motionVal = placementMotion.value
      if (!motionVal) {
        return {}
      }
      if (motionVal.name) {
        return getTransitionGroupProps(motionVal.name, motionVal as any)
      }
      return { ...motionVal }
    })

    // ====================== Stack State =======================
    const [stackEnabled, stackParams] = useStack(toRef(props, 'stack'))
    const listHovering = shallowRef(false)
    const expanded = computed(
      () =>
        stackEnabled.value
        && (listHovering.value || keys.value.length <= stackParams.value.threshold),
    )

    // ====================== Stack Layout ======================
    const stackPosition = computed(() => {
      if (!stackEnabled.value || expanded.value) {
        return undefined
      }
      return {
        offset: stackParams.value.offset,
        threshold: stackParams.value.threshold,
      }
    })

    // ====================== List Measure ======================
    const gap = shallowRef(0)
    const contentRef = shallowRef<{ nativeElement: HTMLElement | null } | null>(null)
    const configListRef = computed(() => props.configList)
    const [
      notificationPosition,
      setNodeSize,
      totalHeight,
      topNoticeHeight,
      topNoticeWidth,
    ] = useListPosition(configListRef, stackPosition, gap)

    const hasConfigList = computed(() => keys.value.length > 0)

    function syncGap() {
      const node = contentRef.value?.nativeElement
      if (!node)
        return
      const { gap: cssGap, rowGap } = window.getComputedStyle(node)
      const next = Number.parseFloat(rowGap || cssGap) || 0
      if (next !== gap.value) {
        gap.value = next
      }
    }

    onMounted(syncGap)
    watch(hasConfigList, () => {
      nextTick(syncGap)
    })

    // ====================== All Removed =======================
    function checkAllClosed() {
      if (!props.placement) {
        return
      }
      if (keys.value.length === 0) {
        props.onAllRemoved?.(props.placement)
      }
    }

    return () => {
      const {
        prefixCls = 'vc-notification',
        placement,
        classNames,
        styles,
        components,
        pauseOnHover,
        class: className,
        style,
        onNoticeClose,
      } = props

      const listPrefixCls = `${prefixCls}-list`
      const ctxClassNames = (ctx.value as any)?.classNames

      const renderItems = () =>
        keys.value.map(({ config }) => {
          const {
            key,
            placement: itemPlacement,
            onClose: configOnClose,
            ...notificationConfig
          } = config
          const strKey = String(key)
          const dataIndex = keys.value.findIndex(item => item.key === strKey)
          const notificationIndex
            = dataIndex === -1 ? undefined : keys.value.length - dataIndex - 1
          const stackInThreshold
            = stackEnabled.value
              && notificationIndex !== undefined
              && notificationIndex < stackParams.value.threshold

          return (
            <Notification
              {...(notificationConfig as any)}
              key={strKey}
              ref={(el: any) => {
                const node = el?.nativeElement ?? null
                setNodeSize(strKey, node)
              }}
              prefixCls={prefixCls}
              class={clsx(ctxClassNames?.notice, config.class)}
              classNames={fillClassNames([classNames, config.classNames])}
              styles={fillStyles([styles, config.styles])}
              components={{ ...components, ...config.components }}
              hovering={stackEnabled.value && listHovering.value}
              pauseOnHover={config.pauseOnHover ?? pauseOnHover}
              offset={notificationPosition.value.get(strKey)}
              notificationIndex={notificationIndex}
              stackInThreshold={!!stackInThreshold}
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
            ctxClassNames?.list,
            className,
            (attrs as any).class,
            classNames?.list,
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
          style={{ ...styles?.list, ...style }}
        >
          <Content
            ref={contentRef as any}
            listPrefixCls={listPrefixCls}
            height={totalHeight.value}
            topNoticeHeight={topNoticeHeight.value}
            topNoticeWidth={topNoticeWidth.value}
            class={classNames?.listContent}
            style={styles?.listContent}
            motionProps={motionGroupProps.value}
            onAfterLeave={checkAllClosed}
          >
            {renderItems()}
          </Content>
        </div>
      )
    }
  },
})

export default NotificationList
