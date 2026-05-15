import type { CSSProperties, TransitionGroupProps } from 'vue'
import type { VueNode } from '@v-c/util/dist/type'
import type { InnerOpenConfig, Key, NotificationListConfig, Placement, Placements, StackConfig } from './interface'
import type { ComponentsType } from './Notification'
import { defineComponent, shallowRef, Teleport, watch } from 'vue'
import NotificationList, {
  type NotificationClassNames,
  type NotificationStyles,
} from './NotificationList'

export interface NotificationsProps {
  prefixCls?: string
  motion?: TransitionGroupProps | ((placement: Placement) => TransitionGroupProps)
  container?: HTMLElement | ShadowRoot
  maxCount?: number
  pauseOnHover?: boolean
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  components?: ComponentsType
  className?: (placement: Placement) => string
  style?: (placement: Placement) => CSSProperties
  onAllRemoved?: VoidFunction
  stack?: StackConfig
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

const defaults = {
  prefixCls: 'vc-notification',
} as NotificationsProps

const Notifications = defineComponent<NotificationsProps>(
  (props = defaults, { expose }) => {
    const configList = shallowRef<NotificationListConfig[]>([])

    const onNoticeClose = (key: Key) => {
      const config = configList.value.find(item => item.key === key)
      const closable = config?.closable
      const closableObj = closable && typeof closable === 'object' ? closable : null
      closableObj?.onClose?.()
      config?.onClose?.()
      configList.value = configList.value.filter(item => item.key !== key)
    }

    expose({
      open: (config: NotificationListConfig) => {
        const list = configList.value
        let clone = [...list]
        const index = clone.findIndex(item => item.key === config.key)
        const innerConfig: InnerOpenConfig = { ...config }
        if (index >= 0) {
          innerConfig.times = ((list[index] as InnerOpenConfig)?.times ?? 0) + 1
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
      close: onNoticeClose,
      destroy: () => {
        configList.value = []
      },
    })

    const placements = shallowRef<Placements>({})

    watch(configList, () => {
      const next: Placements = {}
      configList.value.forEach((config) => {
        const placement = (config.placement ?? 'topRight') as Placement
        next[placement] = next[placement] || []
        next[placement]!.push(config)
      })
      // Keep existing placements so empty lists can finish leave motion.
      Object.keys(placements.value).forEach((placement) => {
        next[placement as Placement] = next[placement as Placement] || []
      })
      placements.value = next
    })

    const onAllNoticeRemoved = (placement: Placement) => {
      const clone = { ...placements.value }
      const list = clone[placement] || []
      if (!list.length) {
        delete clone[placement]
      }
      placements.value = clone
    }

    const emptyRef = shallowRef(false)
    watch(placements, () => {
      if (Object.keys(placements.value).length > 0) {
        emptyRef.value = true
      }
      else if (emptyRef.value) {
        props?.onAllRemoved?.()
        emptyRef.value = false
      }
    })

    return () => {
      const { container } = props
      const prefixCls = props.prefixCls ?? defaults.prefixCls!
      if (!container) {
        return null
      }

      return (
        <Teleport to={container}>
          {Object.keys(placements.value).map((rawPlacement) => {
            const placement = rawPlacement as Placement
            const placementConfigList = placements.value[placement]
            const list = (
              <NotificationList
                key={placement}
                configList={placementConfigList}
                placement={placement}
                prefixCls={prefixCls}
                pauseOnHover={props.pauseOnHover}
                classNames={props.classNames}
                styles={props.styles}
                components={props.components}
                className={props.className?.(placement)}
                style={props.style?.(placement)}
                motion={props.motion}
                stack={props.stack}
                onAllRemoved={onAllNoticeRemoved}
                onNoticeClose={onNoticeClose}
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
  {
    name: 'Notifications',
  },
)

export default Notifications
