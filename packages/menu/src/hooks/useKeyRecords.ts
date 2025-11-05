import { onBeforeUnmount, ref } from 'vue'
import warning from '@v-c/util/dist/warning'
import { nextSlice } from '../utils/timeUtil'

const PATH_SPLIT = '__RC_UTIL_PATH_SPLIT__'

const getPathStr = (keyPath: string[]) => keyPath.join(PATH_SPLIT)
const getPathKeys = (keyPathStr: string) => (keyPathStr ? keyPathStr.split(PATH_SPLIT) : [])

export const OVERFLOW_KEY = 'rc-menu-more'

export default function useKeyRecords() {
  const key2pathRef = new Map<string, string>()
  const path2keyRef = new Map<string, string>()
  const overflowKeys = ref<string[]>([])
  const updateRef = ref(0)
  const destroyRef = ref(false)

  const registerPath = (key: string, keyPath: string[]) => {
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !key2pathRef.has(key),
        `Duplicated key '${key}' used in Menu by path [${keyPath.join(' > ')}]`,
      )
    }

    const connectedPath = getPathStr(keyPath)
    path2keyRef.set(connectedPath, key)
    key2pathRef.set(key, connectedPath)

    updateRef.value += 1
    const currentId = updateRef.value

    nextSlice(() => {
      if (destroyRef.value || currentId !== updateRef.value) {
        return
      }
    })
  }

  const unregisterPath = (key: string, keyPath: string[]) => {
    const connectedPath = getPathStr(keyPath)
    path2keyRef.delete(connectedPath)
    key2pathRef.delete(key)
  }

  const refreshOverflowKeys = (keys: string[]) => {
    overflowKeys.value = keys
  }

  const getKeyPath = (eventKey: string, includeOverflow?: boolean) => {
    const fullPath = key2pathRef.get(eventKey) || ''
    const keys = getPathKeys(fullPath)

    if (includeOverflow && keys.length && overflowKeys.value.includes(keys[0])) {
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
    const keys = [...key2pathRef.keys()]
    if (overflowKeys.value.length) {
      keys.push(OVERFLOW_KEY)
    }
    return keys
  }

  const getSubPathKeys = (key: string): Set<string> => {
    const connectedPath = `${key2pathRef.get(key)}${PATH_SPLIT}`
    const pathKeys = new Set<string>()

    path2keyRef.forEach((targetKey, pathKey) => {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(targetKey)
      }
    })
    return pathKeys
  }

  onBeforeUnmount(() => {
    destroyRef.value = true
  })

  return {
    registerPath,
    unregisterPath,
    refreshOverflowKeys,
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys,
  }
}
