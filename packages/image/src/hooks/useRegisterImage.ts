import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { usePreviewGroupContext } from '../context'

let uid = 0

export default function useRegisterImage(canPreview: Ref<boolean>, data: Ref<{
  src: any
  crossOrigin?: string | null
  decoding?: 'async' | 'sync' | 'auto'
  draggable?: boolean
  loading?: 'eager' | 'lazy'
  referrerPolicy?: string
  sizes?: string
  srcset?: string
  useMap?: string
  alt?: string
}>) {
  const id = ref(String(uid += 1))
  const groupContext = usePreviewGroupContext()
  const registerData = {
    data: data.value,
    canPreview: canPreview.value,
  }

  // Keep order start
  // Resolve https://github.com/ant-design/ant-design/issues/28881
  // Only need unRegister when component unMount

  watch([() => canPreview, () => data], () => {
    if (groupContext) {
      groupContext.register(id.value, registerData)
    }
  }, { immediate: true })

  return id
}
