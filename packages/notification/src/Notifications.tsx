import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, PropType, TransitionGroupProps } from 'vue'
import type {
  ComponentsType,
  NotificationClassNames,
  NotificationListConfig,
  NotificationStyles,
  Placement,
  StackInput,
} from './NotificationList'
import { defineComponent, shallowRef, Teleport, watch } from 'vue'
import NotificationList from './NotificationList'

type Key = string | number | symbol

export interface NotificationsProps {
  prefixCls?: string
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  components?: ComponentsType
  className?: (placement: Placement) => string
  style?: (placement: Placement) => CSSProperties

  container?: HTMLElement | ShadowRoot
  motion?: TransitionGroupProps | ((placement: Placement) => TransitionGroupProps)

  maxCount?: number
  pauseOnHover?: boolean
  stack?: StackInput

  onAllRemoved?: VoidFunction
  renderNotifications?: (
    node: VueNode,
    info: { prefixCls: string, key: Key },
  ) => VueNode
}

export interface NotificationsRef {
  open: (config: NotificationListConfig) => void
  close: (key: Key) => void
  destroy: () => void
}

type Placements = Partial<Record<Placement, NotificationListConfig[]>>

const Notifications = defineComponent({
  name: 'Notifications',
  inheritAttrs: false,
  props: {
    prefixCls: { type: String, default: 'vc-notification' },
    classNames: { type: Object as PropType<NotificationClassNames>, default: undefined },
    styles: { type: Object as PropType<NotificationStyles>, default: undefined },
    components: { type: Object as PropType<ComponentsType>, default: undefined },
    className: { type: Function as PropType<(p: Placement) => string>, default: undefined },
    style: { type: Function as PropType<(p: Placement) => CSSProperties>, default: undefined },
    container: { type: Object as PropType<HTMLElement | ShadowRoot>, default: undefined },
    motion: {
      type: [Object, Function] as PropType<NotificationsProps['motion']>,
      default: undefined,
    },
    maxCount: { type: Number, default: undefined },
    pauseOnHover: { type: Boolean, default: undefined },
    stack: { type: [Boolean, Object] as PropType<StackInput>, default: undefined },
    onAllRemoved: { type: Function as PropType<VoidFunction>, default: undefined },
    renderNotifications: {
      type: Function as PropType<NotificationsProps['renderNotifications']>,
      default: undefined,
    },
  },
  setup(props, { expose }) {
    const configList = shallowRef<NotificationListConfig[]>([])
    const placements = shallowRef<Placements>({})
    const emptyRef = shallowRef(false)

    expose({
      open: (config: NotificationListConfig) => {
        const list = configList.value
        let clone = [...list]
        const index = clone.findIndex(item => item.key === config.key)
        const innerConfig: NotificationListConfig = { ...config }
        if (index >= 0) {
          innerConfig.times = (list[index]?.times ?? 0) + 1
          clone[index] = innerConfig
        }
        else {
          innerConfig.times = 0
          clone.push(innerConfig)
        }
        const maxCount = props.maxCount ?? 0
        if (maxCount > 0 && clone.length > maxCount) {
          clone = clone.slice(-maxCount)
        }
        configList.value = clone
      },
      close: (key: Key) => {
        configList.value = configList.value.filter(item => item.key !== key)
      },
      destroy: () => {
        configList.value = []
      },
    } as NotificationsRef)

    watch(
      configList,
      () => {
        const next: Placements = {}
        configList.value.forEach((config) => {
          const placement = config.placement ?? 'topRight'
          next[placement] = next[placement] || []
          next[placement]!.push(config)
        })
        Object.keys(placements.value).forEach((placement) => {
          next[placement as Placement] = next[placement as Placement] || []
        })
        placements.value = next
      },
      { immediate: true },
    )

    function onAllNoticeRemoved(placement: Placement) {
      const clone = { ...placements.value }
      if (!(clone[placement] || []).length) {
        delete clone[placement]
      }
      placements.value = clone
    }

    watch(placements, () => {
      if (Object.keys(placements.value).length > 0) {
        emptyRef.value = true
      }
      else if (emptyRef.value) {
        props.onAllRemoved?.()
        emptyRef.value = false
      }
    })

    return () => {
      const { container, prefixCls = 'vc-notification' } = props
      if (!container) {
        return null
      }

      const placementList = Object.keys(placements.value) as Placement[]

      return (
        <Teleport to={container}>
          {placementList.map((placement) => {
            const list = (
              <NotificationList
                key={placement}
                configList={placements.value[placement]}
                placement={placement}
                prefixCls={prefixCls}
                pauseOnHover={props.pauseOnHover}
                classNames={props.classNames}
                styles={props.styles}
                components={props.components}
                class={props.className?.(placement)}
                style={props.style?.(placement)}
                motion={props.motion}
                stack={props.stack}
                onNoticeClose={(key) => {
                  configList.value = configList.value.filter(item => item.key !== key)
                }}
                onAllRemoved={onAllNoticeRemoved}
              />
            )

            return props.renderNotifications
              ? props.renderNotifications(list, { prefixCls, key: placement })
              : list
          })}
        </Teleport>
      )
    }
  },
})

export default Notifications
