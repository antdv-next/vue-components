import raf from '@v-c/util/dist/raf'
import { onUnmounted, ref } from 'vue'

/**
 * Always trigger latest once when call multiple time
 */
export default () => {
  const idRef = ref(0)

  const cleanUp = () => {
    raf.cancel(idRef.value)
  }

  onUnmounted(cleanUp)

  return (callback: () => void) => {
    cleanUp()

    idRef.value = raf(() => {
      callback()
    })
  }
}
