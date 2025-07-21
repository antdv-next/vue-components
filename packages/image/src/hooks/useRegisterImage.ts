import { ref, watch, watchEffect } from 'vue'
import { usePreviewGroupContext } from '../context'

let uid = 0

export default function useRegisterImage(canPreview: boolean, data: {
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
}) {
  const id = ref(String(uid += 1))
  const groupContext = usePreviewGroupContext()

  const registerData = {
    data,
    canPreview,
  }

  // Keep order start
  // Resolve https://github.com/ant-design/ant-design/issues/28881
  // Only need unRegister when component unMount
  watchEffect(() => {
    if (groupContext) {
      return groupContext.register(id, registerData)
    }
  }, { flush: 'post' })

  watch([() => canPreview, () => data], () => {
    if (groupContext) {
      groupContext.register(id, registerData)
    }
  })

  return id
}
