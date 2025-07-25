import type { ExtractPropTypes, PropType, SlotsType } from 'vue'
import type { TransformType } from './hooks/useImageTransform'
import type { ImgInfo } from './Image'
import type { ImageElementProps, OnGroupPreview } from './interface'
import type { InternalPreviewConfig, PreviewProps, PreviewSemanticName } from './Preview'
import { computed, defineComponent, ref, watch } from 'vue'
import { PreviewGroupContext } from './context'
import usePreviewItems from './hooks/usePreviewItem.ts'
import Preview from './Preview'

export interface GroupPreviewConfig extends InternalPreviewConfig {
  current?: number
  imageRender?: (
    originalNode: any,
    info: { transform: TransformType, current?: number, image: ImgInfo },
  ) => any
  onOpenChange?: (value: boolean, info: { current: number }) => void
  onChange?: (current: number, prevCurrent: number) => void
}

function previewGroupProps() {
  return {
    previewPrefixCls: {
      type: String,
      default: 'vc-image-preview',
    },
    icons: Object as PropType<PreviewProps['icons']>,
    items: Array as PropType<(string | ImageElementProps)[]>,
    fallback: String,
    preview: [Boolean, Object] as PropType<GroupPreviewConfig | boolean>,
  }
}

export type PreviewGroupProps = Partial<ExtractPropTypes<ReturnType<typeof previewGroupProps>>>

export default defineComponent({
  name: 'PreviewGroup',
  props: {
    previewPrefixCls: {
      type: String,
      default: 'vc-image-preview',
    },
    icons: Object as PropType<PreviewProps['icons']>,
    items: Array as PropType<(string | ImageElementProps)[]>,
    fallback: String,
    preview: [Boolean, Object] as PropType<GroupPreviewConfig | boolean>,
  },
  emits: ['change', 'openChange'],
  slots: Object as SlotsType<{
    default: any
    countRender: (current: number, total: number) => any
  }>,
  setup(props, { slots, emit }) {
    // ========================== Items ===========================
    const [mergedItems, register, fromItems] = usePreviewItems(props.items)

    // ========================= Preview ==========================
    const previewConfig = computed(() =>
      props.preview && typeof props.preview === 'object' ? props.preview : {} as GroupPreviewConfig,
    )

    // >>> Index
    const current = ref(previewConfig.value.current || 0)
    // watch(previewConfig, (newPreview) => {
    //   current.value = newPreview.current || current.value
    // })
    const keepOpenIndex = ref(false)

    // >>> Visible
    const isShowPreview = ref(!!previewConfig.value.open)
    watch(isShowPreview, (val) => {
      previewConfig.value.onOpenChange?.(val, { current: current.value })
      emit('openChange', val, { current: current.value })
    })

    // >>> Position
    const mousePosition = ref<{ x: number, y: number } | null>(null)

    const onPreviewFromImage: OnGroupPreview = (id: string, imageSrc: string, mouseX: number, mouseY: number) => {
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
      emit('change', next, prev)
    }

    const onPreviewClose = () => {
      isShowPreview.value = false
      mousePosition.value = null
      previewConfig.value.onOpenChange?.(false, { current: current.value })
    }

    // ========================= Context ==========================
    PreviewGroupContext({ register, onPreview: onPreviewFromImage })
    // ========================== Render ==========================
    return () => {
      const {
        previewPrefixCls = 'vc-image-preview',
        icons = {},
        fallback,
      } = props
      // >>> Image
      const { src, ...imgCommonProps } = mergedItems.value[current.value]?.data || {}

      return (
        <>
          {slots.default?.()}
          {mergedItems.value.length > 0 && (
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
              v-slots={{ countRender: slots.countRender }}
            />
          )}
        </>
      )
    }
  },
})
