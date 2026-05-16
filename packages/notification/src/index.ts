import useNotification from './hooks/useNotification'
import Notification from './Notification'
import NotificationList from './NotificationList'
import { useNotificationContext, useNotificationProvider } from './NotificationProvider'
import Progress from './Progress'

import type { NotificationAPI, NotificationConfig } from './hooks/useNotification'
import type {
  ComponentsType,
  NotificationClassNames as NoticeClassNames,
  NotificationProps,
  NotificationStyles as NoticeStyles,
} from './Notification'
import type {
  NotificationClassNames,
  NotificationListProps,
  NotificationStyles,
  Placement,
} from './NotificationList'
import type { NotificationProgressProps } from './Progress'
import type { Key, NotificationListConfig, StackConfig } from './interface'
import type { ClosableType, ParsedClosableConfig } from './hooks/useClosable'

export {
  Notification,
  NotificationList,
  Progress,
  useNotification,
  useNotificationContext,
  useNotificationProvider,
}

export type {
  ClosableType,
  ComponentsType,
  Key,
  NoticeClassNames,
  NoticeStyles,
  NotificationAPI,
  NotificationClassNames,
  NotificationConfig,
  NotificationListConfig,
  NotificationListProps,
  NotificationProgressProps,
  NotificationProps,
  NotificationStyles,
  ParsedClosableConfig,
  Placement,
  StackConfig,
}
