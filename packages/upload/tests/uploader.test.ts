import type { UploadProps, VcFile } from '../src/interface'
import { format } from 'node:util'
import { mount } from '@vue/test-utils'
import { fakeXhr, type FakeXMLHttpRequest, type FakeXMLHttpRequestStatic } from 'nise'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import Upload from '../src/Upload'

const sleep = (timeout = 500) => new Promise(resolve => setTimeout(resolve, timeout))

// 修复 Item 构造函数的类型定义
interface ItemInstance {
  name: string
  toString: () => string
}

function Item(this: ItemInstance, name: string) {
  this.name = name
  this.toString = () => this.name
}

// 定义文件系统条目的接口
interface FileSystemEntry {
  isDirectory: boolean
  isFile: boolean
  file: (handle: (file: ItemInstance) => void) => void
  createReader: () => {
    readEntries: (handle: (entries: FileSystemEntry[]) => void) => void
  }
}

interface FileSystemItem {
  name: string
  children?: FileSystemItem[]
}

function makeFileSystemEntry(item: FileSystemItem): FileSystemEntry {
  const isDirectory = Array.isArray(item.children)
  const ret: FileSystemEntry = {
    isDirectory,
    isFile: !isDirectory,
    file: (handle: (file: ItemInstance) => void) => {
      handle(new (Item as any)(item.name))
    },
    createReader: () => {
      let first = true
      return {
        readEntries(handle: (entries: FileSystemEntry[]) => void) {
          if (!first) {
            return handle([])
          }

          first = false
          return handle(item.children!.map(makeFileSystemEntry))
        },
      }
    },
  }
  return ret
}

// 定义异步文件系统条目的接口
interface FileSystemEntryAsync {
  isDirectory: boolean
  isFile: boolean
  file: (handle: (file: ItemInstance) => void) => void
  createReader: () => {
    readEntries: (
      handle: (entries: FileSystemEntryAsync[]) => void,
      error?: (err: Error) => void
    ) => Promise<void>
  }
}

// 定义输入项的接口，包含错误处理
interface FileSystemItemAsync {
  name: string
  children?: FileSystemItemAsync[]
  error?: boolean
}

function makeFileSystemEntryAsync(item: FileSystemItemAsync): FileSystemEntryAsync {
  const isDirectory = Array.isArray(item.children)
  const ret: FileSystemEntryAsync = {
    isDirectory,
    isFile: !isDirectory,
    file: (handle: (file: ItemInstance) => void) => {
      handle(new (Item as any)(item.name))
    },
    createReader: () => {
      let first = true
      return {
        async readEntries(
          handle: (entries: FileSystemEntryAsync[]) => void,
          error?: (err: Error) => void,
        ): Promise<void> {
          await sleep(100)

          if (!first) {
            return handle([])
          }

          if (item.error && first) {
            return error && error(new Error('read file error'))
          }

          first = false
          return handle(item.children!.map(makeFileSystemEntryAsync))
        },
      }
    },
  }
  return ret
}

// 定义 DataTransferItem 接口
interface DataTransferItem {
  webkitGetAsEntry: () => FileSystemEntry
}

function makeDataTransferItem(item: FileSystemItem): DataTransferItem {
  return {
    webkitGetAsEntry: () => makeFileSystemEntry(item),
  }
}

function makeDataTransferItemAsync(item: FileSystemItem): DataTransferItem {
  return {
    webkitGetAsEntry: () => makeFileSystemEntryAsync(item),
  }
}

