import { defineComponent, ref, watch } from 'vue'

export type BatchTask = (key: string, callback: VoidFunction) => void

export interface BatchUpdateRef {
  batch: BatchTask
}

const BatchUpdate = defineComponent(
  (_, { expose }) => {
    const batchInfo = ref<Record<string, VoidFunction>>({})
    watch(
      batchInfo,
      () => {
        const keys = Object.keys(batchInfo.value)
        if (keys.length) {
          keys.forEach((key) => {
            batchInfo.value[key]?.()
          })
          batchInfo.value = {}
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )
    expose(
      {
        batch: (key, callback) => {
          batchInfo.value[key] = callback
        },
      } as BatchUpdateRef,
    )
    return () => {
      return null
    }
  },
  {
    name: 'FormBatchUpdate',
    inheritAttrs: false,
  },
)

export default BatchUpdate
