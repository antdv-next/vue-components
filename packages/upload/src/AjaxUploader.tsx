import type { CSSProperties, InputHTMLAttributes } from 'vue'

export interface VcFile extends File {
  uid: string
}

export type BeforeUploadFileType = File | Blob | boolean | string

export type Action = string | ((file: VcFile) => string | PromiseLike<string>)

export interface UploadProps extends InputHTMLAttributes {
  name?: string
  style?: CSSProperties
  className?: string
  disabled?: boolean
}
