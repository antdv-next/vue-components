import type { VueNode } from '@v-c/util/dist/type'
import type { Component, CSSProperties, PropType } from 'vue'
import type { ClosableType } from './hooks/useClosable'
import type { NotificationProgressProps } from './Progress'
import { classNames as clsx } from '@v-c/util'
import { computed, defineComponent, shallowRef, toRef, watch } from 'vue'
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
  class?: string
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
  props?: Record<string, any>

  // Behavior
  duration?: number | false | null
  showProgress?: boolean
  times?: number
  hovering?: boolean
  pauseOnHover?: boolean

  // Function
  onClick?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  /** @deprecated Please use `closable.onClose` instead. */
  onClose?: () => void
}

const Notification = defineComponent({
  name: 'Notification',
  inheritAttrs: false,
  props: {
    prefixCls: { type: String, required: true },
    class: { type: String, default: undefined },
    style: { type: Object as PropType<CSSProperties>, default: undefined },
    classNames: { type: Object as PropType<NotificationClassNames>, default: undefined },
    styles: { type: Object as PropType<NotificationStyles>, default: undefined },
    components: { type: Object as PropType<ComponentsType>, default: undefined },

    title: { type: null as any, default: undefined },
    description: { type: null as any, default: undefined },
    icon: { type: null as any, default: undefined },
    actions: { type: null as any, default: undefined },
    role: { type: String, default: undefined },
    closable: { type: [Boolean, Object, null] as PropType<ClosableType>, default: undefined },
    offset: { type: Number, default: undefined },
    notificationIndex: { type: Number, default: undefined },
    stackInThreshold: { type: Boolean, default: false },
    props: { type: Object as PropType<Record<string, any>>, default: undefined },

    duration: { type: [Number, Boolean] as PropType<number | false | null>, default: 4.5 },
    showProgress: { type: Boolean, default: false },
    times: { type: Number, default: undefined },
    hovering: { type: Boolean, default: false },
    pauseOnHover: { type: Boolean, default: true },

    onClick: { type: Function as PropType<(event: MouseEvent) => void>, default: undefined },
    onMouseEnter: { type: Function as PropType<(event: MouseEvent) => void>, default: undefined },
    onMouseLeave: { type: Function as PropType<(event: MouseEvent) => void>, default: undefined },
    onClose: { type: Function as PropType<() => void>, default: undefined },
  },
  setup(props, { attrs, expose }) {
    const noticeRef = shallowRef<HTMLDivElement | null>(null)
    expose({
      get nativeElement() {
        return noticeRef.value
      },
    })

    const noticePrefixCls = computed(() => `${props.prefixCls}-notice`)
    const localHovering = shallowRef(false)
    const percent = shallowRef(0)

    // ========================= Close ==========================
    const [mergedClosable, closableConfig, closeBtnAriaProps] = useClosable(
      toRef(props, 'closable'),
    )
    const onInternalClose = () => {
      closableConfig.value.onClose?.()
      props.onClose?.()
    }

    // ======================== Duration ========================
    const [onResume, onPause] = useNoticeTimer(
      toRef(props, 'duration'),
      onInternalClose,
      (ptg) => {
        percent.value = ptg
      },
    )

    watch(
      [
        () => props.pauseOnHover,
        () => props.hovering,
        localHovering,
      ],
      ([pauseOnHover, forcedHovering, hovering]) => {
        if (!pauseOnHover) {
          return
        }
        if (forcedHovering) {
          onPause()
        }
        else if (!hovering) {
          onResume()
        }
      },
      { immediate: true },
    )

    // ========================= Hover ==========================
    function onInternalMouseEnter(event: MouseEvent) {
      localHovering.value = true
      if (props.pauseOnHover) {
        onPause()
      }
      props.onMouseEnter?.(event)
    }

    function onInternalMouseLeave(event: MouseEvent) {
      localHovering.value = false
      if (props.pauseOnHover && !props.hovering) {
        onResume()
      }
      props.onMouseLeave?.(event)
    }

    function onInternalCloseClick(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()
      onInternalClose()
    }

    // ======================== Position ========================
    let lastOffset = props.offset
    let lastIndex = props.notificationIndex
    watch(
      () => props.offset,
      (val) => {
        if (val !== undefined)
          lastOffset = val
      },
      { immediate: true },
    )
    watch(
      () => props.notificationIndex,
      (val) => {
        if (val !== undefined)
          lastIndex = val
      },
      { immediate: true },
    )

    return () => {
      const {
        title,
        description,
        icon,
        actions,
        role,
        showProgress,
        duration,
        classNames,
        styles,
        components,
        class: className,
        style,
        props: rootProps,
        onClick,
      } = props

      const validPercent = 100 - Math.min(Math.max(percent.value * 100, 0), 100)
      const ProgressComponent = (components?.progress || DefaultProgress) as any

      // ======================== Content =========================
      const titleNode
        = title !== undefined && title !== null
          ? (
              <div
                class={clsx(`${noticePrefixCls.value}-title`, classNames?.title)}
                style={styles?.title}
              >
                {title}
              </div>
            )
          : null

      const descNode
        = description !== undefined && description !== null
          ? (
              <div
                class={clsx(
                  `${noticePrefixCls.value}-description`,
                  classNames?.description,
                )}
                style={styles?.description}
              >
                {description}
              </div>
            )
          : null

      const hasTitle = titleNode !== null
      const hasDescription = descNode !== null
      let contentNode: VueNode = null

      if (hasTitle && hasDescription) {
        contentNode = (
          <div
            class={clsx(`${noticePrefixCls.value}-section`, classNames?.section)}
            style={styles?.section}
          >
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
          <div
            class={clsx(`${noticePrefixCls.value}-wrapper`, classNames?.wrapper)}
            style={styles?.wrapper}
          >
            <div
              class={clsx(`${noticePrefixCls.value}-icon`, classNames?.icon)}
              style={styles?.icon}
            >
              {icon}
            </div>
            {contentNode}
          </div>
        )
      }

      const actionsNode = actions
        ? (
            <div
              class={clsx(`${noticePrefixCls.value}-actions`, classNames?.actions)}
              style={styles?.actions}
            >
              {actions}
            </div>
          )
        : null

      // ========================= Render =========================
      const mergedOffset = props.offset ?? lastOffset
      const mergedIndex = props.notificationIndex ?? lastIndex ?? 0

      const mergedStyle: CSSProperties & Record<string, any> = {
        '--notification-index': mergedIndex,
        ...styles?.root,
        ...style,
      }

      if (mergedOffset !== undefined) {
        mergedStyle['--notification-y'] = `${mergedOffset}px`
      }

      const mergedRole = role ?? rootProps?.role ?? 'alert'

      return (
        <div
          {...rootProps}
          ref={noticeRef as any}
          role={mergedRole}
          data-notification-index={mergedIndex}
          class={clsx(
            noticePrefixCls.value,
            className,
            (attrs as any).class,
            classNames?.root,
            {
              [`${noticePrefixCls.value}-closable`]: mergedClosable.value,
              [`${noticePrefixCls.value}-stack-in-threshold`]: props.stackInThreshold,
            },
          )}
          style={mergedStyle}
          onClick={onClick}
          onMouseenter={onInternalMouseEnter}
          onMouseleave={onInternalMouseLeave}
        >
          {contentNode}
          {actionsNode}

          {mergedClosable.value && (
            <button
              type="button"
              class={clsx(`${noticePrefixCls.value}-close`, classNames?.close)}
              aria-label="Close"
              {...closeBtnAriaProps.value}
              style={styles?.close}
              onClick={onInternalCloseClick}
            >
              {closableConfig.value.closeIcon}
            </button>
          )}

          {showProgress && typeof duration === 'number' && duration > 0 && (
            <ProgressComponent
              class={clsx(`${noticePrefixCls.value}-progress`, classNames?.progress)}
              percent={validPercent}
              style={styles?.progress}
            />
          )}
        </div>
      )
    }
  },
})

export default Notification
