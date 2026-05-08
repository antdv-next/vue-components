import type { InjectionKey, PropType, Ref } from 'vue'
import { computed, defineComponent, inject, provide, ref } from 'vue'

export interface NotificationContextProps {
  classNames?: {
    notice?: string
    list?: string
  }
}

export const NotificationContext: InjectionKey<Ref<NotificationContextProps>> = Symbol(
  'NotificationContext',
)

export function useNotificationProvider(props: Ref<NotificationContextProps>) {
  provide(NotificationContext, props)
  return props
}

export function useNotificationContext() {
  return inject(NotificationContext, ref({}))
}

const NotificationProvider = defineComponent({
  name: 'NotificationProvider',
  props: {
    classNames: {
      type: Object as PropType<NotificationContextProps['classNames']>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const ctx = computed<NotificationContextProps>(() => ({ classNames: props.classNames }))
    provide(NotificationContext, ctx)
    return () => slots.default?.()
  },
})

export default NotificationProvider
