import type { CSSProperties, ExtractPropTypes, PropType, SlotsType, TransitionProps } from 'vue'
import type { DrawerContextProps } from './context'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { classNames } from '@v-c/util'
import { computed, defineComponent, onBeforeUnmount, ref, Transition, watch } from 'vue'
import { useDrawerContext, useDrawerInject } from './context'
import DrawerPanel from './DrawerPanel'
import { parseWidthHeight } from './util'

const sentinelStyle: CSSProperties = {
  width: 0,
  height: 0,
  overflow: 'hidden',
  outline: 'none',
  position: 'absolute',
}

export type Placement = 'left' | 'right' | 'top' | 'bottom'

export interface PushConfig {
  distance?: number | string
}

function drawerPopupProps() {
  return {
    prefixCls: { type: String, required: true },
    open: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
    push: { type: [Boolean, Object], default: undefined },
    forceRender: { type: Boolean, default: false },
    autoFocus: { type: Boolean, default: false },
    keyboard: { type: Boolean, default: true },
    rootClassName: String,
    rootStyle: Object as PropType<CSSProperties>,
    zIndex: Number,
    placement: String,
    id: String,
    width: [Number, String],
    height: [Number, String],
    mask: { type: Boolean, default: true },
    maskClosable: { type: Boolean, default: true },
    maskClassName: String,
    maskStyle: Object,
    motion: [Function, Object],
    maskMotion: Object,
    onAfterOpenChange: Function,
    onClose: Function,
    onMouseenter: Function,
    onMouseover: Function,
    onMouseleave: Function,
    onClick: Function,
    onKeydown: Function,
    onKeyup: Function,
  }
}

export type DrawerPopupProps = Partial<ExtractPropTypes<ReturnType<typeof drawerPopupProps>>>

function getTransitionProps(transitionName: string, opt: TransitionProps = {}) {
  const transitionProps: TransitionProps = transitionName
    ? {
        name: transitionName,
        appear: true,
        // type: 'animation',
        appearFromClass: `${transitionName}-appear ${transitionName}-appear-prepare`,
        // appearActiveClass: `antdv-base-transtion`,
        appearToClass: `${transitionName}-appear ${transitionName}-appear-active`,
        enterFromClass: `${transitionName}-enter ${transitionName}-enter-prepare ${transitionName}-enter-start`,
        enterActiveClass: `${transitionName}-enter ${transitionName}-enter-prepare`,
        enterToClass: `${transitionName}-enter ${transitionName}-enter-active`,
        leaveFromClass: ` ${transitionName}-leave`,
        leaveActiveClass: `${transitionName}-leave ${transitionName}-leave-active`,
        leaveToClass: `${transitionName}-leave ${transitionName}-leave-active`,
        ...opt,
      }
    : { css: false, ...opt }
  return transitionProps
}

