import { defineComponent, ref } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap.less'

export default defineComponent(() => {
  const visible = ref(false)
  const destroyed = ref(false)

  const handleDestroy = () => {
    destroyed.value = true
  }

  const handleChange = (event: Event) => {
    const { value } = event.target as HTMLInputElement
    visible.value = value.length === 0
  }

  return () => {
    if (destroyed.value) {
      return null
    }

    return (
      <div>
        <div style={{ marginTop: '100px', marginLeft: '100px', marginBottom: '100px' }}>
          <Tooltip
            visible={visible.value}
            motion={{ name: 'vc-tooltip-zoom' }}
            trigger={[]}
            styles={{ root: { zIndex: 1000 } }}
            overlay={<span>required!</span>}
          >
            <input onInput={handleChange} />
          </Tooltip>
        </div>
        <button type="button" onClick={handleDestroy}>
          destroy
        </button>
      </div>
    )
  }
})
