import { ref, watch } from 'vue'
import { isImageValid } from '../util'

type ImageStatus = 'normal' | 'error' | 'loading'

export default function useStatus({
  src,
  isCustomPlaceholder,
  fallback,
}: {
  src: string
  isCustomPlaceholder?: boolean
  fallback?: string
}) {
  const status = ref<ImageStatus>(isCustomPlaceholder ? 'loading' : 'normal')
  const isLoaded = ref(false)
  const isError = status.value === 'error'

  // https://github.com/react-component/image/pull/187
  watch(() => src, (_newSrc, _oldSrc, onCleanup) => {
    let isCurrentSrc = true
    isImageValid(src).then((isValid) => {
      // https://github.com/ant-design/ant-design/issues/44948
      // If src changes, the previous status.value =  should not be triggered
      if (!isValid && isCurrentSrc) {
        status.value = 'error'
      }
    })

    if (isCustomPlaceholder && !isLoaded.value) {
      status.value = 'loading'
    }
    else if (isError) {
      status.value = 'normal'
    }
    onCleanup(() => {
      isCurrentSrc = false
    })
  }, { immediate: true })

  const onLoad = () => {
    status.value = 'normal'
  }

  const getImgRef = (img?: HTMLImageElement) => {
    isLoaded.value = false
    if (status.value === 'loading' && img?.complete && (img.naturalWidth || img.naturalHeight)) {
      isLoaded.value = true
      onLoad()
    }
  }

  const srcAndOnload = isError && fallback ? { src: fallback } : { onLoad, src }

  return [getImgRef, srcAndOnload, status] as const
}
