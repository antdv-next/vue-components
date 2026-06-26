import type { PortalProps } from '@v-c/portal'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { TransformAction, TransformType } from '../hooks/useImageTransform'
import type { ImgInfo } from '../Image'
import type { FooterSemanticName } from './Footer'
import Portal from '@v-c/portal'
import { clsx } from '@v-c/util'
import canUseDom from '@v-c/util/dist/Dom/canUseDom'
import { useLockFocus } from '@v-c/util/dist/Dom/focus'
import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, nextTick, shallowRef, Transition, watch, watchEffect } from 'vue'
import { usePreviewGroupContext } from '../context'
import useImageTransform from '../hooks/useImageTransform'
import useMouseEvent from '../hooks/useMouseEvent'
import useStatus from '../hooks/useStatus'
import useTouchEvent from '../hooks/useTouchEvent'
import { BASE_SCALE_RATIO } from '../previewConfig'
import CloseBtn from './CloseBtn'
import Footer from './Footer'
import PrevNext from './PrevNext'

// Note: if you want to add `action`,
// pls contact @zombieJ or @thinkasany first.
export type PreviewSemanticName = 'root' | 'mask' | 'body' | 'close' | FooterSemanticName

export interface OperationIcons {
  rotateLeft?: VueNode
  rotateRight?: VueNode
  zoomIn?: VueNode
  zoomOut?: VueNode
  close?: VueNode
  prev?: VueNode
  next?: VueNode
  /** @deprecated Please use `prev` instead */
  left?: VueNode
  /** @deprecated Please use `next` instead */
  right?: VueNode
  flipX?: VueNode
  flipY?: VueNode
}

export interface Actions {
  onActive: (offset: number) => void
  onFlipY: () => void
  onFlipX: () => void
  onRotateLeft: () => void
  onRotateRight: () => void
  onZoomOut: () => void
  onZoomIn: () => void
  onClose: () => void
  onReset: () => void
}

export interface ToolbarRenderInfoType {
  icons: {
    prevIcon?: VueNode
    nextIcon?: VueNode
    flipYIcon: VueNode
    flipXIcon: VueNode
    rotateLeftIcon: VueNode
    rotateRightIcon: VueNode
    zoomOutIcon: VueNode
    zoomInIcon: VueNode
  }
  actions: Actions
  transform: TransformType
  current: number
  total: number
  image: ImgInfo
}

export interface InternalPreviewConfig {
  // Semantic
  /** Better to use `classNames.root` instead */
  rootClassName?: string

  // Image
  src?: string
  alt?: string

  // Scale
  scaleStep?: number
  minScale?: number
  maxScale?: number

  // Display
  motionName?: string
  open?: boolean
  getContainer?: PortalProps['getContainer']
  zIndex?: number
  maskClosable?: boolean
  afterOpenChange?: (open: boolean) => void

  // Focus
  focusTrap?: boolean

  // Operation
  movable?: boolean
  icons?: OperationIcons
  closeIcon?: VueNode | boolean | null

  onTransform?: (info: { transform: TransformType, action: TransformAction }) => void

  // Render
  countRender?: (current: number, total: number) => VueNode
  imageRender?: (
    originalNode: VueNode,
    info: { transform: TransformType, current?: number, image: ImgInfo },
  ) => VueNode
  actionsRender?: (
    originalNode: VueNode,
    info: ToolbarRenderInfoType,
  ) => VueNode
}

export interface PreviewProps extends InternalPreviewConfig {
  // Misc
  prefixCls: string

  classNames?: Partial<Record<PreviewSemanticName, string>>
  styles?: Partial<Record<PreviewSemanticName, CSSProperties>>

  // Origin image Info
  imageInfo?: {
    width: number | string
    height: number | string
  }
  fallback?: string

  // Preview image
  imgCommonProps?: Record<string, any>
  width?: string | number
  height?: string | number

  // Pagination
  current?: number
  count?: number
  onChange?: (current: number, prev: number) => void

  // Events
  onClose?: () => void

  // Display
  mousePosition: null | { x: number, y: number }
}

