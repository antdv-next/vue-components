import type { VueNode } from '@v-c/util/dist/type'
import type { Component, CSSProperties, HTMLAttributes } from 'vue'
import type { ClosableType } from './hooks/useClosable'
import type { NotificationProgressProps } from './Progress'
import { clsx } from '@v-c/util'
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import useClosable from './hooks/useClosable'
import useNoticeTimer from './hooks/useNoticeTimer'
import DefaultProgress from './Progress'

export interface NotificationClassNames {
  wrapper?: string
  root?: string
  icon?: string
  section?: string
  title?: string
  description?: string
  actions?: string
  close?: string
  progress?: string
}

export interface NotificationStyles {
  wrapper?: CSSProperties
  root?: CSSProperties
  icon?: CSSProperties
  section?: CSSProperties
  title?: CSSProperties
  description?: CSSProperties
  actions?: CSSProperties
  close?: CSSProperties
  progress?: CSSProperties
}

export interface ComponentsType {
  progress?: Component<NotificationProgressProps>
}

export interface NotificationProps {
  // Style
  prefixCls: string
  className?: string
  style?: CSSProperties
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  components?: ComponentsType

  // UI
  title?: VueNode
  description?: VueNode
  icon?: VueNode
  actions?: VueNode
  role?: string
  closable?: ClosableType
  offset?: number
  notificationIndex?: number
  stackInThreshold?: boolean
  props?: HTMLAttributes & Record<string, any>

  // Behavior
  duration?: number | false | null
  showProgress?: boolean
  times?: number
  hovering?: boolean
  pauseOnHover?: boolean

  // Function
  onClick?: (e: MouseEvent) => void
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  /** @deprecated Please use `closable.onClose` instead. */
  onClose?: () => void
}

interface NoticeStyle extends CSSProperties {
  '--notification-index'?: number
  '--notification-y'?: string
}

