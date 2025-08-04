import type { ExtractPropTypes, PropType } from 'vue'

export type BeforeUploadFileType = File | Blob | boolean | string

export type Action = string | ((file: RcFile) => string | PromiseLike<string>)

export function uploadProps() {
  return {
    capture: [Boolean, String] as PropType<boolean | 'user' | 'environment'>,
    multipart: { type: Boolean, default: undefined },
    name: String,
    disabled: { type: Boolean, default: undefined },
    component: String as PropType<any>,
    action: [String, Function] as PropType<Action>,
    method: String as PropType<UploadRequestMethod>,
    directory: { type: Boolean, default: undefined },
    folder: Boolean,
    data: [Object, Function] as PropType<Record<string, unknown> | ((file: RcFile | string | Blob) => Record<string, unknown>)>,
    headers: Object as PropType<UploadRequestHeader>,
    accept: String,
    multiple: { type: Boolean, default: undefined },
    onBatchStart: Function as PropType<
      (fileList: { file: RcFile, parsedFile: Exclude<BeforeUploadFileType, boolean> }[]) => void
    >,
    onReject: Function as PropType<(fileList: RcFile[]) => void>,
    onStart: Function as PropType<(file: RcFile) => void>,
    onError: Function as PropType<
      (error: Error, ret: Record<string, unknown>, file: RcFile) => void
    >,
    onSuccess: Function as PropType<
      (response: Record<string, unknown>, file: RcFile, xhr: XMLHttpRequest) => void
    >,
    onProgress: Function as PropType<(event: UploadProgressEvent, file: RcFile) => void>,
    beforeUpload: Function as PropType<
      (
        file: RcFile,
        FileList: RcFile[],
      ) => BeforeUploadFileType | Promise<void | BeforeUploadFileType>
    >,
    customRequest: Function as PropType<(option: UploadRequestOption) => void>,
    withCredentials: { type: Boolean, default: undefined },
    openFileDialogOnClick: { type: Boolean, default: undefined },
    prefixCls: String,
    id: String,
    onMouseenter: Function as PropType<(e: MouseEvent) => void>,
    onMouseleave: Function as PropType<(e: MouseEvent) => void>,
    onClick: Function as PropType<(e: MouseEvent | KeyboardEvent) => void>,
    hasControlInside: Boolean,
    pastable: Boolean,
  }
}

export type UploadProps = Partial<ExtractPropTypes<ReturnType<typeof uploadProps>>>

export interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number
}

export type UploadRequestMethod = 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch'

export type UploadRequestHeader = Record<string, string>

export type UploadRequestFile = Exclude<BeforeUploadFileType, File | boolean> | RcFile

export interface UploadRequestError extends Error {
  status?: number
  method?: UploadRequestMethod
  url?: string
}

export interface UploadRequestOption<T = any> {
  onProgress?: (event: UploadProgressEvent, file?: UploadRequestFile) => void
  onError?: (event: UploadRequestError | ProgressEvent, body?: T) => void
  onSuccess?: (body: T, fileOrXhr?: UploadRequestFile | XMLHttpRequest) => void
  data?: Record<string, unknown>
  filename?: string
  file: UploadRequestFile
  withCredentials?: boolean
  action: string
  headers?: UploadRequestHeader
  method: UploadRequestMethod
}

export interface RcFile extends File {
  uid: string
}
