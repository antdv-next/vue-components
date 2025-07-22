import type { VcFile } from './interface'

interface InternalDataTransferItem extends DataTransferItem {
  isFile: boolean
  file: (cd: (file: VcFile & { webkitRelativePath?: string }) => void) => void
  createReader: () => any
  fullPath: string
  isDirectory: boolean
  name: string
  path: string
}

type InternalFile = VcFile & { webkitRelativePath?: string }
async function traverseFileTree(files: InternalDataTransferItem[], isAccepted: (file: InternalFile) => boolean) {
  const flattenFileList: InternalFile[] = []
  const progressFileList: InternalDataTransferItem[] = []
  files.forEach(file => progressFileList.push(file.webkitGetAsEntry() as any))

  async function readDirectory(directory: InternalDataTransferItem) {
    const dirReader = directory.createReader()
    const entries = []

    while (true) {
      const results = await new Promise<InternalDataTransferItem[]>((resolve) => {
        dirReader.readEntries(resolve, () => resolve([]))
      })
      const n = results.length

      if (!n) {
        break
      }

      for (let i = 0; i < n; i++) {
        entries.push(results[i])
      }
    }
    return entries
  }

  async function readFile(item: InternalDataTransferItem) {
    return new Promise<InternalFile | null>((resolve) => {
      item.file((file) => {
        if (isAccepted(file)) {
          if (item.fullPath && !file.webkitRelativePath) {
            Object.defineProperties(file, {
              webkitRelativePath: {
                writable: true,
              },
            });

            (file as any).webkitRelativePath = item.fullPath.replace(/^\//, '')
            Object.defineProperties(file, {
              webkitRelativePath: {
                writable: false,
              },
            })
          }
          resolve(file)
        }
        else {
          resolve(null)
        }
      })
    })
  }

  const _traverseFileTree = async (item: InternalDataTransferItem, path?: string) => {
    if (!item) {
      return
    }

    item.path = path || ''
    if (item.isFile) {
      const file = await readFile(item)
      if (file) {
        flattenFileList.push(file)
      }
    }
    else if (item.isDirectory) {
      const entries = await readDirectory(item)
      progressFileList.push(...entries)
    }
  }

  let wipIndex = 0
  while (wipIndex < progressFileList.length) {
    await _traverseFileTree(progressFileList[wipIndex])
    wipIndex++
  }

  return flattenFileList
}

export default traverseFileTree
