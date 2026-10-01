import { toRaw } from 'vue'

/**
 * Copy `obj` keeping only the keys whose value is not `undefined`, optionally
 * dropping `omitKeys` as well.
 *
 * Vue materialises every declared prop on `props` (unset ones as `undefined`),
 * so spreading `props` into a child forwards dozens of empty keys that the
 * child has to normalise in `initProps` / `setFullProps` on every mount, and
 * that every further spread / omit copies again. Boolean props in @v-c default
 * to `undefined` rather than `false`, so leaving an unset key out behaves the
 * same as forwarding it as `undefined`.
 *
 * Reads each key exactly once: `obj` is usually a reactive proxy and every read
 * goes through the `get` trap and dependency tracking.
 */
export default function pickDefined<T extends object, K extends keyof T = never>(
  obj: T,
  omitKeys?: readonly K[],
): Omit<T, K> {
  const result: Record<PropertyKey, any> = {}
  // Enumerate keys on the raw object: `for...in` over a proxy runs the
  // `ownKeys` trap plus a descriptor lookup per key. Values are still read
  // through `obj` so the caller's effect tracks each prop it forwards.
  const raw = toRaw(obj)
  for (const key in raw) {
    const value = obj[key]
    if (value !== undefined && (!omitKeys || !omitKeys.includes(key as unknown as K))) {
      result[key] = value
    }
  }
  // Typed like `omit`: dropping an undefined-valued key does not change the
  // declared shape, it only leaves out keys that were already `undefined`.
  return result as Omit<T, K>
}