const defaults = {
  movable: true,
  scaleStep: 0.5,
  minScale: 1,
  maxScale: 50,
  motionName: 'fade',
  current: 0,
  count: 1,
  icons: {},
} as any

const Preview = defineComponent<PreviewProps>(
  (props = defaults, { attrs, slots }) => {
    const imgEl = shallowRef<HTMLImageElement>()
    const wrapperRef = shallowRef<HTMLDivElement | null>(null)
    const triggerRef = shallowRef<HTMLElement | null>(null)
    const groupContext = usePreviewGroupContext()

    const showLeftOrRightSwitches = computed(() => !!groupContext && (props.count ?? 1) > 1)
    const showOperationsProgress = computed(() => !!groupContext && (props.count ?? 1) >= 1)

    // ======================== Transform =========================
    const enableTransition = shallowRef(true)
    watch(enableTransition, async (val) => {
      if (!val) {
        await nextTick()
        enableTransition.value = true
      }
    })

    const { transform, resetTransform, updateTransform, dispatchZoomChange } = useImageTransform(
      imgEl as any,
      computed(() => props.minScale ?? 1),
      computed(() => props.maxScale ?? 50),
      info => props.onTransform?.(info),
    )

    const { isMoving, onMouseDown, onWheel } = useMouseEvent(
      imgEl as any,
      computed(() => props.movable ?? true),
      computed(() => !!props.open),
      computed(() => props.scaleStep ?? 0.5),
      transform as any,
      updateTransform,
      dispatchZoomChange,
    )

    const { isTouching, onTouchStart, onTouchMove, onTouchEnd } = useTouchEvent(
      imgEl as any,
      computed(() => props.movable ?? true),
      computed(() => !!props.open),
      computed(() => props.minScale ?? 1),
      transform as any,
      updateTransform,
      dispatchZoomChange,
    )

    // Attach wheel/touch listeners with `passive: true` so the browser does not
    // emit `[Violation] Added non-passive event listener to a scroll-blocking ...`.
    // None of these handlers call `preventDefault()`, so passive is safe.
    watch(imgEl, (el, _old, onCleanup) => {
      if (!el)
        return
      const opts = { passive: true } as AddEventListenerOptions
      el.addEventListener('wheel', onWheel, opts)
      el.addEventListener('touchstart', onTouchStart as EventListener, opts)
      el.addEventListener('touchmove', onTouchMove as EventListener, opts)
      el.addEventListener('touchend', onTouchEnd as EventListener, opts)
      el.addEventListener('touchcancel', onTouchEnd as EventListener, opts)
      onCleanup(() => {
        el.removeEventListener('wheel', onWheel)
        el.removeEventListener('touchstart', onTouchStart as EventListener)
        el.removeEventListener('touchmove', onTouchMove as EventListener)
        el.removeEventListener('touchend', onTouchEnd as EventListener)
        el.removeEventListener('touchcancel', onTouchEnd as EventListener)
      })
    })

    watch(() => props.open, (open) => {
      if (!open) {
        resetTransform('close')
      }
    })

    watch(() => props.open, (open) => {
      if (open && canUseDom()) {
        triggerRef.value = document.activeElement as HTMLElement | null
      }
    })

    // ========================== Image ===========================
    const onDoubleClick = (event: MouseEvent) => {
      if (!props.open) {
        return
      }

      if (transform.value.scale !== 1) {
        updateTransform({ x: 0, y: 0, scale: 1 }, 'doubleClick')
      }
      else {
        dispatchZoomChange(
          BASE_SCALE_RATIO + (props.scaleStep ?? 0.5),
          'doubleClick',
          (event as any).clientX,
          (event as any).clientY,
        )
      }
    }

    // ======================== Operation =========================
    const onZoomIn = () => {
      dispatchZoomChange(BASE_SCALE_RATIO + (props.scaleStep ?? 0.5), 'zoomIn')
    }

    const onZoomOut = () => {
      dispatchZoomChange(BASE_SCALE_RATIO / (BASE_SCALE_RATIO + (props.scaleStep ?? 0.5)), 'zoomOut')
    }

    const onRotateRight = () => {
      updateTransform({ rotate: transform.value.rotate + 90 }, 'rotateRight')
    }

    const onRotateLeft = () => {
      updateTransform({ rotate: transform.value.rotate - 90 }, 'rotateLeft')
    }

    const onFlipX = () => {
      updateTransform({ flipX: !transform.value.flipX }, 'flipX')
    }

    const onFlipY = () => {
      updateTransform({ flipY: !transform.value.flipY }, 'flipY')
    }

    const onReset = () => {
      resetTransform('reset')
    }

    const onActive = (offset: number) => {
      const current = props.current ?? 0
      const count = props.count ?? 1
      const nextCurrent = current + offset

      if (nextCurrent >= 0 && nextCurrent <= count - 1) {
        enableTransition.value = false
        resetTransform(offset < 0 ? 'prev' : 'next')
        props.onChange?.(nextCurrent, current)
      }
    }

    // >>>>> Effect: Keyboard
    const onKeyDown = (event: KeyboardEvent) => {
      if (!props.open) {
        return
      }

      const { key } = event

      if (showLeftOrRightSwitches.value) {
        if (key === KeyCodeStr.ArrowLeft) {
          onActive(-1)
        }
        else if (key === KeyCodeStr.ArrowRight) {
          onActive(1)
        }
      }
    }

    watchEffect((onCleanup) => {
      if (!canUseDom()) {
        return
      }
      if (props.open) {
        window.addEventListener('keydown', onKeyDown)
      }

      onCleanup(() => {
        window.removeEventListener('keydown', onKeyDown)
      })
    })

    // ======================= Lock Scroll ========================
    const animatedVisible = shallowRef(props?.open ?? false)
    watch(() => props.open, (open) => {
      if (open) {
        animatedVisible.value = true
      }
    })

    // ========================== Portal ==========================
    const portalRender = shallowRef(props?.open ?? false)
    watch(() => props.open, (open) => {
      if (open) {
        portalRender.value = true
      }
    })

    const onVisibleChanged = (nextVisible: boolean) => {
      if (!nextVisible) {
        animatedVisible.value = false
        portalRender.value = false
        triggerRef.value?.focus?.()
        triggerRef.value = null
      }
      props.afterOpenChange?.(nextVisible)
    }

    const setImgRef = (el?: HTMLImageElement) => {
      imgEl.value = el
    }
    const [getImgRef, srcAndOnload] = useStatus({
      src: computed(() => props.src),
      fallback: computed(() => props.fallback),
    })
    // =========================== Focus ============================
    const focusTrap = computed(() => props.focusTrap ?? true)
    useLockFocus(computed(() => !!(focusTrap.value && props.open && portalRender.value)), () => wrapperRef.value)

    // ========================== Render ==========================
    return () => {
      const {
        prefixCls,
        rootClassName,
        src,
        alt,
        imageInfo,
        open,
        closeIcon,
        getContainer,
        current = 0,
        count = 1,
        countRender,
        motionName = 'fade',
        imageRender,
        imgCommonProps,
        actionsRender = slots?.actionsRender,
        classNames = {},
        styles = {},
        mousePosition,
        zIndex,
        icons = {},
        movable = true,
        maskClosable = true,
      } = props

      const mergedAlt = alt ?? (imgCommonProps as any)?.alt

      const bodyStyle: CSSProperties = {
        ...(styles.body ?? {}),
      }
      if (mousePosition) {
        bodyStyle.transformOrigin = `${mousePosition.x}px ${mousePosition.y}px`
      }

      const image: ImgInfo = {
        url: src || '',
        alt: mergedAlt || '',
        ...(imageInfo as any),
      }

      const imgNode = (
        <img
          {...imgCommonProps}
          src={(srcAndOnload.value as any).src}
          ref={(el) => {
            setImgRef(el as any)
            getImgRef(el as any)
          }}
          width={props.width}
          height={props.height}
          class={`${prefixCls}-img`}
          alt={mergedAlt}
          onLoad={(srcAndOnload.value as any).onLoad}
          style={{
            transform: `translate3d(${transform.value.x}px, ${transform.value.y}px, 0) scale3d(${transform.value.flipX ? '-' : ''
            }${transform.value.scale}, ${transform.value.flipY ? '-' : ''}${transform.value.scale}, 1) rotate(${transform.value.rotate}deg)`,
            transitionDuration: (!enableTransition.value || isTouching.value) ? '0s' : undefined,
          }}

          onMousedown={onMouseDown}
          onDblclick={onDoubleClick}
        />
      )

      const mergedRootStyle: CSSProperties = {
        ...(styles.root ?? {}),
        ...(attrs as any).style,
      }
      if (zIndex) {
        mergedRootStyle.zIndex = zIndex
      }

      const mergedRootCls = clsx(
        prefixCls,
        rootClassName,
        classNames.root,
        {
          [`${prefixCls}-movable`]: movable,
          [`${prefixCls}-moving`]: isMoving.value,
        },
      )

      const transitionProps = getTransitionProps(motionName)

      return (
        <Portal
          open={open || animatedVisible.value || portalRender.value}
          getContainer={getContainer}
          autoLock={open || animatedVisible.value}
          onEsc={({ top }) => {
            if (top) {
              props.onClose?.()
            }
          }}
        >
          <Transition
            {...transitionProps}
            onAfterEnter={() => onVisibleChanged(true)}
            onAfterLeave={() => onVisibleChanged(false)}
          >
            {() => {
              if (!(portalRender.value && open)) {
                return null
              }

              return (
                <div
                  ref={wrapperRef}
                  class={mergedRootCls}
                  style={mergedRootStyle}
                  role="dialog"
                  aria-modal="true"
                  aria-label={mergedAlt}
                  tabindex={-1}
                >
                  {/* Mask */}
                  <div
                    class={clsx(`${prefixCls}-mask`, classNames.mask)}
                    style={styles.mask}
                    onClick={maskClosable ? () => props.onClose?.() : undefined}
                  />

                  {/* Body */}
                  <div class={clsx(`${prefixCls}-body`, classNames.body)} style={bodyStyle}>
                    {imageRender
                      ? imageRender(
                          imgNode,
                          { transform: transform.value, image, ...(groupContext ? { current } : {}) },
                        )
                      : imgNode}
                  </div>

                  {/* Close Button */}
                  {closeIcon !== false && closeIcon !== null && (
                    <CloseBtn
                      prefixCls={prefixCls}
                      icon={(closeIcon === true ? icons.close : (closeIcon || icons.close)) as any}
                      onClick={() => props.onClose?.()}
                      className={classNames.close}
                      style={styles.close}
                    />
                  )}

                  {/* Switch prev or next */}
                  {showLeftOrRightSwitches.value && (
                    <PrevNext
                      prefixCls={prefixCls}
                      current={current}
                      count={count}
                      icons={icons}
                      onActive={onActive}
                    />
                  )}

                  {/* Footer */}
                  <Footer
                    prefixCls={prefixCls}
                    showProgress={showOperationsProgress.value}
                    current={current}
                    count={count}
                    showSwitch={showLeftOrRightSwitches.value}
                    classNames={classNames as any}
                    styles={styles as any}
                    image={image}
                    transform={transform.value}
                    icons={icons}
                    countRender={countRender}
                    actionsRender={actionsRender}
                    scale={transform.value.scale}
                    minScale={props.minScale ?? 1}
                    maxScale={props.maxScale ?? 50}
                    onActive={onActive}
                    onFlipY={onFlipY}
                    onFlipX={onFlipX}
                    onRotateLeft={onRotateLeft}
                    onRotateRight={onRotateRight}
                    onZoomOut={onZoomOut}
                    onZoomIn={onZoomIn}
                    onClose={() => props.onClose?.()}
                    onReset={onReset}
                  />
                </div>
              )
            }}
          </Transition>
        </Portal>
      )
    }
  },
  {
    name: 'ImagePreview',
    inheritAttrs: false,
  },
)

export default Preview
