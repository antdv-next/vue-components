import type { BasicDataNode, Key, KeyEntities } from '../interface'

export default function getEntity<TreeDataType extends BasicDataNode = any>(
  keyEntities: KeyEntities<TreeDataType>,
  key: Key,
) {
  return keyEntities[String(key)]
}
