import { defineComponent } from 'vue'
import Trigger from '../src'
import './assets/index.less'

export default defineComponent(() => {
  return () => (
    <Trigger
      arrow
      action="click"
      popupStyle={{ boxShadow: '0 0 5px red', position: 'absolute' as const }}
      getPopupContainer={item => item?.parentElement || document.body}
      popupAlign={{
        points: ['bc', 'tc'],
        overflow: {
          shiftX: 50,
          adjustY: true,
        },
        offset: [0, -10],
      }}
      stretch="minWidth"
      autoDestroy
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
    >
      <span
        style={{
          background: 'green',
          color: '#FFF',
          paddingBlock: '30px',
          paddingInline: '70px',
          opacity: 0.9,
          display: 'inline-block',
          marginLeft: '500px',
          marginTop: '200px',
        }}
      >
        Target
      </span>
    </Trigger>
  )
})
