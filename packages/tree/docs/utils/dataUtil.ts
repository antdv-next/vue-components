export interface DemoDataNode {
  title: string
  key: string
  children?: DemoDataNode[]
  disabled?: boolean
  disableCheckbox?: boolean
  isLeaf?: boolean
  [key: string]: any
}

export function generateData(x = 3, y = 2, z = 1, gData: DemoDataNode[] = []) {
  function loop(level: number, preKey?: string, tns?: DemoDataNode[]) {
    const currentPreKey = preKey || '0'
    const currentTns = tns || gData

    const children: string[] = []
    for (let i = 0; i < x; i++) {
      const key = `${currentPreKey}-${i}`
      currentTns.push({ title: `${key}-label`, key: `${key}-key` })
      if (i < y) {
        children.push(key)
      }
    }

    if (level < 0) {
      return currentTns
    }

    const nextLevel = level - 1
    children.forEach((key, index) => {
      currentTns[index].children = []
      loop(nextLevel, key, currentTns[index].children)
    })

    return null
  }

  loop(z)
  return gData
}

export function calcTotal(x = 3, y = 2, z = 1) {
  const rec = (n: number): number => (n >= 0 ? x * y ** n-- + rec(n) : 0)
  return rec(z + 1)
}

export const gData = generateData()

function loopData(data: DemoDataNode[], callback: (item: DemoDataNode, index: number, pos: string) => void) {
  const loop = (d: DemoDataNode[], level: string | number = 0) => {
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

function spl(str: string) {
  return str.split('-')
}

function splitLen(str: string) {
  return str.split('-').length
}

function isSibling(pos: string[], pos1: string[]) {
  pos.pop()
  pos1.pop()
  return pos.join(',') === pos1.join(',')
}

export function getRadioSelectKeys(data: DemoDataNode[], selectedKeys: string[], key?: string) {
  const res: string[] = []
  const pkObjArr: [string, string][] = []
  const selPkObjArr: any[] = []

  loopData(data, (item, _index, pos) => {
    if (selectedKeys.includes(item.key)) {
      pkObjArr.push([pos, item.key])
    }
    if (key && key === item.key) {
      selPkObjArr.push(pos, item.key)
    }
  })

  const lenObj: Record<string, [string, string][]> = {}
  const getPosKey = (pos: string, k: string) => {
    const posLen = splitLen(pos)
    if (!lenObj[posLen]) {
      lenObj[posLen] = [[pos, k]]
    }
    else {
      lenObj[posLen].forEach((pkArr, i) => {
        if (isSibling(spl(pkArr[0]), spl(pos))) {
          lenObj[posLen][i] = [pos, k]
        }
        else if (spl(pkArr[0]) !== spl(pos)) {
          lenObj[posLen].push([pos, k])
        }
      })
    }
  }

  pkObjArr.forEach((pk) => {
    getPosKey(pk[0], pk[1])
  })
  if (key) {
    getPosKey(selPkObjArr[0], selPkObjArr[1])
  }

  Object.keys(lenObj).forEach((item) => {
    lenObj[item].forEach((i) => {
      if (!res.includes(i[1])) {
        res.push(i[1])
      }
    })
  })

  return res
}
