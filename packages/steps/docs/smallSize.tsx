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
    <div>
      <Steps
        className="vc-steps-small"
        current={1}
        iconRender={createIconRender()}
        items={[
          {
            title: '已完成',
          },
          {
            title: '进行中',
          },
          {
            title: '待运行',
          },
          {
            title: '待运行',
          },
        ]}
      />
      <Steps
        className="vc-steps-small"
        current={1}
        style={{ marginTop: 40 } as any}
        iconRender={createIconRender()}
        items={[
          {
            title: '步骤1',
          },
          {
            title: '步骤2',
            icon: <Icon type="cloud" />,
          },
          {
            title: '步骤3',
            icon: 'apple' as any,
          },
          {
            title: '待运行',
            icon: 'github' as any,
          },
        ]}
      />
    </div>
  )
})
