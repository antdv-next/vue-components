import { defineComponent } from 'vue'
import Image from '../src'
import { defaultIcons } from './assets/common'

export default defineComponent(() => {
  return () => (
    <div>
      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        width={200}
        preview={{
          icons: defaultIcons,
          actionsRender: (_, { actions }) => {
            const {
              onFlipY,
              onFlipX,
              onRotateLeft,
              onRotateRight,
              onZoomIn,
              onZoomOut,
              onClose,
              onReset,
            } = actions

            return (
              <div
                style={{
                  position: 'fixed',
                  display: 'flex',
                  bottom: '100px',
                  width: '100%',
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
                <button type="button" onClick={onFlipY}>
                  flipY
                </button>
                <button type="button" onClick={onFlipX}>
                  flipX
                </button>
                <button type="button" onClick={onRotateLeft}>
                  rotateLeft
                </button>
                <button type="button" onClick={onRotateRight}>
                  rotateRight
                </button>
                <button type="button" onClick={onZoomIn}>
                  zoomIn
                </button>
                <button type="button" onClick={onZoomOut}>
                  zoomOut
                </button>
                <button type="button" onClick={() => onReset()}>
                  reset
                </button>
                <button type="button" onClick={onClose}>
                  close
                </button>
              </div>
            )
          },
        }}
      />

      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        width="200px"
        height="200px"
        alt="test"
        preview={{
          icons: defaultIcons,
          imageRender: (_, { image }) => {
            return <div>{JSON.stringify(image)}</div>
          },
          actionsRender: (_, { image }) => {
            return <div>{JSON.stringify(image)}</div>
          },
        }}
      />
    </div>
  )
})
