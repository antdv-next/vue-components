import type { FakeXMLHttpRequest, FakeXMLHttpRequestStatic } from 'nise'
import type { UploadRequestOption } from '../src/interface'
import { fakeXhr } from 'nise'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import request from '../src/request'

let xhr: FakeXMLHttpRequestStatic
let requests: FakeXMLHttpRequest[]

function empty() {}
const option: UploadRequestOption = {
  onSuccess: empty,
  action: 'upload.do',
  data: { a: 1, b: 2, c: [3, 4] },
  filename: 'a.png',
  file: 'foo',
  headers: { from: 'hello' },
  method: 'post',
}

describe('request', () => {
  beforeEach(() => {
    xhr = fakeXhr.useFakeXMLHttpRequest()
    requests = []
    xhr.onCreate = req => requests.push(req)
  })

  beforeEach(() => {
    option.onError = empty
    option.onSuccess = empty
  })

  afterEach(() => {
    xhr.restore()
  })

  it('upload request success', () => {
    return new Promise<void>((resolve, reject) => {
      option.onError = reject
      option.onSuccess = (ret: Record<string, any>) => {
        try {
          expect(ret).toEqual({ success: true })
          expect((requests[0].requestBody as unknown as FormData).getAll('c[]')).toEqual(['3', '4'])
          resolve()
        }
        catch (error) {
          reject(error)
        }
      }
      request(option)
      requests[0].respond(200, {}, '{"success": true}')
    })
  })

  it('40x code should be error', () => {
    return new Promise<void | string>((resolve, reject) => {
      option.onError = (e) => {
        try {
          expect(e.toString()).toContain('404')
          resolve()
        }
        catch (error) {
          reject(error)
        }
      }

      option.onSuccess = () => resolve('404 should throw error')
      request(option)
      requests[0].respond(404, {}, 'Not found')
    })
  })

  it('2xx code should be success', () => {
    return new Promise<void>((resolve, reject) => {
      option.onError = reject
      option.onSuccess = (ret) => {
        try {
          expect(ret).toEqual('')
          resolve()
        }
        catch (error) {
          reject(error)
        }
      }
      request(option)
      requests[0].respond(204, {})
    })
  })

  it('get headers', () => {
    request(option)
    expect(requests[0].requestHeaders).toEqual({
      'X-Requested-With': 'XMLHttpRequest',
      'from': 'hello',
    })
  })

  it('can empty X-Requested-With', () => {
    Reflect.set(option.headers!, 'X-Requested-With', null)
    request(option)
    expect(requests[0].requestHeaders).toEqual({ from: 'hello' })
  })
})