export default defineComponent({
  name: 'DrawerPopup',
  props: drawerPopupProps(),
  emits: ['close', 'afterOpenChange', 'mouseenter', 'mouseover', 'mouseleave', 'click', 'keydown', 'keyup'] as const,
  slots: Object as SlotsType<{
    default: () => any
    drawerRender: () => any
  }>,
  setup(props, { attrs, slots, emit }) {
    const panelRef = ref<HTMLDivElement>()
    const sentinelStartRef = ref<HTMLDivElement>()
    const sentinelEndRef = ref<HTMLDivElement>()

    const onPanelKeyDown = (event: KeyboardEvent) => {
      const { key, shiftKey } = event

      switch (key) {
        // Tab active
        case 'Tab': {
          if (!shiftKey && document.activeElement === sentinelEndRef.value) {
            sentinelStartRef.value?.focus({ preventScroll: true })
          }
          else if (
            shiftKey
            && document.activeElement === sentinelStartRef.value
          ) {
            sentinelEndRef.value?.focus({ preventScroll: true })
          }
          break
        }

        // Close
        case 'Escape': {
          if (props.onClose && props.keyboard) {
            event.stopPropagation()
            emit('close', event)
          }
          break
        }
      }
    }

    // Auto Focus
    watch(
      () => props.open,
      (open) => {
        if (open && props.autoFocus) {
          panelRef.value?.focus({ preventScroll: true })
        }
      },
    )

    // Push state
    const pushed = ref(false)
    const parentContext = useDrawerContext()

    // Merge push distance
    const pushDistance = computed(() => {
      let pushConfig: PushConfig
      if (typeof props.push === 'boolean') {
        pushConfig = props.push ? {} : { distance: 0 }
      }
      else {
        pushConfig = props.push || {}
      }
      return pushConfig?.distance ?? parentContext?.pushDistance ?? 180
    })

    const mergedContext = computed<DrawerContextProps>(() => ({
      pushDistance: pushDistance.value,
      push: () => {
        pushed.value = true
      },
      pull: () => {
        pushed.value = false
      },
    }))
    useDrawerInject(mergedContext.value)

    // Tell parent to push
    watch(
      () => props.open,
      (open) => {
        if (open) {
          parentContext?.push?.()
        }
        else {
          parentContext?.pull?.()
        }
      },
    )

    // Clean up
    onBeforeUnmount(() => {
      parentContext?.pull?.()
    })

    return () => {
      const {
        prefixCls = 'vc-drawer',
        open,
        placement,
        inline,

        // Root
        rootClassName,
        rootStyle,
        zIndex,

        // Drawer
        id,
        motion = { name: 'panel-motion' },
        width,
        height,

        // Mask
        mask,
        maskClosable,
        maskMotion = { name: 'mask-motion' },
        maskClassName,
        maskStyle,
      } = props
      const maskMotionProps = getTransitionProps(maskMotion.name)
      // Mask Node
      const maskNode = mask && (
        <Transition key="mask" {...maskMotionProps}>
          <div
            v-show={open}
            class={classNames(
              `${prefixCls}-mask`,
              [attrs?.class],
              maskClassName,
            )}
            style={{
              ...maskStyle,
              ...attrs?.style as CSSProperties,
            }}
            onClick={() => {
              if (maskClosable && open)
                emit('close')
            }}
            // ref={maskRef}
          />
        </Transition>
      )

      // Panel Node
      const motionProps = () => {
        return typeof motion === 'function'
          ? motion(placement)
          : motion
      }
      const getMotion = motionProps()
      const panelMotionProps = getTransitionProps(getMotion.name)

      const wrapperStyle = () => {
        const style: Record<string, any> = {}

        if (pushed.value && pushDistance.value) {
          switch (props.placement) {
            case 'top':
              style.transform = `translateY(${pushDistance.value}px)`
              break
            case 'bottom':
              style.transform = `translateY(${-pushDistance.value}px)`
              break
            case 'left':
              style.transform = `translateX(${pushDistance.value}px)`
              break
            default:
              style.transform = `translateX(${-pushDistance.value}px)`
              break
          }
        }

        if (placement === 'left' || placement === 'right') {
          style.width = parseWidthHeight(width)
        }
        else {
          style.height = parseWidthHeight(height)
        }

        return style
      }

      const eventHandlers = () => ({
        onMouseenter: (e: MouseEvent) => emit('mouseenter', e),
        onMouseover: (e: MouseEvent) => emit('mouseover', e),
        onMouseleave: (e: MouseEvent) => emit('mouseleave', e),
        onClick: (e: MouseEvent) => emit('click', e),
        onKeydown: (e: KeyboardEvent) => emit('keydown', e),
        onKeyup: (e: KeyboardEvent) => emit('keyup', e),
      })

      const content = (
        <DrawerPanel
          id={id}
          // containerRef={motionRef}
          prefixCls={prefixCls}
          class={classNames([attrs.class])}
          style={{
            ...attrs.style as CSSProperties,
          }}
          {...pickAttrs(props, { aria: true })}
          {...eventHandlers}
        >
          {slots.default?.()}
        </DrawerPanel>
      )

      const containerStyle = () => {
        const style = { ...rootStyle }
        if (zIndex)
          style.zIndex = zIndex

        return style
      }
      const panelNode = (
        <Transition
          key="panel"
          {...panelMotionProps}
          leaveActiveClass={`${prefixCls}-content-wrapper-hidden`}
          onAfterEnter={() => emit('afterOpenChange', open)}
          onAfterLeave={() => emit('afterOpenChange', open)}
        >
          <div
            v-show={open}
            class={classNames(
              `${prefixCls}-content-wrapper`,
              [attrs.class],
            )}
            style={{
              ...wrapperStyle(),
              ...attrs.style as CSSProperties,
            }}
            {...pickAttrs(props, { data: true })}
          >
            {/* {slots.drawerRender ? slots.drawerRender?.({ content }) : content} */}
            {content}
          </div>
        </Transition>
      )
      return (
        <div
          class={classNames(
            prefixCls,
            `${prefixCls}-${placement}`,
            rootClassName,
            {
              [`${prefixCls}-open`]: open,
              [`${prefixCls}-inline`]: inline,
            },
          )}
          style={containerStyle()}
          tabindex={-1}
          ref={panelRef}
          onKeydown={onPanelKeyDown}
        >
          {maskNode}
          <div
            tabindex={0}
            ref={sentinelStartRef}
            style={sentinelStyle}
            aria-hidden="true"
            data-sentinel="start"
          />
          {panelNode}
          <div
            tabindex={0}
            ref={sentinelEndRef}
            style={sentinelStyle}
            aria-hidden="true"
            data-sentinel="end"
          />
        </div>
      )
    }
  },
})
