import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { isImageValid } from '../util'

type ImageStatus = 'normal' | 'error' | 'loading'

export default function useStatus({
  src,
  isCustomPlaceholder,
  fallback,
}: {
  src: Ref<string>
  isCustomPlaceholder?: Ref<boolean>
  fallback?: string
}) {
  const status = ref<ImageStatus>(isCustomPlaceholder?.value ? 'loading' : 'normal')
  const isLoaded = ref(false)
  const isError = computed(() => status.value === 'error')

  // https://github.com/react-component/image/pull/187
  watch(src, (newSrc, _oldSrc, onCleanup) => {
    let isCurrentSrc = true
    isImageValid(newSrc).then((isValid) => {
      // https://github.com/ant-design/ant-design/issues/44948
      // If src changes, the previous status.value =  should not be triggered
      if (!isValid && isCurrentSrc) {
        status.value = 'error'
      }
    })

    if (isCustomPlaceholder?.value && !isLoaded.value) {
      status.value = 'loading'
    }
    else if (isError.value) {
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

  const srcAndOnload = computed(() => isError.value && fallback ? { src: fallback } : { onLoad, src: src.value })

  return [getImgRef, srcAndOnload, status] as const
}