describe('uploader', () => {
  let xhr: FakeXMLHttpRequestStatic
  let requests: FakeXMLHttpRequest[]
  let errorMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    xhr = fakeXhr.useFakeXMLHttpRequest()
    requests = []
    xhr.onCreate = req => requests.push(req)

    const originalConsoleError = globalThis.console.error
    errorMock = vi.spyOn(globalThis.console, 'error')
    errorMock.mockImplementation((message, ...otherParams) => {
      originalConsoleError(message, ...otherParams)
      throw new Error(format(message, ...otherParams))
    })
  })

  afterEach(() => {
    xhr.restore()
    errorMock.mockRestore()
  })

  describe('ajax uploader', () => {
    if (typeof FormData === 'undefined') {
      return
    }

    let uploader: ReturnType<typeof mount>
    const handlers: UploadProps = {}

    const props: UploadProps = {
      action: '/test',
      data: { a: 1, b: 2 },
      multiple: true,
      accept: '.png',
      onStart(file) {
        console.log('onStart', file, file.name)
        if (handlers.onStart) {
          handlers.onStart(file)
        }
      },
      onSuccess(ret, file) {
        console.log('onSuccess', ret)
        if (handlers.onSuccess) {
          handlers.onSuccess(ret, file, null!)
        }
      },
      onProgress(step, file) {
        console.log('onProgress', step, file)
      },
      onError(err, result, file) {
        console.log('onError', err)
        if (handlers.onError) {
          handlers.onError(err, result, file)
        }
      },
    }

    beforeEach(() => {
      uploader = mount(Upload, { props })
    })

    afterEach(() => {
      uploader.unmount()
    })

    it('with id', () => {
      const wrapper = mount(Upload, { props: { id: 'bamboo' } })
      expect(wrapper.find('input')!.element.id).toBe('bamboo')
      wrapper.unmount()
    })

    // https://github.com/ant-design/ant-design/issues/50643
    it('with name', () => {
      const wrapper = mount(Upload, { props: { name: 'bamboo' } })
      expect(wrapper.find('input')!.element.name).toBe('bamboo')
      wrapper.unmount()
    })

    it('should pass through data & aria attributes', () => {
      const wrapper = mount(Upload, {
        props: {
          'data-testid': 'data-testid',
          'data-my-custom-attr': 'custom data attribute',
          'aria-label': 'Upload a file',
        },
      })

      const input = wrapper.find('input')!.element
      expect(input.getAttribute('data-testid')).toBe('data-testid')
      expect(input.getAttribute('data-my-custom-attr')).toBe('custom data attribute')
      expect(input.getAttribute('aria-label')).toBe('Upload a file')
      wrapper.unmount()
    })

    it('should pass through role attributes', () => {
      const wrapper = mount(Upload, { props: { role: 'button' } })
      expect(wrapper.find('input')!.element.getAttribute('role')).toBe('button')
      wrapper.unmount()
    })

    it('should not pass through unknown props', () => {
      const wrapper = mount(Upload, {
        props: {
          customProp: 'This shouldn\'t be rendered to DOM',
        },
      })
      expect(wrapper.find('input')!.element.hasAttribute('customProp')).toBe(false)
      wrapper.unmount()
    })

    it('create works', () => {
      const wrapper = mount(Upload)
      const spans = wrapper.findAll('span')
      expect(spans.length).toBeGreaterThan(0)
      wrapper.unmount()
    })

    it('upload success', async () => {
      const input = uploader.find('input')!
      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name
          },
        },
      ];
      (files as any).item = (i: number) => files[i]

      const promise = new Promise<void | Error>((resolve) => {
        handlers.onSuccess = (ret, file) => {
          expect(ret[1]).toEqual(file!.name)
          expect(file).toHaveProperty('uid')
          resolve()
        }

        handlers.onError = (err) => {
          resolve(err)
        }
      })

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`)
      }, 100)

      return promise
    })

    it('upload error', async () => {
      const input = uploader.find('input')!

      const files = [
        {
          name: 'error.png',
          toString() {
            return this.name
          },
        },
      ];
      (files as any).item = (i: number) => files[i]

      const promise = new Promise<void>((resolve) => {
        handlers.onError = (err: any, ret) => {
          expect(err instanceof Error).toEqual(true)
          expect(err.status).toEqual(400)
          expect(ret).toEqual('error 400')
          resolve(err)
        }
      })

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')

      setTimeout(() => {
        requests[0].respond(400, {}, `error 400`)
      }, 100)

      return promise
    })

    it('drag to upload', async () => {
      const input = uploader.find('input')!

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name
          },
        },
      ];
      (files as any).item = (i: number) => files[i]

      const promise = new Promise<void | Error>((resolve) => {
        handlers.onSuccess = (ret, file) => {
          expect(ret[1]).toEqual(file!.name)
          expect(file).toHaveProperty('uid')
          resolve()
        }

        handlers.onError = (err) => {
          resolve(err)
        }
      })

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`)
      }, 100)

      return promise
    })

    it('drag unaccepted type files to upload will not trigger onStart', async () => {
      const input = uploader.find('input')!
      const files = [
        {
          name: 'success.jpg',
          type: 'image/jpeg',
          toString() {
            return this.name
          },
        },
      ];
      (files as any).item = (i: number) => files[i]

      const dataTransfer = {
        files,
        items: files.map(file => ({
          kind: 'file',
          type: file.type,
          getAsFile: () => file,
        })),
      }

      await input.trigger('drop', {
        dataTransfer,
      })
      const mockStart = vi.fn()
      handlers.onStart = mockStart
      const promise = new Promise<void | Error>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(0)
          resolve()
        }, 100)
      })

      return promise
    })

    it('drag files with multiple false', async () => {
      const wrapper = mount(Upload, { props: { ...props, multiple: false } })
      const input = wrapper.find('input')!
      const files = [
        new File([''], 'success.png', { type: 'image/png' }),
        new File([''], 'filtered.png', { type: 'image/png' }),
      ]
      Object.defineProperty(files, 'item', {
        value: (i: number) => files[i],
      })

      // Only can trigger once
      let triggerTimes = 0
      handlers.onStart = () => {
        triggerTimes += 1
      }
      const promises = new Promise<unknown | undefined>((resolve) => {
        handlers.onSuccess = (ret, file) => {
          try {
            expect(ret[1]).toEqual(file!.name)
            expect(file).toHaveProperty('uid')
            expect(triggerTimes).toEqual(1)
            wrapper.unmount()
            resolve(undefined)
          }
          catch (error) {
            wrapper.unmount()
            resolve(error)
          }
        }
        handlers.onError = (error) => {
          wrapper.unmount()
          resolve(error)
        }
      })

      Object.defineProperty(input, 'files', {
        value: files,
      })

      await input.trigger('drop', {
        dataTransfer: { files },
      })

      setTimeout(() => {
        handlers.onSuccess!(['', files[0].name] as any, files[0] as any, null!)
      }, 100)

      return promises
    })

    it('paste to upload', async () => {
      const wrapper = mount(Upload, { props: { ...props, pastable: true } })
      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name
          },
        },
      ];
      (files as any).item = (i: number) => files[i]

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file!.name)
        expect(file).toHaveProperty('uid')
        wrapper.unmount()
      }

      handlers.onError = (err) => {
        throw err
      }
      const pasteEvent = document.createEvent('Event')
      pasteEvent.initEvent('paste', true, true)

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          files,
        },
        writable: false,
      })

      document.dispatchEvent(pasteEvent)

      await sleep(100)
      requests[0].respond(200, {}, `["","${files[0].name}"]`)
    })

    it('paste unaccepted type files to upload will not trigger onStart', async () => {
      const files = [
        {
          name: 'success.jpg',
          toString() {
            return this.name
          },
        },
      ];
      (files as any).item = (i: number) => files[i]

      const pasteEvent = document.createEvent('Event')
      pasteEvent.initEvent('paste', true, true)

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          files,
        },
        writable: false,
      })

      document.dispatchEvent(pasteEvent)

      const mockStart = vi.fn()
      handlers.onStart = mockStart

      expect(mockStart.mock.calls.length).toBe(0)
    })

    it('paste files with multiple false', async () => {
      const wrapper = mount(Upload, { props: { ...props, multiple: false, pastable: true } })
      const input = wrapper.find('input')!
      const files = [
        new File([''], 'success.png', { type: 'image/png' }),
        new File([''], 'filtered.png', { type: 'image/png' }),
      ]
      Object.defineProperty(files, 'item', {
        value: (i: number) => files[i],
      })

      // Only can trigger once
      let triggerTimes = 0
      handlers.onStart = () => {
        triggerTimes += 1
      }
      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file!.name)
        expect(file).toHaveProperty('uid')
        expect(triggerTimes).toEqual(1)
        wrapper.unmount()
      }
      handlers.onError = (error) => {
        throw error
      }
      Object.defineProperty(input, 'files', {
        value: files,
      })

      const pasteEvent = document.createEvent('Event')
      pasteEvent.initEvent('paste', true, true)

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          files,
        },
        writable: false,
      })

      document.dispatchEvent(pasteEvent)

      await sleep(100)
      handlers.onSuccess!(['', files[0].name] as any, files[0] as any, null!)
    })

    it('support action and data is function returns Promise', async () => {
      const action: any = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve('/upload.do')
          }, 1000)
        })
      }
      const data: any = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ field1: 'a' })
          }, 1000)
        })
      }
      const wrapper = mount(Upload, { props: { data, action } })
      const input = wrapper.find('input')!
      const files = [new File([''], 'success.png', { type: 'image/png' })]
      Object.defineProperty(files, 'item', {
        value: (i: number) => files[i],
      })

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')

      await new Promise(resolve => setTimeout(resolve, 100))
      await new Promise(resolve => setTimeout(resolve, 2000))
      wrapper.unmount()
    })

    it('should pass file to request', async () => {
      let resolve: () => void
      const promises = new Promise<void>((res) => {
        resolve = res
      })
      const fakeRequest = vi.fn((file) => {
        expect(file).toEqual(
          expect.objectContaining({
            filename: 'file', // <= https://github.com/react-component/upload/pull/574
            file: expect.any(File),
            method: 'post',
            onError: expect.any(Function),
            onProgress: expect.any(Function),
            onSuccess: expect.any(Function),
            data: expect.anything(),
          }),
        )

        resolve()
      })

      const wrapper = mount(Upload, { props: { ...props, customRequest: fakeRequest } })
      const input = wrapper.find('input')!
      const files = [new File([''], 'success.png', { type: 'image/png' })]
      Object.defineProperty(files, 'item', {
        value: (i: number) => files[i],
      })

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')
      const result = await promises
      wrapper.unmount()
      return result
    })

    it('should call preventDefault when paste contains files', () => {
      const wrapper = mount(Upload, { props: { ...props, pastable: true } })

      const files = [new File([''], 'test.png', { type: 'image/png' })]

      const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault')

      const pasteEvent = document.createEvent('Event')
      pasteEvent.initEvent('paste', true, true)

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          items: [{ kind: 'file' }],
          files,
        },
        writable: false,
      })

      document.dispatchEvent(pasteEvent)

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1)
      preventDefaultSpy.mockRestore()

      wrapper.unmount()
    })

    it('should not call preventDefault when paste contains no files', () => {
      const wrapper = mount(Upload, { props: { ...props, pastable: true } })

      const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault')

      const pasteEvent = document.createEvent('Event')
      pasteEvent.initEvent('paste', true, true)

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          items: [{ kind: 'string' }],
          files: [],
        },
        writable: false,
      })

      document.dispatchEvent(pasteEvent)

      expect(preventDefaultSpy).toHaveBeenCalledTimes(0)
      preventDefaultSpy.mockRestore()

      wrapper.unmount()
    })
  })

  describe('directory uploader', () => {
    if (typeof FormData === 'undefined') {
      return
    }

    let uploader: ReturnType<typeof mount>
    const handlers: UploadProps = {}

    const props: UploadProps = {
      action: '/test',
      data: { a: 1, b: 2 },
      directory: true,
      accept: '.png',
      onStart(file) {
        console.log('onStart', file, file.name)
        if (handlers.onStart) {
          handlers.onStart(file)
        }
      },
      onSuccess(ret, file) {
        console.log('onSuccess', ret)
        if (handlers.onSuccess) {
          handlers.onSuccess(ret, file, null!)
        }
      },
      onProgress(step, file) {
        console.log('onProgress', step, file)
      },
      onError(err, result, file) {
        console.log('onError', err)
        if (handlers.onError) {
          handlers.onError(err, result, file)
        }
      },
    }

    beforeEach(() => {
      uploader = mount(Upload, { props })
    })

    it('beforeUpload should run after all children files are parsed', async () => {
      const props = { action: '/test', directory: true, accept: '.png' }
      const mockBeforeUpload = vi.fn()
      const beforeUpload = (file: File, fileList: File[]) => {
        console.log('beforeUpload', file, fileList)
        mockBeforeUpload(file, fileList)
      }
      const Test = defineComponent(() => {
        return () => {
          return h(Upload, { ...props, beforeUpload })
        }
      })

      const wrapper = mount(Test)
      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            children: [
              {
                name: '1.png',
              },
              {
                name: '2.png',
              },
              {
                name: 'rc',
                children: [
                  {
                    name: '5.webp',
                  },
                  {
                    name: '4.webp',
                  },
                ],
              },
            ],
          },
        ],
      }
      const input = wrapper.find('input')!

      await input.trigger('drop', {
        dataTransfer: { items: [makeDataTransferItem(files)] },
      })
      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockBeforeUpload.mock.calls.length).toBe(2)
          expect(mockBeforeUpload.mock.calls[0][1].length).toBe(2)
          expect(mockBeforeUpload.mock.calls[1][1].length).toBe(2)
          resolve()
          wrapper.unmount()
        }, 100)
      })

      return promises
    })

    it('unaccepted type files to upload will not trigger onStart', async () => {
      const input = uploader.find('input')!
      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            children: [
              {
                name: 'unaccepted.webp',
              },
            ],
          },
        ],
      }

      await input.trigger('drop', { dataTransfer: { items: [makeDataTransferItem(files)] } })
      const mockStart = vi.fn()
      handlers.onStart = mockStart
      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(0)
          resolve()
        }, 100)
      })
      return promises
    })

    it('dragging and dropping a non file with a file does not prevent the file from being uploaded', async () => {
      const input = uploader.find('input')!
      const file = {
        name: 'success.png',
      }
      await input.trigger('drop', {
        dataTransfer: { items: [{ webkitGetAsEntry: () => null }, makeDataTransferItem(file)] },
      })
      const mockStart = vi.fn()
      handlers.onStart = mockStart
      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(1)
          resolve()
        }, 100)
      })
      return promises
    })

    it('dragging and dropping files to upload through asynchronous file reading is run normal', async () => {
      const input = uploader.find('input')!

      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            children: [
              {
                name: '1.png',
              },
              {
                name: '2.png',
              },
              {
                name: 'rc',
                children: [
                  {
                    name: '5.webp',
                  },
                  {
                    name: '4.webp',
                  },
                ],
              },
            ],
          },
        ],
      }
      await input.trigger('drop', { dataTransfer: { items: [makeDataTransferItemAsync(files)] } })
      const mockStart = vi.fn()
      handlers.onStart = mockStart

      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(2)
          resolve()
        }, 1000)
      })
      return promises
    })

    it('dragging and dropping files to upload through asynchronous file reading with some readEntries method throw error', async () => {
      const input = uploader.find('input')!

      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            error: true,
            children: [
              {
                name: '1.png',
              },
              {
                name: 'ffc',
                children: [
                  {
                    name: '7.png',
                  },
                  {
                    name: '8.png',
                  },
                ],
              },
            ],
          },
          {
            name: 'rc',
            children: [
              {
                name: '3.png',
              },
              {
                name: '4.webp',
              },
            ],
          },
        ],
      }

      const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault')

      await input.trigger('dragover')
      expect(preventDefaultSpy).toHaveBeenCalledTimes(1)

      await input.trigger('drop', { dataTransfer: { items: [makeDataTransferItemAsync(files)] } })
      const mockStart = vi.fn()
      handlers.onStart = mockStart

      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(1)
          resolve()
        }, 1000)
      })
      preventDefaultSpy.mockRestore()

      return promises
    })

    it('unaccepted type files to upload will not trigger onStart when select directory', async () => {
      const input = uploader.find('input')!
      const files = [
        {
          name: 'unaccepted.webp',
        },
      ]

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')
      const mockStart = vi.fn()
      handlers.onStart = mockStart
      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(0)
          resolve()
        }, 100)
      })
      return promises
    })

    it('accept if type is invalidate', async () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = mount(Upload, {
        props: {
          ...props,
          accept: 'jpg,png',
        },
      })
      const input = wrapper.find('input')!
      const files = [
        {
          name: 'unaccepted.webp',
        },
      ]

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })

      const mockStart = vi.fn()
      handlers.onStart = mockStart

      await input.trigger('change')

      expect(errSpy).toHaveBeenCalledWith(
        'Warning: Upload takes an invalidate \'accept\' type \'jpg\'.Skip for check.',
      )

      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(1)
          errSpy.mockRestore()
          resolve()
        }, 100)
      })
      return promises
    })

    it('paste directory', async () => {
      const wrapper = mount(Upload, {
        props: {
          ...props,
          pastable: true,
        },
      })
      const vcUpload = wrapper.find('.vc-upload')!
      const files = {
        name: 'foo',
        children: [
          {
            name: '1.png',
          },
        ],
      }

      await vcUpload.trigger('mouseenter')
      const pasteEvent = document.createEvent('Event')
      pasteEvent.initEvent('paste', true, true)

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          items: [makeDataTransferItem(files)],
        },
        writable: false,
      })

      document.dispatchEvent(pasteEvent)
      const mockStart = vi.fn()
      handlers.onStart = mockStart

      const promises = new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(1)
          resolve()
        }, 100)
      })
      return promises
    })
  })

  describe('accept', () => {
    if (typeof FormData === 'undefined') {
      return
    }

    let uploader: ReturnType<typeof mount>
    const handlers: UploadProps = {}

    const props: UploadProps = {
      action: '/test',
      data: { a: 1, b: 2 },
      directory: true,
      onStart(file) {
        if (handlers.onStart) {
          handlers.onStart(file)
        }
      },
    }

    function test(
      desc: string,
      value?: string,
      files?: object[],
      expectCallTimes?: number,
      errorMessage?: string,
      extraProps?: Partial<UploadProps>,
    ) {
      it(desc, async () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        const wrapper = mount(Upload, {
          props: {
            ...props,
            ...extraProps,
            accept: value,
          },
        })
        const input = wrapper.find('input')!
        const inputElement = input.element as HTMLInputElement
        Object.defineProperty(inputElement, 'files', {
          value: files,
          writable: false,
        })
        const mockStart = vi.fn()
        handlers.onStart = mockStart

        await input.trigger('change')

        if (errorMessage) {
          // console.log(errSpy)
          expect(errSpy).toHaveBeenCalledWith(errorMessage)
        }

        const promises = new Promise<void>((resolve) => {
          setTimeout(() => {
            expect(mockStart.mock.calls.length).toBe(expectCallTimes)

            errSpy.mockRestore()
            resolve()
            wrapper.unmount()
          }, 100)
        })
        return promises
      })
    }

    test(
      'default',
      undefined,
      [
        {
          name: 'accepted.webp',
        },
        {
          name: 'accepted.png',
        },
        {
          name: 'accepted.txt',
        },
      ],
      3,
    )

    test(
      'support .png',
      '.png',
      [
        {
          name: 'unaccepted.webp',
        },
        {
          name: 'accepted.png',
        },
      ],
      1,
    )

    test(
      'support .jpg and .jpeg',
      '.jpg',
      [
        {
          name: 'unaccepted.webp',
        },
        {
          name: 'accepted.jpg',
        },
        {
          name: 'accepted.jpeg',
        },
      ],
      2,
    )

    test(
      'support .ext,ext',
      '.png,.txt',
      [
        {
          name: 'accepted.png',
        },
        {
          name: 'unaccepted.jpg',
        },
        {
          name: 'accepted.txt',
        },
      ],
      2,
    )

    test(
      'support image/type',
      'image/jpeg',
      [
        {
          name: 'unaccepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.jpg',
          type: 'image/jpeg',
        },
      ],
      1,
    )

    test(
      'support image/*',
      'image/*',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.jpg',
          type: 'image/jpeg',
        },
        {
          name: 'unaccepted.text',
          type: 'text/plain',
        },
      ],
      2,
    )

    test(
      'support *',
      '*',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.text',
          type: 'text/plain',
        },
      ],
      2,
    )

    test(
      'support */*',
      '*/*',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.text',
          type: 'text/plain',
        },
      ],
      2,
    )

    test(
      'invalidate type should skip',
      'jpg',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.text',
          type: 'text/plain',
        },
      ],
      2,
      'Warning: Upload takes an invalidate \'accept\' type \'jpg\'.Skip for check.',
    )

    test(
      'should skip when select file',
      '.png',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'unaccepted.text',
          type: 'text/plain',
        },
      ],
      2,
      '',
      {
        directory: false,
      },
    )

    it('should trigger beforeUpload when uploading non-accepted files in folder mode', async () => {
      const beforeUpload = vi.fn()
      uploader = mount(Upload, {
        props: {
          folder: true,
          accept: '.png',
          beforeUpload,
        },
      })
      const input = uploader.find('input')!

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: [new File([], 'bamboo.png'), new File([], 'light.jpg')],
        writable: false,
      })
      await input.trigger('change')
      expect(beforeUpload).toHaveBeenCalledTimes(2)
    })
  })

  describe('transform file before request', () => {
    let uploader: ReturnType<typeof mount>
    beforeEach(() => {
      uploader = mount(Upload)
    })

    afterEach(() => {
      uploader.unmount()
    })

    it('noes not affect receive origin file when transform file is null', async () => {
      const handlers: UploadProps = {}
      const props: UploadProps = {
        action: '/test',
        onSuccess(ret: Record<string, any>, file: VcFile) {
          if (handlers.onSuccess) {
            handlers.onSuccess(ret, file, null!)
          }
        },
        transformFile() {
          return null
        },
      } as any
      const wrapper = mount(Upload, { props })
      const input = wrapper.find('input')!

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name
          },
        },
      ];

      (files as any).item = (i: number) => files[i]

      const promises = new Promise((resolve) => {
        handlers.onSuccess = (ret, file) => {
          expect(ret[1]).toEqual(file!.name)
          expect(file).toHaveProperty('uid')
          resolve(file)
        }
      })

      const inputElement = input.element as HTMLInputElement
      Object.defineProperty(inputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`)
      }, 100)

      return promises
    })
  })

  describe('onBatchStart', () => {
    const files = [new File([], 'bamboo.png'), new File([], 'light.png')]

    const batchEventFiles = files.map(file =>
      expect.objectContaining({
        file,
      }),
    )

    async function testWrapper(props?: UploadProps) {
      const onBatchStart = vi.fn()
      const uploader = mount(Upload, {
        props: {
          onBatchStart,
          ...props,
        },
      })
      const input = uploader.find('input')!

      Object.defineProperty(input.element as HTMLInputElement, 'files', {
        value: files,
        writable: false,
      })
      await input.trigger('change')

      // Always wait 500ms to done the test
      await sleep()

      expect(onBatchStart).toHaveBeenCalled()

      return onBatchStart
    }

    it('trigger without pending', async () => {
      const onBatchStart = await testWrapper()
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles)
    })

    it('trigger with beforeUpload delay', async () => {
      const beforeUpload = vi.fn(async (file) => {
        if (file.name === 'bamboo.png') {
          await sleep(100)
          return true
        }
        return true
      })

      const onBatchStart = await testWrapper({ beforeUpload })

      expect(beforeUpload).toHaveBeenCalledTimes(2)
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles)
    })

    it('beforeUpload but one is deny', async () => {
      const beforeUpload = vi.fn(async (file) => {
        if (file.name === 'light.png') {
          await sleep(100)
          return false
        }
        return true
      })

      const onStart = vi.fn()
      const onBatchStart = await testWrapper({ beforeUpload, onStart })

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(beforeUpload).toHaveBeenCalledTimes(2)
      expect(onBatchStart).toHaveBeenCalledWith(
        files.map(file =>
          expect.objectContaining({
            file,
            parsedFile: file.name === 'light.png' ? null : file,
          }),
        ),
      )
    })

    it('action delay', async () => {
      const action = vi.fn(async () => {
        await sleep(100)
        return 'test'
      })

      const onBatchStart = await testWrapper({ action })

      expect(action).toHaveBeenCalledTimes(2)
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles)
    })

    it('data delay', async () => {
      const data = vi.fn(async () => {
        await sleep(100)
        return 'test'
      }) as any

      const onBatchStart = await testWrapper({ data })

      expect(data).toHaveBeenCalledTimes(2)
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles)
    })
  })

  it('dynamic change action in beforeUpload should work', async () => {
    const Test = defineComponent(() => {
      const action = ref('light')

      async function beforeUpload() {
        action.value = 'bamboo'
        console.log('hello')
        await sleep(100)
        return true
      }

      return () => h(Upload, {
        beforeUpload,
        action: action.value,
      })
    })

    const wrapper = mount(Test)

    const input = wrapper.find('input')!

    Object.defineProperty(input.element as HTMLInputElement, 'files', {
      value: [
        {
          name: 'little.png',
          toString() {
            return this.name
          },
        },
      ],
      writable: false,
    })

    await input.trigger('change')

    await sleep(200)

    expect(requests[0].url).toEqual('bamboo')
  })

  it('input style defaults to display none', () => {
    const wrapper = mount(Upload)
    const input = wrapper.find('input')!

    expect(input.element.style.display).toBe('none')
  })

  it('classNames and styles should work', () => {
    const wrapper = mount(Upload, {
      props: {
        classNames: {
          input: 'bamboo-input',
        },
        styles: {
          input: {
            color: 'red',
          },
        },
      },
    })
    expect(wrapper.find('.bamboo-input').element).toBeTruthy()

    const input = wrapper.find('.bamboo-input').element as HTMLInputElement
    expect(input.style.color).toBe('red')
    expect(input.style.display).toBe('none')
  })

  it('should be focusable and has role=button by default', () => {
    const wrapper = mount(Upload)

    expect(wrapper.find('span').element.tabIndex).toBe(0)
    expect(wrapper.find('span').element.getAttribute('role')).toBe('button')
  })

  it('should not be focusable and doesn\'t have role=button with hasControlInside=true', () => {
    const wrapper = mount(Upload, {
      props: {
        hasControlInside: true,
      },
    })

    expect(wrapper.find('span').element.tabIndex).not.toBe(0)
    expect(wrapper.find('span').element.getAttribute('role')).not.toBe('button')
  })
})
