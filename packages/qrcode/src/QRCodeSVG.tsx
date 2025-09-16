import type { VNode } from 'vue'
import { defineComponent, watchEffect } from 'vue'
import { useQRCode } from './hooks/useQRCode'
import { qrProps } from './interface.ts'
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FRONT_COLOR,
  DEFAULT_LEVEL,
  DEFAULT_MINVERSION,
  DEFAULT_NEED_MARGIN,
  DEFAULT_SIZE,
  excavateModules,
  generatePath,
} from './utils'

export const QRCodeSVG = defineComponent({
  name: 'QRCodeSVG',
  inheritAttrs: false,
  props: { ...qrProps(), value: { type: String, required: true } },
  setup(props) {
    let image: VNode | null = null
    let fgPath: string = ''
    let numCells: number = 0

    watchEffect(() => {
      const {
        value,
        size = DEFAULT_SIZE,
        level = DEFAULT_LEVEL,
        includeMargin = DEFAULT_NEED_MARGIN,
        minVersion = DEFAULT_MINVERSION,
        marginSize,
        imageSettings,
      } = props

      const { margin, cells, numCells: getNumCells, calculatedImageSettings } = useQRCode({
        value,
        level,
        minVersion,
        includeMargin,
        marginSize,
        imageSettings,
        size,
      })

      let cellsToDraw = cells
      numCells = getNumCells

      if (imageSettings != null && calculatedImageSettings != null) {
        if (calculatedImageSettings.excavation != null) {
          cellsToDraw = excavateModules(
            cells,
            calculatedImageSettings.excavation,
          )
        }

        image = (
          <image
            href={imageSettings.src}
            height={calculatedImageSettings.h}
            width={calculatedImageSettings.w}
            x={calculatedImageSettings.x + margin}
            y={calculatedImageSettings.y + margin}
            preserveAspectRatio="none"
            opacity={calculatedImageSettings.opacity}
            // when crossOrigin is not set, the image will be tainted
            // and the canvas cannot be exported to an image
            crossOrigin={calculatedImageSettings?.crossOrigin}
          />
        )
      }

      fgPath = generatePath(cellsToDraw, margin)
    })

    return () => {
      const {
        bgColor = DEFAULT_BACKGROUND_COLOR,
        fgColor = DEFAULT_FRONT_COLOR,
        size,
        title,
      } = props
      return (
        <svg
          height={size}
          width={size}
          viewBox={`0 0 ${numCells} ${numCells}`}
          role="img"
        >
          {!!title && <title>{title}</title>}
          <path
            fill={bgColor}
            d={`M0,0 h${numCells}v${numCells}H0z`}
            shape-rendering="crispEdges"
          />
          <path fill={fgColor} d={fgPath} shape-rendering="crispEdges" />
          {image}
        </svg>
      )
    }
  },
})
