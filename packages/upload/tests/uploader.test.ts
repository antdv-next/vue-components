import type { UploadProps } from '../src/interface'
import { format } from 'node:util'
import { mount } from '@vue/test-utils'
import { fakeXhr, type FakeXMLHttpRequest, type FakeXMLHttpRequestStatic } from 'nise'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Upload from '../src/Upload'

const sleep = (timeout = 500) => new Promise(resolve => setTimeout(resolve, timeout))

// function Item(name) {
//   this.name = name
//   this.toString = () => this.name
// }

// function makeFileSystemEntry(item) {
// }

// function makeFileSystemEntryAsync(item) {
// }

// function makeDataTransferItem(item) {
//   return {
//     webkitGetAsEntry: () => makeFileSystemEntry(item),
//   }
// }

// function makeDataTransferItemAsync(item) {
//   return {
//     webkitGetAsEntry: () => makeFileSystemEntryAsync(item),
//   }
// }

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
    })

    // https://github.com/ant-design/ant-design/issues/50643
    it('with name', () => {
      const wrapper = mount(Upload, { props: { name: 'bamboo' } })
      expect(wrapper.find('input')!.element.name).toBe('bamboo')
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
    })

    it('should pass through role attributes', () => {
      const wrapper = mount(Upload, { props: { role: 'button' } })
      expect(wrapper.find('input')!.element.getAttribute('role')).toBe('button')
    })

    it('should not pass through unknown props', () => {
      const wrapper = mount(Upload, {
        props: {
          customProp: 'This shouldn\'t be rendered to DOM',
        },
      })
      expect(wrapper.find('input')!.element.hasAttribute('customProp')).toBe(false)
    })

    it('create works', () => {
      const wrapper = mount(Upload)
      const spans = wrapper.findAll('span')
      expect(spans.length).toBeGreaterThan(0)
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
            resolve(undefined)
          }
          catch (error) {
            resolve(error)
          }
        }
        handlers.onError = (error) => {
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
      return promises
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
})
