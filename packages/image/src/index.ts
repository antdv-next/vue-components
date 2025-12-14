import type { ImageProps } from './Image'
import Image from './Image'
import PreviewGroup from './PreviewGroup'

export * from './Image'

export type { PreviewGroupProps } from './PreviewGroup'
export { PreviewGroup }
export type { ImageProps }

type ImageType = typeof Image & {
  PreviewGroup: typeof PreviewGroup
}

const ExportImage = Image as ImageType
ExportImage.PreviewGroup = PreviewGroup

export default ExportImage
