import { defineComponent } from 'vue'
import Trigger from '../src'
import { builtinPlacements } from './inside'
import './assets/index.less'

export default defineComponent(() => {
  return () => (
    <div
      style={{
        background: 'rgba(0, 0, 255, 0.1)',
        margin: '64px',
        height: '200px',
        overflow: 'auto',
        position: 'static',
      }}
    >
      <Trigger
        arrow
        popup={() => (
          <div
            style={{
              background: 'yellow',
              border: '1px solid blue',
              width: '200px',
              height: '60px',
              opacity: 0.9,
            }}
          >
            Popup
          </div>
        )}
        popupStyle={{ boxShadow: '0 0 5px red' }}
        popupVisible
        builtinPlacements={builtinPlacements}
        popupPlacement="top"
        stretch="minWidth"
        getPopupContainer={element => element?.parentElement as HTMLElement}
      >
        <span
          style={{
            background: 'green',
            color: '#FFF',
            paddingBlock: '30px',
            paddingInline: '70px',
            opacity: 0.9,
            transform: 'scale(0.6)',
            display: 'inline-block',
          }}
        >
          Target
        </span>
      </Trigger>
      {Array.from({ length: 20 }).map((_, index) => (
        <h1 key={index} style={{ width: '200vw' }}>
          Placeholder Line
          {' '}
          {index}
        </h1>
      ))}
    </div>
  )
})
