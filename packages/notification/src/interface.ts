import type { ClosableType } from './hooks/useClosable'
import type {
  ComponentsType,
  NotificationProps,
} from './Notification'

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'

export type Key = string | number

export type StackConfig
  = | boolean
    | {
    /**
     * When the notice count exceeds this threshold, notices will be stacked.
     * @default 3
     */
      threshold?: number
      /**
       * Vertical offset applied between stacked notices.
       * @default 8
       */
      offset?: number
    }

/**
 * Configuration accepted by the public `api.open` call.
 * Mirrors rc-notification@2.0 NotificationListConfig.
 */
export interface NotificationListConfig extends Omit<NotificationProps, 'prefixCls'> {
  key: Key
  placement?: Placement
  times?: number
}

export type Placements = Partial<Record<Placement, NotificationListConfig[]>>

export type InnerOpenConfig = NotificationListConfig & { times?: number }

// Re-export common surfaces consumers used to import from interface.ts directly.
export type {
  ClosableType,
  ComponentsType,
  NotificationProps,
}
