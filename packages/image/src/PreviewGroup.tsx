import type { TransformType } from './hooks/useImageTransform'
import type { ImgInfo } from './Image'
import type { ImageElementProps, OnGroupPreview } from './interface'
import type { InternalPreviewConfig, PreviewProps, PreviewSemanticName } from './Preview'
import { computed, defineComponent, inject, provide, ref, watch } from 'vue'
import { PreviewGroupContext, usePreviewGroupContext } from './context'
import usePreviewItems from './hooks/usePreviewItem.ts'
import Preview from './Preview'

export interface GroupPreviewConfig extends InternalPreviewConfig {
  current?: number
  imageRender?: (
    originalNode: any,
    info: { transform: TransformType, current: number, image: ImgInfo },
  ) => any
  onOpenChange?: (value: boolean, info: { current: number }) => void
  onChange?: (current: number, prevCurrent: number) => void
}

export interface PreviewGroupProps {
  previewPrefixCls?: string
  classNames?: {
    popup?: Partial<Record<PreviewSemanticName, string>>
  }
  styles?: {
    popup?: Partial<Record<PreviewSemanticName, any>>
  }
  icons?: PreviewProps['icons']
  items?: (string | ImageElementProps)[]
  fallback?: string
  preview?: boolean | GroupPreviewConfig
}

export default defineComponent({
  name: 'PreviewGroup',
  props: {
    previewPrefixCls: {
      type: String,
      default: 'rc-image-preview',
    },
    classNames: Object,
    styles: Object,
    icons: Object,
    items: Array,
    fallback: String,
    preview: [Boolean, Object],
  },
  setup(props, { slots }) {
    // ========================== Items ===========================
    const [mergedItems, register, fromItems] = usePreviewItems(props.items)

    // ========================= Preview ==========================
    const previewConfig = computed(() =>
      props.preview && typeof props.preview === 'object' ? props.preview : {} as GroupPreviewConfig
    )

    // >>> Index
    const current = ref(previewConfig.value.current || 0)
    const keepOpenIndex = ref(false)

    // >>> Image
    const { src, ...imgCommonProps } = computed(() => mergedItems.value[current.value]?.data || {}).value

    // >>> Visible
    const isShowPreview = ref(!!previewConfig.value.open)
    watch(isShowPreview, (val) => {
      previewConfig.value.onOpenChange?.(val, { current: current.value })
    })

    // >>> Position
    const mousePosition = ref<{ x: number, y: number } | null>(null)

    const onPreviewFromImage = (id: string, imageSrc: string, mouseX: number, mouseY: number) => {
      const index = fromItems
        ? mergedItems.value.findIndex(item => item.data.src === imageSrc)
        : mergedItems.value.findIndex(item => item.id === id)

      current.value = index < 0 ? 0 : index
      isShowPreview.value = true
      mousePosition.value = { x: mouseX, y: mouseY }
      keepOpenIndex.value = true
    }

    // Reset current when reopen
    watch(isShowPreview, (val) => {
      if (val) {
        if (!keepOpenIndex.value) {
          current.value = 0
        }
      }
      else {
        keepOpenIndex.value = false
      }
    })

    // ========================== Events ==========================
    const onInternalChange: GroupPreviewConfig['onChange'] = (next, prev) => {
      current.value = next
      previewConfig.value.onChange?.(next, prev)
    }

    const onPreviewClose = () => {
      isShowPreview.value = false
      mousePosition.value = null
    }

    // ========================= Context ==========================
    PreviewGroupContext()

    // ========================== Render ==========================
    return () => {
      const {
        previewPrefixCls = 'vc-image-preview',
        icons = {},
        items,
        preview,
        fallback,
      } = props
      return (
        <>
          {slots.default?.()}
          <Preview
            aria-hidden={!isShowPreview.value}
            open={isShowPreview.value}
            prefixCls={previewPrefixCls}
            onClose={onPreviewClose}
            mousePosition={mousePosition.value}
            imgCommonProps={imgCommonProps}
            src={src}
            fallback={fallback}
            icons={icons}
            current={current.value}
            count={mergedItems.value.length}
            onChange={onInternalChange}
            {...previewConfig.value}
          />
        </>
      )
    }
  },
})
