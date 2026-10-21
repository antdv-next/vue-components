import { onBeforeUnmount, ref, shallowRef, triggerRef } from 'vue'
import { nextSlice } from '../utils/timeUtil'

const PATH_SPLIT = '__VC_UTIL_PATH_SPLIT__'

const getPathStr = (keyPath: string[]) => keyPath.join(PATH_SPLIT)
const getPathKeys = (keyPathStr: string) => keyPathStr.split(PATH_SPLIT)

export const OVERFLOW_KEY = 'vc-menu-more'

export default function useKeyRecords() {
  // The maps are mutated in place and readers are notified via `triggerRef`.
  // Register / unregister work on the raw maps and plain counters so they never
  // read reactive state: items unregister from watcher cleanups, which run inside
  // the parent's render effect on unmount and would otherwise subscribe (and,
  // through the counter write, re-trigger) that parent.
  const key2path = new Map<string, string>()
  const path2key = new Map<string, string>()
  const key2pathRef = shallowRef(key2path)
  const path2keyRef = shallowRef(path2key)
  const overflowKeys = ref<string[]>([])
  let updateId = 0
  let destroyed = false

  const schedulePathRegisterUpdate = () => {
    updateId += 1
    const id = updateId

    nextSlice(() => {
      if (!destroyed && id === updateId) {
        triggerRef(key2pathRef)
        triggerRef(path2keyRef)
      }
    })
  }

  const registerPath = (key: string, keyPath: string[]) => {
    // Warning for invalidate or duplicated `key`
    if (process.env.NODE_ENV !== 'production') {
      if (key2path.has(key)) {
        console.warn(
          `Duplicated key '${key}' used in Menu by path [${keyPath.join(' > ')}]`,
        )
      }
    }

    // Fill map
    const connectedPath = getPathStr(keyPath)
    path2key.set(connectedPath, key)
    key2path.set(key, connectedPath)
    schedulePathRegisterUpdate()
  }

  const unregisterPath = (key: string, keyPath: string[]) => {
    const connectedPath = getPathStr(keyPath)
    path2key.delete(connectedPath)
    key2path.delete(key)
    schedulePathRegisterUpdate()
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
    pathKeys
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

  onBeforeUnmount(() => {
    destroyed = true
  })

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
