import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import Tooltip, { Popup } from '../src'
import './assets/bootstrap.less'

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
    <>
      <div style={{ display: 'table', padding: '120px' }}>
        <div style={rowStyle}>
          <Tooltip placement="left" overlay={text}>
            <a href="#" style={cellStyle}>
              Left
            </a>
          </Tooltip>
          <Tooltip placement="top" overlay={text}>
            <a href="#" style={cellStyle}>
              Top
            </a>
          </Tooltip>
          <Tooltip placement="bottom" overlay={text}>
            <a href="#" style={cellStyle}>
              Bottom
            </a>
          </Tooltip>
          <Tooltip placement="right" overlay={text}>
            <a href="#" style={cellStyle}>
              Right
            </a>
          </Tooltip>
        </div>
        <div style={rowStyle}>
          <Tooltip placement="leftTop" overlay={text}>
            <a href="#" style={cellStyle}>
              Left Top
            </a>
          </Tooltip>
          <Tooltip placement="leftBottom" overlay={text}>
            <a href="#" style={cellStyle}>
              Left Bottom
            </a>
          </Tooltip>
          <Tooltip placement="rightTop" overlay={text}>
            <a href="#" style={cellStyle}>
              Right Top
            </a>
          </Tooltip>
          <Tooltip placement="rightBottom" overlay={text}>
            <a href="#" style={cellStyle}>
              Right Bottom
            </a>
          </Tooltip>
        </div>
        <div style={rowStyle}>
          <Tooltip placement="topLeft" overlay={text}>
            <a href="#" style={cellStyle}>
              Top Left
            </a>
          </Tooltip>
          <Tooltip placement="topRight" overlay={text}>
            <a href="#" style={cellStyle}>
              Top Right
            </a>
          </Tooltip>
          <Tooltip placement="bottomLeft" overlay={text}>
            <a href="#" style={cellStyle}>
              Bottom Left
            </a>
          </Tooltip>
          <Tooltip placement="bottomRight" overlay={text}>
            <a href="#" style={cellStyle}>
              Bottom Right
            </a>
          </Tooltip>
        </div>
      </div>
      <hr />
      <div>
        <h5>Debug Usage</h5>
        <Popup
          prefixCls="vc-tooltip"
          classNames={{ container: 'vc-tooltip-placement-top' }}
          styles={{ container: { display: 'inline-block', position: 'relative' } }}
        >
          Test
        </Popup>
      </div>
    </>
  )
})
