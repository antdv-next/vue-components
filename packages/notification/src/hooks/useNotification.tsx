import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, MaybeRef, TransitionGroupProps } from 'vue'
import type { NotificationListConfig, Placement, StackInput } from '../NotificationList'
import type { NotificationsProps, NotificationsRef } from '../Notifications'
import { computed, onMounted, shallowRef, unref, watch } from 'vue'
import Notifications from '../Notifications'

type Key = string | number | symbol

const defaultGetContainer = () => document.body

type OptionalConfig = Partial<NotificationListConfig>
type SharedConfig = Pick<
  NotificationListConfig,
  'placement' | 'closable' | 'duration' | 'showProgress'
>

export interface NotificationConfig extends Omit<NotificationsProps, 'container'> {
  // UI
  placement?: Placement
  getContainer?: () => HTMLElement | ShadowRoot

  // Behavior
  closable?: NotificationListConfig['closable']
  duration?: number | false | null
  showProgress?: NotificationListConfig['showProgress']
}

export interface NotificationAPI {
  open: (config: OptionalConfig) => void
  close: (key: Key) => void
  destroy: () => void
}

interface OpenTask {
  type: 'open'
  config: NotificationListConfig
}

interface CloseTask {
  type: 'close'
  key: Key
}

interface DestroyTask {
  type: 'destroy'
}

type Task = OpenTask | CloseTask | DestroyTask

let uniqueKey = 0

function mergeConfig<T>(...objList: Partial<T>[]): T {
  const clone = {} as T
  objList.forEach((obj) => {
    if (obj) {
      Object.keys(obj).forEach((key) => {
        const value = (obj as any)[key]
        if (value !== undefined) {
          ;(clone as any)[key] = value
        }
      })
    }
  })
  return clone
}

export default function useNotification(
  rootConfig: MaybeRef<NotificationConfig> = {},
): [NotificationAPI, () => VueNode] {
  const configRef = computed(() => unref(rootConfig) || {})
  const container = shallowRef<HTMLElement | ShadowRoot>()
  const notificationsRef = shallowRef<NotificationsRef>()
  const taskQueue = shallowRef<Task[]>([])

  const shareConfig = computed<SharedConfig>(() => {
    const { placement, closable, duration, showProgress } = configRef.value
    return { placement, closable, duration, showProgress }
  })

  function resolveContainer() {
    const getContainer = configRef.value.getContainer || defaultGetContainer
    return getContainer()
  }

  const contextHolder = () => (
    <Notifications
      container={container.value}
      ref={notificationsRef as any}
      prefixCls={configRef.value.prefixCls}
      motion={configRef.value.motion as TransitionGroupProps | ((p: Placement) => TransitionGroupProps) | undefined}
      maxCount={configRef.value.maxCount}
      pauseOnHover={configRef.value.pauseOnHover}
      classNames={configRef.value.classNames}
      styles={configRef.value.styles}
      components={configRef.value.components}
      className={configRef.value.className}
      style={configRef.value.style as ((p: Placement) => CSSProperties) | undefined}
      onAllRemoved={configRef.value.onAllRemoved}
      stack={configRef.value.stack as StackInput | undefined}
      renderNotifications={configRef.value.renderNotifications}
    />
  )

  const api: NotificationAPI = {
    open(config) {
      const merged = mergeConfig<NotificationListConfig>(shareConfig.value, config as any)
      if (merged.key === null || merged.key === undefined) {
        merged.key = `vc-notification-${uniqueKey}`
        uniqueKey += 1
      }
      taskQueue.value = [...taskQueue.value, { type: 'open', config: merged }]
    },
    close(key) {
      taskQueue.value = [...taskQueue.value, { type: 'close', key }]
    },
    destroy() {
      taskQueue.value = [...taskQueue.value, { type: 'destroy' }]
    },
  }

  onMounted(() => {
    container.value = resolveContainer()
  })
  watch(
    () => configRef.value.getContainer,
    () => {
      container.value = resolveContainer()
    },
  )

  watch(taskQueue, () => {
    if (notificationsRef.value && taskQueue.value.length) {
      const tasks = taskQueue.value
      tasks.forEach((task) => {
        switch (task.type) {
          case 'open':
            notificationsRef.value?.open(task.config)
            break
          case 'close':
            notificationsRef.value?.close(task.key)
            break
          case 'destroy':
            notificationsRef.value?.destroy()
            break
        }
      })
      taskQueue.value = taskQueue.value.filter(task => !tasks.includes(task))
    }
  })

  return [api, contextHolder]
}
