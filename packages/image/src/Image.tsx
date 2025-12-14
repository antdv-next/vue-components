import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { TransformType } from './hooks/useImageTransform'
import type { ImageElementProps } from './interface'
import type { InternalPreviewConfig, PreviewSemanticName, ToolbarRenderInfoType } from './Preview'
import { clsx } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef } from 'vue'
import { COMMON_PROPS } from './common'
import { usePreviewGroupContext } from './context'
import useRegisterImage from './hooks/useRegisterImage'
import useStatus from './hooks/useStatus'
import Preview from './Preview/index'

export interface ImgInfo {
  url: string
  alt: string
  width: string | number
  height: string | number
}

export interface CoverConfig {
  coverNode?: VueNode
  placement?: 'top' | 'bottom' | 'center'
}

export interface PreviewConfig extends Omit<InternalPreviewConfig, 'countRender'> {
  cover?: VueNode | CoverConfig | false

  // Similar to InternalPreviewConfig but not have `current`
  imageRender?: (
    originalNode: VueNode,
    info: { transform: TransformType, image: ImgInfo },
  ) => VueNode

  // Similar to InternalPreviewConfig but not have `current` and `total`
  actionsRender?: (
    originalNode: VueNode,
    info: Omit<ToolbarRenderInfoType, 'current' | 'total'>,
  ) => VueNode

  onOpenChange?: (open: boolean) => void
}

export type SemanticName = 'root' | 'image' | 'cover'

export interface ImageProps extends Omit<ImageElementProps, 'src'> {
  // Misc
  prefixCls?: string
  previewPrefixCls?: string

  // Styles
  rootClassName?: string
  classNames?: Partial<
    Record<SemanticName, string> & {
      popup?: Partial<Record<PreviewSemanticName, string>>
    }
  >
  styles?: Partial<
    Record<SemanticName, CSSProperties> & {
      popup?: Partial<Record<PreviewSemanticName, CSSProperties>>
    }
  >

  // Image
  src?: string
  placeholder?: boolean | VueNode
  fallback?: string

  // Preview
  preview?: boolean | PreviewConfig

  // Events
  onClick?: (e: MouseEvent) => void
  onError?: (e: Event) => void

  width?: string | number
  height?: string | number
  style?: CSSProperties
}

const defaults = {
  prefixCls: 'vc-image',
  preview: true,
  classNames: {},
  styles: {},
} as any

