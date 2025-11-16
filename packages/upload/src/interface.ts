import type { Component, CSSProperties, InputHTMLAttributes, PropType } from 'vue'

export interface VcFile extends File {
  uid: string
}

export type BeforeUploadFileType = File | Blob | boolean | string

export type Action = string | ((file: VcFile) => string | PromiseLike<string>)

export type UploadRequestMethod = 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch'

export type UploadRequestHeader = Record<string, string>

export type UploadRequestFile = Exclude<BeforeUploadFileType, File | boolean> | VcFile

export interface UploadRequestError extends Error {
  status?: number
  method?: UploadRequestMethod
  url?: string
}

export interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number
}

export interface AjaxUploaderExpose {
  abort: (file: any) => void
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

export interface UploadProps extends Omit<InputHTMLAttributes, 'onError' | 'onProgress'> {
  name?: string
  style?: CSSProperties
  className?: string
  disabled?: boolean
  component?: Component | string
  action?: Action
  method?: UploadRequestMethod
  directory?: boolean
  data?: Record<string, unknown> | ((file: VcFile | string | Blob) => Record<string, unknown>)
  headers?: UploadRequestHeader
  accept?: string
  multiple?: boolean
  onBatchStart?: (
    fileList: { file: VcFile, parsedFile: Exclude<BeforeUploadFileType, boolean> | null }[],
  ) => void
  onStart?: (file: VcFile) => void
  onError?: (error: Error, ret: Record<string, unknown>, file: VcFile | null) => void
  onSuccess?: (response: Record<string, unknown>, file: VcFile | null, xhr: XMLHttpRequest) => void
  onProgress?: (event: UploadProgressEvent, file: VcFile | null) => void
  beforeUpload?: (
    file: VcFile,
    FileList: VcFile[],
  ) => BeforeUploadFileType | Promise<void | BeforeUploadFileType> | void
  customRequest?: (option: UploadRequestOption) => void | { abort: () => void }
  withCredentials?: boolean
  openFileDialogOnClick?: boolean
  prefixCls?: string
  id?: string
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  onClick?: (e: MouseEvent | KeyboardEvent) => void
  classNames?: {
    input?: string
  }
  styles?: {
    input?: CSSProperties
  }
  hasControlInside?: boolean
  pastable?: boolean
}

export function generatorUploadProps() {
  return {
    name: String,
    style: Object as PropType<CSSProperties>,
    className: String,
    disabled: Boolean,
    component: [String, Object] as PropType<Component | string>,
    action: [String, Function] as PropType<Action>,
    method: String as PropType<UploadRequestMethod>,
    directory: Boolean,
    data: [Object, Function] as PropType<
      Record<string, unknown> | ((file: VcFile | string | Blob) => Record<string, unknown>)
    >,
    headers: Object as PropType<UploadRequestHeader>,
    accept: String,
    multiple: Boolean,
    onBatchStart: Function as PropType<
      (fileList: { file: VcFile, parsedFile: Exclude<BeforeUploadFileType, boolean> }[]) => void
    >,
    onStart: Function as PropType<(file: VcFile) => void>,
    onError: Function as PropType<(error: Error, ret: Record<string, unknown>, file: VcFile) => void>,
    onSuccess: Function as PropType<
      (response: Record<string, unknown>, file: VcFile, xhr: XMLHttpRequest) => void
    >,
    onProgress: Function as PropType<(event: UploadProgressEvent, file: VcFile) => void>,
    beforeUpload: Function as PropType<
      (
        file: VcFile,
        FileList: VcFile[],
      ) => BeforeUploadFileType | Promise<void | BeforeUploadFileType> | void
    >,
    customRequest: Function as PropType<(option: UploadRequestOption) => void | { abort: () => void }>,
    withCredentials: Boolean,
    openFileDialogOnClick: Boolean,
    prefixCls: String,
    id: String,
    onMouseEnter: Function as PropType<(e: MouseEvent) => void>,
    onMouseLeave: Function as PropType<(e: MouseEvent) => void>,
    onClick: Function as PropType<(e: MouseEvent | KeyboardEvent) => void>,
    classNames: Object as PropType<{
      input?: string
    }>,
    styles: Object as PropType<{
      input?: CSSProperties
    }>,
    hasControlInside: Boolean,
    pastable: Boolean,
  } as const
}
