import { defineComponent, ref } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap.less'

export default defineComponent(() => {
  const visible = ref(false)
  const destroyed = ref(false)

  const onVisibleChange = (nextVisible: boolean) => {
    visible.value = nextVisible
  }

  const onDestroy = () => {
    destroyed.value = true
  }

  return () => {
    if (destroyed.value) {
      return null
    }

    return (
      <div>
        <div style={{ marginTop: '300px', marginLeft: '100px', marginBottom: '100px' }}>
          <Tooltip
            visible={visible.value}
            motion={{ name: 'vc-tooltip-zoom' }}
            onVisibleChange={onVisibleChange}
            trigger="click"
            overlay={<span>I am a tooltip</span>}
          >
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault()
              }}
            >
              trigger
            </a>
          </Tooltip>
        </div>
        <button type="button" onClick={onDestroy}>
          destroy
        </button>
      </div>
    )
  }
})
