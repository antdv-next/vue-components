import warning from '@v-c/util/dist/warning'
import { ref, watchEffect } from 'vue'
import { nextSlice } from '../utils/timeUtil'

const PATH_SPLIT = '__VC_UTIL_PATH_SPLIT__'

const getPathStr = (keyPath: string[]) => keyPath.join(PATH_SPLIT)
const getPathKeys = (keyPathStr: string) => keyPathStr.split(PATH_SPLIT)

export const OVERFLOW_KEY = 'vc-menu-more'

export default function useKeyRecords() {
  const internalForceUpdate = ref({})
  const key2pathRef = ref(new Map<string, string>())
  const path2keyRef = ref(new Map<string, string>())
  const overflowKeys = ref([])
  const updateRef = ref(0)
  const destroyRef = ref(false)

  const forceUpdate = () => {
    if (!destroyRef.value) {
      internalForceUpdate.value = {}
    }
  }

  const registerPath = (key: string, keyPath: string[]) => {
    // Warning for invalidate or duplicated `key`
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !key2pathRef.value.has(key),
        `Duplicated key '${key}' used in Menu by path [${keyPath.join(' > ')}]`,
      )
    }

    // Fill map
    const connectedPath = getPathStr(keyPath)
    path2keyRef.value.set(connectedPath, key)
    key2pathRef.value.set(key, connectedPath)

    updateRef.value += 1
    const id = updateRef.value

    nextSlice(() => {
      if (id === updateRef.value) {
        forceUpdate()
      }
    })
  }

  const unregisterPath = (key: string, keyPath: string[]) => {
    const connectedPath = getPathStr(keyPath)
    path2keyRef.value.delete(connectedPath)
    key2pathRef.value.delete(key)
  }

  const refreshOverflowKeys = (keys: string[]) => {
    overflowKeys.value = keys
  }

  const getKeyPath = (eventKey: string, includeOverflow?: boolean) => {
    const fullPath = key2pathRef.value.get(eventKey) || ''
    const keys = getPathKeys(fullPath)

    if (includeOverflow && overflowKeys.value.includes(keys[0])) {
      keys.unshift(OVERFLOW_KEY)
    }

    return keys
  }

  const isSubPathKey = (pathKeys: string[], eventKey: string) =>
    pathKeys.value
      .filter(item => item !== undefined)
      .some((pathKey) => {
        const pathKeyList = getKeyPath(pathKey, true)
        return pathKeyList.includes(eventKey)
      })
  const getKeys = () => {
    const keys = [...key2pathRef.value.keys()]

    if (overflowKeys.value.length) {
      keys.push(OVERFLOW_KEY)
    }

    return keys
  }

  /**
   * Find current key related child path keys
   */
  const getSubPathKeys = (key: string): Set<string> => {
    const connectedPath = `${key2pathRef.value.get(key)}${PATH_SPLIT}`
    const pathKeys = new Set<string>();

    [...path2keyRef.value.keys()].forEach((pathKey) => {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.value.get(pathKey)!)
      }
    })
    return pathKeys
  }

  watchEffect(
    (onCleanup) => {
      onCleanup(() => {
        destroyRef.value = true
      })
    },
  )

  return {
    // Register
    registerPath,
    unregisterPath,
    refreshOverflowKeys,

    // Util
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys,
  }
}
