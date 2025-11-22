import type { PortalProps } from '@v-c/portal'
import type { CSSProperties, ExtractPropTypes, PropType, SlotsType, VNode } from 'vue'
import type { TransformAction, TransformType } from '../hooks/useImageTransform'
import type { ImgInfo } from '../Image'
import type { FooterSemanticName } from './Footer'
import Portal from '@v-c/portal'
import { classNames as classnames } from '@v-c/util'
import useEvent from '@v-c/util/dist/hooks/useEvent.ts'
import KeyCode from '@v-c/util/dist/KeyCode'

import { computed, defineComponent, ref, Transition, watch } from 'vue'
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
export type PreviewSemanticName = 'root' | 'mask' | 'body' | FooterSemanticName

export interface OperationIcons {
  rotateLeft?: VNode
  rotateRight?: VNode
  zoomIn?: VNode
  zoomOut?: VNode
  close?: VNode
  prev?: VNode
  next?: VNode
  /** @deprecated Please use `prev` instead */
  left?: VNode
  /** @deprecated Please use `next` instead */
  right?: VNode
  flipX?: VNode
  flipY?: VNode
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

export function actions() {
  return {
    onActive: Function as PropType<(offset: number) => void>,
    onFlipY: Function as PropType<() => void>,
    onFlipX: Function as PropType<() => void>,
    onRotateLeft: Function as PropType<() => void>,
    onRotateRight: Function as PropType<() => void>,
    onZoomOut: Function as PropType<() => void>,
    onZoomIn: Function as PropType<() => void>,
    onClose: Function as PropType<() => void>,
    onReset: Function as PropType<() => void>,
  }
}

export interface ToolbarRenderInfoType {
  icons: {
    prevIcon?: VNode
    nextIcon?: VNode
    flipYIcon: VNode
    flipXIcon: VNode
    rotateLeftIcon: VNode
    rotateRightIcon: VNode
    zoomOutIcon: VNode
    zoomInIcon: VNode
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
  afterOpenChange?: (open: boolean) => void

  // Operation
  movable?: boolean
  icons?: OperationIcons
  closeIcon?: VNode

  onTransform?: (info: { transform: TransformType, action: TransformAction }) => void

  // Render
  countRender?: (current: number, total: number) => VNode
  imageRender?: (
    originalNode: VNode,
    info: { transform: TransformType, current?: number, image: ImgInfo },
  ) => VNode
  actionsRender?: (
    originalNode: VNode,
    info: ToolbarRenderInfoType,
  ) => VNode
}
function previewProps() {
  return {
    prefixCls: String,
    imageInfo: Object as PropType<{
      width: number | string | undefined
      height: number | string | undefined
    }>,
    fallback: String,
    imgCommonProps: Object,
    width: [String, Number],
    height: [String, Number],
    current: {
      type: Number,
      default: () => 0,
    },
    count: {
      type: Number,
      default: () => 1,
    },
    onChange: Function as PropType<(current: number, prev: number) => void>,
    onClose: Function as PropType<(e: MouseEvent) => void>,
    mousePosition: Object as PropType<{ x: number, y: number } | undefined | null>,
    rootClassName: Array,
    src: {
      type: String,
      required: true,
    },
    alt: String,
    scaleStep: {
      type: Number,
      default: () => 0.5,
    },
    minScale: {
      type: Number,
      default: () => 1,
    },
    maxScale: {
      type: Number,
      default: () => 50,
    },
    motionName: String,
    open: Boolean,
    getContainer: Function as PropType<() => VNode>,
    zIndex: Number,
    onAfterOpenChange: Function as PropType<(open: boolean) => void>,
    movable: {
      type: Boolean,
      default: true,
    },
    icons: Object as PropType<OperationIcons>,
    closeIcon: [Object, String, Boolean],
    onTransform: Function as PropType<(info: { transform: TransformType, action: TransformAction }) => void>,
    countRender: Function as PropType<(current: number, total: number) => VNode>,
    imageRender: Function as PropType<(
      originalNode: VNode,
      info: { transform: TransformType, current?: number, image: ImgInfo },
    ) => VNode>,
    actionsRender: Function as PropType<(
      originalNode: VNode,
      info: ToolbarRenderInfoType,
    ) => VNode>,
  }
}

export type PreviewProps = Partial<ExtractPropTypes<ReturnType<typeof previewProps>>>

export interface PreviewImageProps extends HTMLImageElement {
  fallback?: string
  imgRef: HTMLImageElement
}

const PreviewImage = defineComponent({
  name: 'PreviewImage',
  props: {
    fallback: String,
    imgRef: Object,
    src: {
      type: String,
      required: true,
    },
    width: [String, Number],
    height: [String, Number],
    alt: String,
    onWheel: Function,
    onMouseDown: Function,
    onDoubleClick: Function,
    onTouchStart: Function,
    onTouchMove: Function,
    onTouchEnd: Function,
    onTouchCancel: Function,
  },
  setup(props, { attrs, expose }) {
    const [_getImgRef, srcAndOnload] = useStatus({
      src: ref(props.src),
      fallback: props.fallback,
    })

    const imgDom = ref<HTMLImageElement>()
    expose({
      imgEl: imgDom,
    })

    return () => {
      return (
        <img
          {...attrs}
          {...srcAndOnload.value}
          alt="img"
          ref={imgDom}
        />
      )
    }
  },
})

export default defineComponent({
  name: 'Preview',
  props: {
    ...previewProps(),
  },
  emits: ['change', 'close', 'transform', 'afterOpenChange'],
  slots: Object as SlotsType<{
    countRender: (current: number, total: number) => any
    imageRender: any
    actionsRender: any
  }>,
  setup(props, { attrs, emit, slots }) {
    const imgRef = ref<{ imgEl: HTMLImageElement }>()
    const groupContext = usePreviewGroupContext()
    const showLeftOrRightSwitches = computed(() => groupContext && props.count > 1)
    const showOperationsProgress = computed(() => groupContext && props.count >= 1)

    // ======================== Transform =========================
    const enableTransition = ref(true)
    const { transform, resetTransform, updateTransform, dispatchZoomChange } = useImageTransform(
      imgRef,
      props.minScale,
      props.maxScale,
      props.onTransform,
    )
    const { isMoving, onMouseDown, onWheel } = useMouseEvent(
      imgRef,
      props.movable,
      open,
      props.scaleStep,
      transform,
      updateTransform,
      dispatchZoomChange,
    )
    const { isTouching, onTouchStart, onTouchMove, onTouchEnd } = useTouchEvent(
      imgRef,
      props.movable,
      open,
      props.minScale,
      transform,
      updateTransform,
      dispatchZoomChange,
    )

    watch(enableTransition, (newEnable) => {
      if (!newEnable) {
        enableTransition.value = true
      }
    })

    watch(() => props.open, (open) => {
      if (!open) {
        resetTransform('close')
      }
    })

    // ========================== Image ===========================
    const onDoubleClick = (event: MouseEvent) => {
      if (props.open) {
        if (transform.value.scale !== 1) {
          updateTransform({ x: 0, y: 0, scale: 1 }, 'doubleClick')
        }
        else {
          dispatchZoomChange(
            BASE_SCALE_RATIO + props.scaleStep,
            'doubleClick',
            event.clientX,
            event.clientY,
          )
        }
      }
    }

    // ======================== Operation =========================
    // >>>>> Actions
    const onZoomIn = () => {
      dispatchZoomChange(BASE_SCALE_RATIO + props.scaleStep, 'zoomIn')
    }

    const onZoomOut = () => {
      dispatchZoomChange(BASE_SCALE_RATIO / (BASE_SCALE_RATIO + props.scaleStep), 'zoomOut')
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
      const nextCurrent = props.current + offset

      if (nextCurrent >= 0 && nextCurrent <= props.count - 1) {
        enableTransition.value = false
        resetTransform(offset < 0 ? 'prev' : 'next')
        emit('change', nextCurrent, props.current)
      }
    }

    // >>>>> Effect: Keyboard
    const onKeyDown = useEvent((event: KeyboardEvent) => {
      if (props.open) {
        const { keyCode } = event

        if (keyCode === KeyCode.ESC) {
          emit('close')
        }

        if (showLeftOrRightSwitches.value) {
          if (keyCode === KeyCode.LEFT) {
            onActive(-1)
          }
          else if (keyCode === KeyCode.RIGHT) {
            onActive(1)
          }
        }
      }
    })

    watch(() => props.open, (open, _oldOpen, onCleanup) => {
      if (open) {
        window.addEventListener('keydown', onKeyDown)

        onCleanup(() => window.removeEventListener('keydown', onKeyDown))
      }
    })

    // ======================= Lock Scroll ========================
    const lockScroll = ref(false)

    const onVisibleChanged = (nextVisible: boolean) => {
      if (!nextVisible) {
        lockScroll.value = false
      }
      emit('afterOpenChange', nextVisible)
    }

    watch(() => props.open, (open) => {
      if (open) {
        lockScroll.value = true
      }
      onVisibleChanged(open)
    })

    // ========================== Portal ==========================
    const portalRender = ref(false)
    watch(() => props.open, (open) => {
      if (open) {
        portalRender.value = true
      }
    })

    return () => {
      const {
        prefixCls,
        rootClassName,
        src,
        alt,
        imageInfo,
        onClose,
        open,
        icons = {},
        closeIcon,
        getContainer,
        current = 0,
        count = 1,
        countRender = slots.countRender,
        minScale = 1,
        maxScale = 50,
        motionName = 'fade',
        imageRender = slots.imageRender,
        imgCommonProps,
        actionsRender = slots.actionsRender,
        mousePosition,
        zIndex,
        width,
        height,
        fallback,
      } = props

      const { x, y, rotate, scale, flipX, flipY } = transform.value

      const image: ImgInfo = {
        url: src,
        alt: 'image',
        ...imageInfo!,
      }

      const imgNode = (
        <PreviewImage
          key={src}
          {...imgCommonProps}
          width={width}
          height={height}
          ref={imgRef}
          imgRef={imgRef}
          class={`${prefixCls}-img`}
          alt={alt}
          style={{
            transform: `translate3d(${x}px, ${y}px, 0) scale3d(${
              flipX ? '-' : ''
            }${scale}, ${flipY ? '-' : ''}${scale}, 1) rotate(${rotate}deg)`,
            transitionDuration: (!enableTransition.value || isTouching.value) && '0s',
          }}
          fallback={fallback}
          src={src}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        />
      )

      // ========================== Render ==========================
      const bodyStyle: CSSProperties = {}
      if (mousePosition) {
        bodyStyle.transformOrigin = `${mousePosition.x}px ${mousePosition.y}px`
      }

      return (
        <Portal open={portalRender.value} getContainer={getContainer!} autoLock={lockScroll.value}>
          <Transition
            name={motionName}
          >
            <div
              class={classnames(prefixCls, rootClassName, {
                [`${prefixCls}-moving`]: isMoving.value,
              })}
              style={{ zIndex }}
              v-show={portalRender.value && open}
            >
              {/* Mask */}
              <div
                class={classnames(`${prefixCls}-mask`)}
                onClick={onClose}
              />

              {/* Body */}
              <div class={classnames(`${prefixCls}-body`)} style={bodyStyle}>
                {/* Preview Image */}
                {imageRender
                  ? imageRender(imgNode, {
                      transform: transform.value,
                      image,
                      ...(groupContext ? { current } : {}),
                    })
                  : imgNode}
              </div>

              {/* Close Button */}
              {closeIcon !== false && closeIcon !== null && (
                <CloseBtn
                  prefixCls={prefixCls!}
                  icon={closeIcon ? icons.close : closeIcon || icons.close}
                  onClick={onClose!}
                />
              )}

              {/* Switch prev or next */}
              {showLeftOrRightSwitches.value && (
                <PrevNext
                  prefixCls={prefixCls!}
                  current={current}
                  count={count}
                  icons={icons}
                  onActive={onActive}
                />
              )}

              {/* Footer */}
              <Footer
                prefixCls={prefixCls}
                showProgress={showOperationsProgress.value!}
                current={current}
                count={count}
                showSwitch={showLeftOrRightSwitches.value!}
                // Style
                class={[attrs.calss]}
                style={{ ...attrs.style as CSSProperties }}
                // Render
                image={image}
                transform={transform}
                icons={icons}
                countRender={countRender}
                actionsRender={actionsRender}
                // Scale
                scale={scale}
                minScale={minScale}
                maxScale={maxScale}
                // Actions
                onActive={onActive}
                onFlipY={onFlipY}
                onFlipX={onFlipX}
                onRotateLeft={onRotateLeft}
                onRotateRight={onRotateRight}
                onZoomOut={onZoomOut}
                onZoomIn={onZoomIn}
                onClose={onClose}
                onReset={onReset}
              />
            </div>
          </Transition>
        </Portal>
      )
    }
  },
})
