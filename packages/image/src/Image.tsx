import type { CSSProperties, ExtractPropTypes, SlotsType } from 'vue'
import type { TransformType } from './hooks/useImageTransform'
import type { ImageElementProps } from './interface'
import type { InternalPreviewConfig, ToolbarRenderInfoType } from './Preview'
import { classNames as classnames } from '@v-c/util'
import { computed, defineComponent, ref } from 'vue'
import { COMMON_PROPS } from './common'
import { usePreviewGroupContext } from './context'
import useRegisterImage from './hooks/useRegisterImage'
import useStatus from './hooks/useStatus'
import Preview from './Preview'
import PreviewGroup from './PreviewGroup'

export interface ImgInfo {
  url: string
  alt: string
  width?: string | number
  height?: string | number
}

export interface CoverConfig {
  coverNode?: any
  placement?: 'top' | 'bottom' | 'center'
}

export interface PreviewConfig extends Omit<InternalPreviewConfig, 'countRender'> {
  cover?: any | CoverConfig
  imageRender?: (
    originalNode: any,
    info: { transform: TransformType, image: ImgInfo },
  ) => any
  actionsRender?: (
    originalNode: any,
    info: Omit<ToolbarRenderInfoType, 'current' | 'total'>,
  ) => any
  onOpenChange?: (open: boolean) => void
}

export type SemanticName = 'root' | 'image' | 'cover'
function imageProps() {
  return {
    prefixCls: String,
    previewPrefixCls: String,
    rootClassName: String,
    src: String,
    alt: String,
    placeholder: [Boolean, Object],
    fallback: String,
    preview: {
      type: [Boolean, Object],
      default: true,
    },
    onClick: Function,
    onError: Function,
    width: [String, Number],
    height: [String, Number],
  }
}
export type ImageProps = Partial<ExtractPropTypes<ReturnType<typeof imageProps>>>

const ImageInternal = defineComponent({
  name: 'Image',
  props: {
    ...imageProps(),
  },
  emits: ['click', 'error'],
  slots: Object as SlotsType<{
    actionsRender: any
    placeholder: any
    imageRender: any
  }>,
  setup(props, { attrs, emit, slots }) {
    const groupContext = usePreviewGroupContext()

    // ========================== Preview ===========================
    const canPreview = computed(() => !!props.preview)

    const previewConfig = computed(() =>
      props.preview && typeof props.preview === 'object' ? props.preview : {},
    )

    const coverPlacement = computed(() =>
      typeof previewConfig.value.cover === 'object' && previewConfig.value.cover.placement
        ? previewConfig.value.cover.placement || 'center'
        : 'center',
    )

    const coverNode = computed(() =>
      typeof previewConfig.value.cover === 'object' && previewConfig.value.cover.coverNode
        ? previewConfig.value.cover.coverNode
        : previewConfig.value.cover,
    )

    // ============================ Open ============================
    const isShowPreview = ref(!!previewConfig.value.open)
    const mousePosition = ref<{ x: number, y: number } | null | undefined>(null)

    const triggerPreviewOpen = (nextOpen: boolean) => {
      isShowPreview.value = nextOpen
      previewConfig.value.onOpenChange?.(nextOpen)
    }

    const onPreviewClose = () => {
      triggerPreviewOpen(false)
    }

    // ========================= ImageProps =========================
    const isCustomPlaceholder = computed(() => (props.placeholder && props.placeholder !== true) || slots.placeholder)

    const src = computed(() => previewConfig.value.src ?? props.src)
    const [getImgRef, srcAndOnload, status] = useStatus({
      src: src!,
      isCustomPlaceholder,
      fallback: props.fallback,
    })

    const imgCommonProps = computed(() => {
      const obj: ImageElementProps | Partial<ImageElementProps> = {}
      COMMON_PROPS.forEach((prop) => {
        if (props[prop] !== undefined) {
          obj[prop] = props[prop]
        }
      })
      return obj
    })

    // ========================== Register ==========================
    const registerData = computed(() => ({
      ...imgCommonProps.value,
      src: src.value,
    }))

    const imageId = useRegisterImage(canPreview, registerData)

    // ========================== Preview ===========================
    const onPreview = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const rect = target.getBoundingClientRect()
      const left = rect.x + rect.width / 2
      const top = rect.y + rect.height / 2

      if (groupContext) {
        groupContext.onPreview(imageId.value, src.value, left, top)
      }
      else {
        mousePosition.value = { x: left, y: top }
        triggerPreviewOpen(true)
      }
    }
    const handleClickChange = (e: MouseEvent) => {
      if (canPreview.value) {
        onPreview(e)
      }
      emit('click', e)
    }
    const toSizePx = (val: string | number) => {
      if (typeof val === 'number')
        return `${val}px`
      return val
    }

    return () => {
      const {
        // Misc
        prefixCls = 'vc-image',
        previewPrefixCls = `${prefixCls}-preview`,

        // Style
        rootClassName,

        width,
        height,

        // Image
        src: imgSrc,
        alt,
        placeholder,
        fallback,

        // Preview
        preview = true,

        // Events
        onClick,
        onError,
        ...otherProps
      } = props

      return (
        <>
          <div
            {...otherProps}
            class={classnames(
              prefixCls,
              rootClassName,
              {
                [`${prefixCls}-error`]: status.value === 'error',
              },
            )}
            onClick={handleClickChange}
            style={{
              width: toSizePx(width!),
              height: toSizePx(height!),
              ...attrs.style as CSSProperties,
            }}
          >
            <img
              {...imgCommonProps.value}
              alt={alt}
              class={classnames(
                `${prefixCls}-img`,
                {
                  [`${prefixCls}-img-placeholder`]: placeholder === true,
                },
                [attrs.class],
              )}
              style={{
                height,
                // ...attrs.style as CSSProperties,
              }}
              ref={getImgRef}
              {...srcAndOnload.value}
              width={width}
              height={height}
              onError={onError}
            />

            {status.value === 'loading' && (
              <div aria-hidden="true" class={`${prefixCls}-placeholder`}>
                {slots.placeholder?.() || placeholder}
              </div>
            )}

            {previewConfig.value.cover !== false && canPreview.value && (
              <div
                class={[
                  `${prefixCls}-cover`,
                  `${prefixCls}-cover-${coverPlacement.value}`,
                ]}
              >
                {coverNode.value}
              </div>
            )}
          </div>
          {!groupContext && canPreview.value && (
            <Preview
              aria-hidden={!isShowPreview.value}
              open={isShowPreview.value}
              prefixCls={previewPrefixCls || `${prefixCls}-preview`}
              onClose={onPreviewClose}
              mousePosition={mousePosition.value}
              src={src.value}
              alt={alt}
              imageInfo={{ width, height }}
              fallback={fallback}
              imgCommonProps={imgCommonProps.value}
              {...previewConfig.value}
              rootClassName={[previewConfig.value.rootClassName, rootClassName]}
              v-slots={slots}
            />
          )}
        </>
      )
    }
  },
})

ImageInternal.PreviewGroup = PreviewGroup

export default ImageInternal
