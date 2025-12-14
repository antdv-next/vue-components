import type { Ref } from 'vue'
import { computed, shallowRef, watch, watchEffect } from 'vue'
import { isImageValid } from '../util'

export type ImageStatus = 'normal' | 'error' | 'loading'

export default function useStatus(options: {
  src: Ref<string | undefined>
  isCustomPlaceholder?: Ref<boolean>
  fallback?: Ref<string | undefined>
}) {
  const { src, isCustomPlaceholder, fallback } = options

  const status = shallowRef<ImageStatus>(isCustomPlaceholder?.value ? 'loading' : 'normal')
  const isLoaded = shallowRef(false)

  const isError = computed(() => status.value === 'error')

  // https://github.com/react-component/image/pull/187
  watchEffect((onCleanup) => {
    let isCurrentSrc = true

    isImageValid(src.value || '').then((isValid) => {
      // https://github.com/ant-design/ant-design/issues/44948
      // If src changes, the previous setStatus should not be triggered
      if (!isValid && isCurrentSrc) {
        status.value = 'error'
      }
    })

    onCleanup(() => {
      isCurrentSrc = false
    })
  })

  watch(
    () => src.value,
    () => {
      isLoaded.value = false
      if (isCustomPlaceholder?.value && !isLoaded.value) {
        status.value = 'loading'
      }
      else if (isError.value) {
        status.value = 'normal'
      }
    },
    { immediate: true },
  )

  const onLoad = () => {
    isLoaded.value = true
    status.value = 'normal'
  }

  const getImgRef = (img?: HTMLImageElement | null) => {
    isLoaded.value = false
    if (
      status.value === 'loading'
      && img?.complete
      && (img.naturalWidth || img.naturalHeight)
    ) {
      isLoaded.value = true
      onLoad()
    }
  }

  const srcAndOnload = computed(() => {
    if (isError.value && fallback?.value) {
      return { src: fallback.value }
    }
    return { onLoad, src: src.value }
  })

  return [getImgRef, srcAndOnload, status] as const
}
