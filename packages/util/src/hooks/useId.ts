import { useId } from 'vue'

function getUseId() {
  return useId
}

const useOriginalId = getUseId()

export default function (id?: string) {
  const vueId = useOriginalId()
  if (id) {
    return id
  }
  // Test env always return mock id
  if (process.env.NODE_ENV === 'test') {
    return 'test-id'
  }

  return vueId
}

/**
 * Generate a valid HTML id from prefix and key.
 * Sanitizes the key by replacing invalid characters with hyphens.
 * @param prefix - The prefix for the id
 * @param key - The element key, may contain spaces or invalid characters
 * @returns A valid HTML id string
 */
export function getId(prefix: string, key: string | number): string {
  const keyStr = String(key)

  // Valid id characters: letters, digits, hyphen, underscore, colon, period
  // Replace all invalid characters (including spaces) with hyphens to preserve length
  const sanitizedKey = keyStr.replace(/[^a-zA-Z0-9_.:-]/g, '-')

  return `${prefix}-${sanitizedKey}`
}