const Notification = defineComponent<NotificationProps>(
  (props, { attrs, expose }) => {
    const nodeRef = ref<HTMLDivElement | null>(null)
    const percent = shallowRef(0)
    const hovering = shallowRef(false)

    expose({
      nativeElement: nodeRef,
    })

    // ========================= Close ==========================
    const closableRef = computed(() => props.closable)
    const [mergedClosable, closableConfig, closeBtnAriaProps] = useClosable(closableRef)

    const onInternalClose = () => {
      closableConfig.value.onClose?.()
      props.onClose?.()
    }

    // ======================== Duration ========================
    const mergedDuration = computed(() => {
      if (props.duration === undefined) {
        return 4.5
      }
      return props.duration
    })
    const [onResume, onPause] = useNoticeTimer(
      mergedDuration,
      onInternalClose,
      (next) => {
        percent.value = next
      },
    )

    // Sync pause/resume to forced and local hover.
    watch(
      [
        () => props.hovering,
        hovering,
        () => props.pauseOnHover,
      ],
      () => {
        const pauseOnHover = props.pauseOnHover ?? true
        if (!pauseOnHover) {
          return
        }
        if (props.hovering) {
          onPause()
        }
        else if (!hovering.value) {
          onResume()
        }
      },
      { immediate: true },
    )

    // Cache offset/notificationIndex so transitions still have a value
    // even when the controlling list omits them temporarily.
    const offsetRef = shallowRef(props.offset)
    const indexRef = shallowRef(props.notificationIndex)
    watch(() => props.offset, (next) => {
      if (next !== undefined) {
        offsetRef.value = next
      }
    })
    watch(() => props.notificationIndex, (next) => {
      if (next !== undefined) {
        indexRef.value = next
      }
    })

    // ======================== Hover ==========================
    const onInternalMouseEnter = (e: MouseEvent) => {
      hovering.value = true
      if ((props.pauseOnHover ?? true)) {
        onPause()
      }
      props.onMouseEnter?.(e)
      ;(props.props?.onMouseenter as any)?.(e)
    }

    const onInternalMouseLeave = (e: MouseEvent) => {
      hovering.value = false
      const pauseOnHover = props.pauseOnHover ?? true
      if (pauseOnHover && !props.hovering) {
        onResume()
      }
      props.onMouseLeave?.(e)
      ;(props.props?.onMouseleave as any)?.(e)
    }

    const onInternalCloseClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onInternalClose()
    }

    return () => {
      const {
        prefixCls,
        className,
        style,
        classNames: ncs,
        styles: nss,
        components,
        title,
        description,
        icon,
        actions,
        role,
        stackInThreshold,
        props: rootProps,
        showProgress,
        duration,
      } = props

      const noticePrefixCls = `${prefixCls}-notice`

      // ======================== Content =========================
      const titleNode = title !== undefined && title !== null
        ? (
            <div class={clsx(`${noticePrefixCls}-title`, ncs?.title)} style={nss?.title}>
              {title}
            </div>
          )
        : null

      const descNode = description !== undefined && description !== null
        ? (
            <div class={clsx(`${noticePrefixCls}-description`, ncs?.description)} style={nss?.description}>
              {description}
            </div>
          )
        : null

      const hasTitle = titleNode !== null
      const hasDescription = descNode !== null

      let contentNode: VueNode = null
      if (hasTitle && hasDescription) {
        contentNode = (
          <div class={clsx(`${noticePrefixCls}-section`, ncs?.section)} style={nss?.section}>
            {titleNode}
            {descNode}
          </div>
        )
      }
      else {
        contentNode = titleNode || descNode
      }

      if (icon !== undefined && icon !== null) {
        contentNode = (
          <div class={clsx(`${noticePrefixCls}-wrapper`, ncs?.wrapper)} style={nss?.wrapper}>
            <div class={clsx(`${noticePrefixCls}-icon`, ncs?.icon)} style={nss?.icon}>
              {icon}
            </div>
            {contentNode}
          </div>
        )
      }

      const actionsNode = actions
        ? (
            <div class={clsx(`${noticePrefixCls}-actions`, ncs?.actions)} style={nss?.actions}>
              {actions}
            </div>
          )
        : null

      // ========================= Render =========================
      const mergedOffset = props.offset ?? offsetRef.value
      const mergedIndex = props.notificationIndex ?? indexRef.value ?? 0
      const safePercent = Math.min(Math.max(percent.value * 100, 0), 100)
      const validPercent = 100 - safePercent
      const ProgressComponent = (components?.progress || DefaultProgress) as any

      const mergedStyle: NoticeStyle = {
        '--notification-index': mergedIndex,
        ...nss?.root,
        ...style,
      }
      if (mergedOffset !== undefined) {
        mergedStyle['--notification-y'] = `${mergedOffset}px`
      }

      const mergedRole = role ?? (rootProps as any)?.role ?? 'alert'

      return (
        <div
          {...rootProps}
          ref={nodeRef}
          role={mergedRole}
          data-notification-index={mergedIndex}
          class={clsx(
            noticePrefixCls,
            className,
            (attrs as any).class,
            ncs?.root,
            {
              [`${noticePrefixCls}-closable`]: mergedClosable.value,
              [`${noticePrefixCls}-stack-in-threshold`]: stackInThreshold,
            },
          )}
          style={{
            ...mergedStyle,
            ...((attrs as any).style as CSSProperties | undefined),
          }}
          onClick={props.onClick}
          onMouseenter={onInternalMouseEnter}
          onMouseleave={onInternalMouseLeave}
        >
          {contentNode}
          {actionsNode}

          {mergedClosable.value && (
            <button
              type="button"
              class={clsx(`${noticePrefixCls}-close`, ncs?.close)}
              aria-label="Close"
              {...closeBtnAriaProps.value}
              style={nss?.close}
              onClick={onInternalCloseClick}
            >
              {closableConfig.value.closeIcon}
            </button>
          )}

          {showProgress && typeof duration === 'number' && duration > 0 && (
            <ProgressComponent
              {...{
                className: clsx(`${noticePrefixCls}-progress`, ncs?.progress),
                percent: validPercent,
                style: nss?.progress,
              } as NotificationProgressProps}
            />
          )}
        </div>
      )
    }
  },
  {
    name: 'Notification',
    inheritAttrs: false,
  },
)

export default Notification
