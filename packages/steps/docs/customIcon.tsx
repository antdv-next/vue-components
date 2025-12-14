import { defineComponent } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

const Icon = defineComponent({
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => <i class={`rcicon rcicon-${props.type}`} />
  },
})

export default defineComponent(() => {
  return () => (
    <Steps
      current={1}
      iconRender={createIconRender()}
      items={[
        { title: '步骤1', icon: <Icon type="cloud" /> },
        { title: '步骤2', icon: 'apple' as any },
        { title: '步骤1', icon: 'github' as any },
      ]}
    />
  )
})
