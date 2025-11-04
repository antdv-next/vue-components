import { defineComponent, ref } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap_white.less'

const text = <span>Tooltip Text</span>

export default defineComponent(() => {
  const scrollRef = ref<HTMLDivElement | null>(null)

  return () => (
    <div style={{ padding: '10px' }}>
      <div
        ref={scrollRef}
        style={{
          border: '1px solid black',
          width: '100%',
          height: 'calc(100vh - 40px)',
          boxSizing: 'border-box',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            background: 'rgba(255,0,0,0.05)',
            width: '300%',
            height: '200%',
            position: 'relative',
          }}
        >
          <Tooltip
            placement="top"
            overlay={text}
            styles={{ container: { width: '300px', height: '50px' } }}
            popupVisible
            arrowContent={<div class="vc-tooltip-arrow-inner"></div>}
          >
            <div
              style={{
                background: 'rgba(0,255,0,0.3)',
                width: '100px',
                height: '50px',
                position: 'absolute',
                left: '30%',
                top: '30%',
              }}
            >
              Hover Me
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
})
