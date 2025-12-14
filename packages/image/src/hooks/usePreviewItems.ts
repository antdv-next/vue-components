import type { PreviewGroupProps } from '../PreviewGroup.tsx'
import type { Ref } from 'vue'
import { computed, shallowRef, watchEffect } from 'vue'
import { COMMON_PROPS } from '../common.ts'
import type { ImageElementProps, PreviewImageElementProps, RegisterImage } from '../interface'

export type Items = Omit<PreviewImageElementProps & { id?: string }, 'canPreview'>[]

/**
 * Merge props provided `items` or context collected images
 */
export default function usePreviewItems(
  items?: Ref<PreviewGroupProps['items'] | undefined>,
): [items: Ref<Items>, registerImage: RegisterImage, fromItems: Ref<boolean>] {
  // Context collection image data
  const images = shallowRef<Record<string, PreviewImageElementProps>>({})

  const registerImage: RegisterImage = (id, data) => {
    images.value = {
      ...images.value,
      [id]: data,
    }

    return () => {
      const cloneImgs = { ...images.value }
      delete cloneImgs[id]
      images.value = cloneImgs
    }
  }

  const mergedItems = shallowRef<Items>([])

  watchEffect(() => {
    // use `items` first
    if (items?.value) {
      mergedItems.value = items.value.map((item) => {
        if (typeof item === 'string') {
          return { data: { src: item } }
        }
        const data: ImageElementProps = {} as any
        Object.keys(item).forEach((key) => {
          if (['src', ...COMMON_PROPS].includes(key)) {
            (data as any)[key] = (item as any)[key]
          }
        })
        return { data }
      })
      return
    }

    // use registered images secondly
    mergedItems.value = Object.keys(images.value).reduce((total: Items, id) => {
      const { canPreview, data } = images.value[id]!
      if (canPreview) {
        total.push({ data, id })
      }
      return total
    }, [])
  })

  return [mergedItems, registerImage, computed(() => !!items?.value)]
}
