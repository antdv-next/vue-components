import type { ErrorCorrectionLevel, ImageSettings } from '../interface'
import { computed } from 'vue'
import { QrCode, QrSegment } from '../libs/qrcodegen'
import { ERROR_LEVEL_MAP, getImageSettings, getMarginSize } from '../utils'

export function useQRCode({
  value,
  level,
  minVersion,
  includeMargin,
  marginSize,
  imageSettings,
  size,
}: {
  value: string
  level: ErrorCorrectionLevel
  minVersion: number
  includeMargin: boolean
  marginSize?: number
  imageSettings?: ImageSettings
  size: number
}) {
  const qrcode = computed(() => {
    const segments = QrSegment.makeSegments(value)
    return QrCode.encodeSegments(
      segments,
      ERROR_LEVEL_MAP[level],
      minVersion,
    )
  })

  const cs = qrcode.value.getModules()
  const mg = getMarginSize(includeMargin, marginSize)
  const ncs = cs.length + mg * 2
  const cis = getImageSettings(cs, size, mg, imageSettings)

  return {
    qrcode: qrcode.value,
    margin: mg,
    cells: cs,
    numCells: ncs,
    calculatedImageSettings: cis,
  }
}
