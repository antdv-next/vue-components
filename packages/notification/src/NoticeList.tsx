import type { CSSProperties, TransitionGroupProps } from 'vue'
import type { InnerOpenConfig, Key, NoticeConfig, OpenConfig, Placement, StackConfig } from './interface.ts'
import { unrefElement } from '@v-c/util/dist/vueuse/unref-element'
import { classNames as clsx } from '@v-c/util'
import { computed, defineComponent, reactive, ref, toRef, TransitionGroup, watch } from 'vue'
import useStack from './hooks/useStack.ts'
import Notice from './Notice.tsx'
import { useNotificationContext } from './NotificationProvider.tsx'

export interface NoticeListProps {
  configList?: OpenConfig[]
  placement?: Placement
  prefixCls?: string
  motion?: TransitionGroupProps | ((placement: Placement) => TransitionGroupProps)
  stack?: StackConfig

  // Events
  onAllNoticeRemoved?: (placement: Placement) => void
  onNoticeClose?: (key: Key) => void
}

const NoticeList = defineComponent<NoticeListProps>(
  (props, { attrs }) => {
    const ctx = useNotificationContext()
    const dictRef = reactive<Record<string, HTMLDivElement>>({})
    const lastestNotice = computed(() => {
      // 获取最后一个通知
      const keys = Object.keys(dictRef)
      if (keys.length === 0)
        return null
      return dictRef[keys[keys.length - 1]]
    })
    const hoverKeys = ref<string[]>([])
    const keys = computed(() => {
      return props.configList?.map(config => ({
        config,
        key: String(config.key),
      }))
    })

    const stackConfig = toRef(props, 'stack')
    const [stack, { offset, threshold, gap }] = useStack(stackConfig)
    const expanded = computed(
      () => stack.value && (hoverKeys.value.length > 0 || keys.value!.length <= (threshold as any).value),
    )
    const placementMotion = computed(() => typeof props.motion === 'function' ? props?.motion(props.placement!) : props.motion)

    // Clean hover key
    watch(
      [hoverKeys, keys, stack],
      () => {
        if (stack.value && hoverKeys.value.length > 1) {
          hoverKeys.value = hoverKeys.value.filter(key => keys.value?.some(({ key: dataKey }) => key === dataKey))
        }
      },
    )

    const checkAllClosed = () => {
      const len = keys.value?.length ?? 0
      if (len === 0) {
        props.onAllNoticeRemoved?.(props.placement!)
      }
    }

    return () => {
      const { prefixCls, placement, onNoticeClose } = props

      const renderNotify = () => {
        // 渲染notify
        return keys.value?.map(({ config }, motionIndex) => {
          const { key, times } = config as InnerOpenConfig
          const strKey = String(key)
          const {
            className: configClassName,
            style: configStyle,
            classNames: configClassNames,
            styles: configStyles,
            ...restConfig
          } = config as NoticeConfig
          const dataIndex = keys.value?.findIndex(item => item.key === strKey) ?? -1
          // If dataIndex is -1, that means this notice has been removed in data, but still in dom
          // Should minus (motionIndex - 1) to get the correct index because keys.length is not the same as dom length
          const stackStyle: CSSProperties = {}
          if (stack.value) {
            const index = keys.value!.length - 1 - (dataIndex > -1 ? dataIndex : motionIndex - 1)
            const transformX = placement === 'top' || placement === 'bottom' ? '-50%' : '0'
            if (index > 0) {
              stackStyle.height = expanded.value
                ? dictRef[strKey]?.offsetHeight
                : lastestNotice.value?.offsetHeight

              if (!Number.isNaN(stackStyle.height) && typeof stackStyle.height === 'number') {
                stackStyle.height = `${stackStyle.height}px`
              }
              // Transform
              let verticalOffset = 0
              for (let i = 0; i < index; i++) {
                verticalOffset += (dictRef as any)[(keys as any).value[keys.value!.length - 1 - i]?.key]?.offsetHeight + gap?.value
              }

              const transformY
                  = (expanded.value ? verticalOffset : index * (offset as any).value) * (placement?.startsWith('top') ? 1 : -1)
              const scaleX = !expanded.value && lastestNotice.value?.offsetWidth && (dictRef as any)[strKey]?.offetWidth
                ? (lastestNotice.value?.offsetWidth - (offset as any)?.value * 2 * (index < 3 ? index : 3))
                / dictRef[strKey]?.offsetWidth
                : 1

              stackStyle.transform = `translate3d(${transformX}px, ${transformY}px, 0px) scaleX(${scaleX})`
            }
            else {
              stackStyle.transform = `translate3d(${transformX}px, 0px, 0px)`
            }
          }
          return (
            <div
              key={strKey}
              class={clsx(
                `${prefixCls}-notice-wrapper`,
                configClassNames?.wrapper,
              )}
              style={{
                ...stackStyle,
                ...configStyles?.wrapper,
              }}
              onMouseenter={() => {
                hoverKeys.value = hoverKeys.value?.includes(strKey) ? hoverKeys.value : [...hoverKeys.value, strKey]
              }}
              onMouseleave={() => {
                hoverKeys.value = hoverKeys.value?.filter(k => k !== strKey)
              }}
            >
              <Notice
                {...restConfig as any}
                ref={(el) => {
                  const _el = unrefElement<HTMLDivElement>(el as any)
                  if (dataIndex > -1) {
                    dictRef[strKey] = _el
                  }
                  else {
                    delete dictRef[strKey]
                  }
                }}
                prefixCls={prefixCls ?? ''}
                classNames={configClassNames}
                styles={configStyles}
                class={clsx(configClassName, ctx.classNames?.notice)}
                style={configStyle}
                times={times}
                eventKey={key}
                onNoticeClose={onNoticeClose}
                hovering={stack.value && hoverKeys.value.length > 0}
              />
            </div>
          )
        })
      }
      return (
        <TransitionGroup
          key={placement}
          tag="div"
          appear
          {
            ...{
              class: clsx(
                prefixCls,
                `${prefixCls}-${placement}`,
                ctx.classNames?.list,
                (attrs as any).class,
                {
                  [`${prefixCls}-stack-expanded`]: expanded.value,
                  [`${prefixCls}-stack`]: stack.value,
                },
              ),
              ...placementMotion.value,
            }
          }
          onAfterLeave={checkAllClosed}
        >
          {renderNotify()}
        </TransitionGroup>
      )
    }
  },
  {
    name: 'NoticeList',
  },
)

export default NoticeList
