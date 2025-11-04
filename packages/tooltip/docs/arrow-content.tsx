import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap_white.less'

const text = <span>Tooltip Text</span>

const cellStyle: CSSProperties = {
  display: 'table-cell',
  height: '60px',
  width: '80px',
  textAlign: 'center',
  background: '#f6f6f6',
  verticalAlign: 'middle',
  border: '5px solid white',
}

const rowStyle: CSSProperties = {
  display: 'table-row',
}

export default defineComponent(() => {
  return () => (
    <div style={{ display: 'table', padding: '120px' }}>
      <div style={rowStyle}>
        <Tooltip
          placement="left"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Left
          </a>
        </Tooltip>
        <Tooltip
          placement="top"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Top
          </a>
        </Tooltip>
        <Tooltip
          placement="bottom"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Bottom
          </a>
        </Tooltip>
        <Tooltip
          placement="right"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Right
          </a>
        </Tooltip>
      </div>
      <div style={rowStyle}>
        <Tooltip
          placement="leftTop"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Left Top
          </a>
        </Tooltip>
        <Tooltip
          placement="leftBottom"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Left Bottom
          </a>
        </Tooltip>
        <Tooltip
          placement="rightTop"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Right Top
          </a>
        </Tooltip>
        <Tooltip
          placement="rightBottom"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Right Bottom
          </a>
        </Tooltip>
      </div>
      <div style={rowStyle}>
        <Tooltip
          placement="topLeft"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Top Left
          </a>
        </Tooltip>
        <Tooltip
          placement="topRight"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Top Right
          </a>
        </Tooltip>
        <Tooltip
          placement="bottomLeft"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Bottom Left
          </a>
        </Tooltip>
        <Tooltip
          placement="bottomRight"
          overlay={text}
          arrowContent={<div class="rc-tooltip-arrow-inner"></div>}
        >
          <a href="#" style={cellStyle}>
            Bottom Right
          </a>
        </Tooltip>
      </div>
    </div>
  )
})