const Image = defineComponent<ImageProps>(
  (props = defaults, { attrs, slots }) => {
    const groupContext = usePreviewGroupContext()

    const prefixCls = computed(() => props.prefixCls ?? 'vc-image')
    const previewPrefixCls = computed(() => props.previewPrefixCls ?? `${prefixCls.value}-preview`)

    // ========================== Preview ===========================
    const canPreview = computed(() => !!props.preview)

    const mergedPreviewConfig = computed<PreviewConfig>(() => {
      if (props.preview && typeof props.preview === 'object') {
        return props.preview
      }
      return {} as any
    })

    const previewSrc = computed(() => mergedPreviewConfig.value.src)
    const previewOpen = computed(() => mergedPreviewConfig.value.open)

    const cover = computed(() => mergedPreviewConfig.value.cover)

    const previewRootClassName = computed(() => mergedPreviewConfig.value.rootClassName)

    // ============================ Open ============================
    const [isShowPreview, setShowPreview] = useMergedState<boolean>(!!previewOpen.value, {
      value: previewOpen as any,
    })

    const mousePosition = shallowRef<null | { x: number, y: number }>(null)

    const triggerPreviewOpen = (nextOpen: boolean) => {
      setShowPreview(nextOpen)
      mergedPreviewConfig.value.onOpenChange?.(nextOpen)
    }

    const onPreviewClose = () => {
      triggerPreviewOpen(false)
      mousePosition.value = null
    }

    // ========================= ImageProps =========================
    const isCustomPlaceholder = computed(() =>
      !!slots.placeholder || !!(props.placeholder && props.placeholder !== true),
    )

    const src = computed(() => previewSrc.value ?? props.src)
    const [getImgRef, srcAndOnload, status] = useStatus({
      src: computed(() => props.src),
      isCustomPlaceholder,
      fallback: computed(() => props.fallback),
    })

    const imgCommonProps = computed(() => {
      const obj: ImageElementProps = {} as any
      COMMON_PROPS.forEach((prop) => {
        if ((props as any)[prop] !== undefined) {
          (obj as any)[prop] = (props as any)[prop]
        }
      })
      return obj
    })

    // ========================== Register ==========================
    const registerData = computed<ImageElementProps>(() => ({
      ...imgCommonProps.value,
      src: src.value,
    } as ImageElementProps))

    const imageId = useRegisterImage(canPreview, registerData)

    // ========================== Preview ===========================
    const onPreview = (e: MouseEvent) => {
      const target = (e.currentTarget || e.target) as HTMLElement
      const rect = target.getBoundingClientRect()
      const left = rect.x + rect.width / 2
      const top = rect.y + rect.height / 2

      if (groupContext) {
        groupContext.onPreview(imageId, src.value || '', left, top)
      }
      else {
        mousePosition.value = { x: left, y: top }
        triggerPreviewOpen(true)
      }

      props.onClick?.(e)
    }

    const onInternalClick = (e: MouseEvent) => {
      props.onClick?.(e)
    }

    const onImgError = (e: Event) => {
      props.onError?.(e)
    }

    // =========================== Render ===========================
    return () => {
      const { className, style: attrStyle, restAttrs } = getAttrStyleAndClass(attrs)

      const coverPlacement
        = typeof cover.value === 'object' && cover.value && (cover.value as any).placement
          ? ((cover.value as CoverConfig).placement || 'center')
          : 'center'

      const coverNode
        = typeof cover.value === 'object' && cover.value && (cover.value as any).coverNode
          ? (cover.value as CoverConfig).coverNode
          : (cover.value as VueNode)

      const imgStyle = [
        props.height ? { height: props.height } : null,
        props.styles?.image,
        attrStyle,
        props.style,
      ]

      const rootStyle: CSSProperties = {
        width: props.width as any,
        height: props.height as any,
        ...(props.styles?.root ?? {}),
      }

      const rootCls = clsx(
        prefixCls.value,
        props.rootClassName,
        props.classNames?.root,
        {
          [`${prefixCls.value}-error`]: status.value === 'error',
        },
      )

      const imgCls = clsx(
        `${prefixCls.value}-img`,
        {
          [`${prefixCls.value}-img-placeholder`]: props.placeholder === true,
        },
        props.classNames?.image,
        className,
      )

      const imageRender = slots.imageRender
        ? ((originNode: VueNode, info: any) => slots.imageRender?.(originNode, info)) as any
        : mergedPreviewConfig.value.imageRender

      const placeholderNode = slots.placeholder?.() ?? (props.placeholder === true ? null : props.placeholder)

      const actionsRender = slots.actionsRender
        ? ((originNode: VueNode, info: any) =>
            slots.actionsRender?.({
              actionsNode: originNode,
              ...info,
            })) as any
        : mergedPreviewConfig.value.actionsRender

      const previewProps = mergedPreviewConfig.value
      const {
        src: _previewSrc,
        open: _previewOpen,
        onOpenChange: _onPreviewOpenChange,
        cover: _cover,
        rootClassName: _previewRootCls,
        ...restPreviewProps
      } = previewProps as any

      return (
        <>
          <div
            {...pickAttrs(restAttrs, false)}
            class={rootCls}
            onClick={canPreview.value ? onPreview : onInternalClick}
            style={rootStyle}
          >
            <img
              {...imgCommonProps.value}
              src={(srcAndOnload.value as any).src}
              class={imgCls}
              style={imgStyle as any}
              ref={getImgRef as any}
              width={props.width}
              height={props.height}
              onLoad={(srcAndOnload.value as any).onLoad}
              onError={onImgError}
            />

            {status.value === 'loading' && (
              <div aria-hidden="true" class={`${prefixCls.value}-placeholder`}>
                {placeholderNode}
              </div>
            )}

            {/* Preview Click Mask */}
            {cover.value !== false && canPreview.value && (
              <div
                class={clsx(
                  `${prefixCls.value}-cover`,
                  props.classNames?.cover,
                  `${prefixCls.value}-cover-${coverPlacement}`,
                )}
                style={props.styles?.cover}
              >
                {coverNode}
              </div>
            )}
          </div>

          {!groupContext && canPreview.value && (
            <Preview
              aria-hidden={!isShowPreview.value}
              open={isShowPreview.value}
              prefixCls={previewPrefixCls.value}
              onClose={onPreviewClose}
              mousePosition={mousePosition.value}
              src={src.value}
              alt={props.alt as any}
              imageInfo={{ width: props.width as any, height: props.height as any }}
              fallback={props.fallback}
              imgCommonProps={imgCommonProps.value as any}
              imageRender={imageRender as any}
              actionsRender={actionsRender as any}
              {...restPreviewProps}
              classNames={props.classNames?.popup}
              styles={props.styles?.popup}
              rootClassName={clsx(previewRootClassName.value, props.rootClassName)}
            />
          )}
        </>
      )
    }
  },
  {
    name: 'Image',
    inheritAttrs: false,
  },
)

export default Image
