import { ref, watchEffect } from 'vue'

const uniquePrefix = Math.random().toFixed(5).toString().slice(2)

let internalId = 0

export default function useUUID(id?: string) {
  const uuid = ref(id)

  watchEffect(() => {
    internalId += 1
    const newId = process.env.NODE_ENV === 'test' ? 'test' : `${uniquePrefix}-${internalId}`
    uuid.value = `vc-menu-uuid-${newId}`
  })

  return uuid
}
