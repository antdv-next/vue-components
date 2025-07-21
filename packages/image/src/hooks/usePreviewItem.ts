import type { ComputedRef } from 'vue'
import type {
  ImageElementProps,
  InternalItem,
  PreviewImageElementProps,
  RegisterImage,
} from '../interface'
import type { PreviewGroupProps } from '../PreviewGroup'
import { computed, ref } from 'vue'
import { COMMON_PROPS } from '../common'

export type Items = Omit<InternalItem, 'canPreview'>[]

/**
 * Merge props provided `items` or context collected images
 */
export default function usePreviewItems(
  items?: PreviewGroupProps['items'],
): [items: ComputedRef<Items>, registerImage: RegisterImage, fromItems: boolean] {
  // Context collection image data
  const images = ref<Record<number, PreviewImageElementProps>>({})

  const registerImage: RegisterImage = (id: string, data) => {
    // 添加/更新图片
    images.value = { ...images.value, [id]: data }

    // 返回清理函数
    return () => {
      const updated = { ...images.value }
      delete updated[id]
      images.value = updated
    }
  }

  // items
  const mergedItems = computed<Items>(() => {
    // 优先使用 items
    if (items) {
      return items.map((item) => {
        if (typeof item === 'string') {
          return { data: { src: item } }
        }

        const data: ImageElementProps = {}
        Object.keys(item).forEach((key) => {
          if (['src', ...COMMON_PROPS].includes(key)) {
            data[key] = item[key]
          }
        })
        return { data }
      })
    }

    // 其次使用注册的图片
    return Object.keys(images.value).reduce((total: Items, idStr) => {
      const id = Number(idStr)
      const { canPreview, data } = images.value[id]

      if (canPreview) {
        total.push({ data, id })
      }

      return total
    }, [])
  })

  return [mergedItems, registerImage, !!items]
}
