export interface DemoDataNode {
  label: string
  value: string
  key: string
  children?: DemoDataNode[]
  disabled?: boolean
  selectable?: boolean
  isLeaf?: boolean
  [key: string]: any
}

export function generateData(x = 3, y = 2, z = 1, gData: DemoDataNode[] = []) {
  // x：每一级下的节点总数。y：每级节点里有y个节点、存在子节点。z：树的level层级数（0表示一级）
  function _loop(_level: number, _preKey?: string, _tns?: DemoDataNode[]) {
    const preKey = _preKey || '0'
    const tns = _tns || gData

    const children: string[] = []
    for (let i = 0; i < x; i++) {
      const key = `${preKey}-${i}`
      const value = `${key}-value`
      tns.push({
        label: `${key}-label`,
        value,
        // Align `key` with `value` to avoid TreeSelect warning
        key: value,
        disabled: key === '0-0-0-1' || false,
      })
      if (i < y) {
        children.push(key)
      }
    }
    if (_level < 0) {
      return tns
    }
    const __level = _level - 1
    children.forEach((key, index) => {
      tns[index].children = []
      return _loop(__level, key, tns[index].children)
    })

    return null
  }
  _loop(z)
  return gData
}

export function calcTotal(x = 3, y = 2, z = 1) {
  const rec = (n: number): number => (n >= 0 ? x * y ** n-- + rec(n) : 0)
  return rec(z + 1)
}

export const gData = generateData()

export function generateTreeNodes(treeNode: { key: string }) {
  const arr: DemoDataNode[] = []
  const key = treeNode.key
  for (let i = 0; i < 3; i++) {
    const childKey = `${key}-${i}`
    const value = `${childKey}-value`
    arr.push({ label: `${childKey}-label`, value, key: value })
  }
  return arr
}

function setLeaf(treeData: DemoDataNode[], curKey: string, level: number) {
  const loopLeaf = (data: DemoDataNode[], lev: number) => {
    const l = lev - 1
    data.forEach((item) => {
      if (
        item.key.length > curKey.length
          ? item.key.indexOf(curKey) !== 0
          : curKey.indexOf(item.key) !== 0
      ) {
        return
      }
      if (item.children) {
        loopLeaf(item.children, l)
      }
      else if (l < 1) {
        item.isLeaf = true
      }
    })
  }
  loopLeaf(treeData, level + 1)
}

export function getNewTreeData(treeData: DemoDataNode[], curKey: string, child: DemoDataNode[], level: number) {
  const loop = (data: DemoDataNode[]) => {
    if (level < 1 || curKey.length - 3 > level * 2)
      return
    data.forEach((item) => {
      if (curKey.indexOf(item.key) === 0) {
        if (item.children) {
          loop(item.children)
        }
        else {
          item.children = child
        }
      }
    })
  }
  loop(treeData)
  setLeaf(treeData, curKey, level)
}

function loopData(data: DemoDataNode[], callback: (item: DemoDataNode, index: number, pos: string) => void) {
  const loop = (d: DemoDataNode[], level = '0') => {
    d.forEach((item, index) => {
      const pos = `${level}-${index}`
      if (item.children) {
        loop(item.children, pos)
      }
      callback(item, index, pos)
    })
  }
  loop(data)
}

function isPositionPrefix(smallPos: string, bigPos: string) {
  if (bigPos.length < smallPos.length) {
    return false
  }
  // attention: "0-0-1" "0-0-10"
  if (bigPos.length > smallPos.length && bigPos.charAt(smallPos.length) !== '-') {
    return false
  }
  return bigPos.substr(0, smallPos.length) === smallPos
}

export function getFilterValue(_val: any, sVal: string[], delVal: string[]) {
  const allPos: string[] = []
  const delPos: string[] = []
  loopData(gData, (item, _index, pos) => {
    if (sVal.includes(item.value)) {
      allPos.push(pos)
    }
    if (delVal.includes(item.value)) {
      delPos.push(pos)
    }
  })
  const newPos: string[] = []
  delPos.forEach((item) => {
    allPos.forEach((i) => {
      if (isPositionPrefix(item, i) || isPositionPrefix(i, item)) {
        // 过滤掉 父级节点 和 所有子节点。
        // 因为 node节点 不选时，其 父级节点 和 所有子节点 都不选。
        return
      }
      newPos.push(i)
    })
  })
  const newVal: string[] = []
  if (newPos.length) {
    loopData(gData, (item, _index, pos) => {
      if (newPos.includes(pos)) {
        newVal.push(item.value)
      }
    })
  }
  return newVal
}
