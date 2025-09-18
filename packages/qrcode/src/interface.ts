import type { ExtractPropTypes, PropType } from 'vue'
import type { Ecc, QrCode } from './libs/qrcodegen'
import { objectType, stringType } from '@v-c/util/dist/type'

export type Modules = ReturnType<QrCode['getModules']>
export interface Excavation { x: number, y: number, w: number, h: number }
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type CrossOrigin = 'anonymous' | 'use-credentials' | '' | undefined

export type ERROR_LEVEL_MAPPED_TYPE = {
  [index in ErrorCorrectionLevel]: Ecc;
}

export interface ImageSettings {
  src: string
  height: number
  width: number
  excavate: boolean
  x?: number
  y?: number
  opacity?: number
  crossOrigin?: CrossOrigin
}

export function qrProps() {
  return {
    value: { type: [String, Array] as PropType<string | string[]>, required: true },
    boostLevel: Boolean,
    size: { type: Number, default: 160 },
    level: stringType<ErrorCorrectionLevel>('M'),
    bgColor: String,
    fgColor: String,
    includeMargin: Boolean,
    marginSize: Number,
    imageSettings: objectType<ImageSettings>(),
    title: String,
    minVersion: Number,
  }
}

export type QRProps = Partial<ExtractPropTypes<ReturnType<typeof qrProps>>>
export type QRPropsCanvas = QRProps & HTMLCanvasElement
export type QRPropsSVG = QRProps & SVGSVGElement
