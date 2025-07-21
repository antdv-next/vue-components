import type { CSSProperties, SlotsType } from 'vue'
import type { TransformType } from './hooks/useImageTransform'
import type { ImageElementProps } from './interface'
import type { InternalPreviewConfig, PreviewSemanticName, ToolbarRenderInfoType } from './Preview'
import classnames from 'classnames'
import { computed, defineComponent, ref } from 'vue'
import { COMMON_PROPS } from './common'
import { PreviewGroupContext, usePreviewGroupContext } from './context'
import useRegisterImage from './hooks/useRegisterImage'
import useStatus from './hooks/useStatus'
import Preview from './Preview'

export interface ImgInfo {
  url: string
  alt: string
  width: string | number
  height: string | number
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

export interface ImageProps {
  prefixCls?: string
  previewPrefixCls?: string
  rootClassName?: string
  classNames?: Partial<
    Record<SemanticName, string> & {
      popup?: Partial<Record<PreviewSemanticName, string>>
    }
  >
  styles?: Partial<
    Record<SemanticName, any> & {
      popup?: Partial<Record<PreviewSemanticName, any>>
    }
  >
  src?: string
  placeholder?: any
  fallback?: string
  preview?: boolean | PreviewConfig
  onClick?: (e: MouseEvent) => void
  onError?: (e: Event) => void
  width?: string | number
  height?: string | number
}

export default defineComponent({
  name: 'Image',
  props: {
    // Misc
    prefixCls: String,
    previewPrefixCls: String,

    // Styles
    rootClassName: String,
    className: String,
    style: Object,
    classNames: Object,
    styles: Object,

    // Image
    src: String,
    alt: String,
    placeholder: [Boolean, Object],
    fallback: String,

    // Preview
    preview: [Boolean, Object],

    // Events
    onClick: Function,
    onError: Function,
    width: [String, Number],
    height: [String, Number],
  },
  emits: ['click', 'error'],
  slots: Object as SlotsType<{
    actionsRender: any
  }>,
  setup(props, { attrs, emit, slots }) {
    PreviewGroupContext()
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
    const isCustomPlaceholder = computed(() => props.placeholder && props.placeholder !== true)

    const src = computed(() => previewConfig.value.src ?? props.src)
    const [getImgRef, srcAndOnload, status] = useStatus({
      src: props.src!,
      isCustomPlaceholder: isCustomPlaceholder.value,
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

    const imageId = useRegisterImage(canPreview.value, registerData.value)

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

      emit('click', e)
    }
    const handleClickChange = (e: MouseEvent) => {
      if (canPreview.value) {
        onPreview(e)
      }
      emit('click', e)
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
              width,
              height,
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
              src={imgSrc}
              style={{
                height,
                ...attrs.style as CSSProperties,
              }}
              ref={getImgRef}
              {...srcAndOnload}
              width={width}
              height={height}
              onError={onError}
            />

            {status.value === 'loading' && (
              <div aria-hidden="true" class={`${prefixCls}-placeholder`}>
                {placeholder}
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
