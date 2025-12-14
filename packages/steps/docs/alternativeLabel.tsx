import { defineComponent } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

const description
  = '这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊'

export default defineComponent(() => {
  return () => (
    <Steps
      titlePlacement="vertical"
      className="vc-steps-label-vertical"
      current={1}
      iconRender={createIconRender()}
      items={[
        {
          title: '已完成',
          description,
          status: 'wait',
        },
        {
          title: '进行中',
          description,
          status: 'wait',
          subTitle: '剩余 00:00:07',
        },
        undefined as any,
        {
          title: '待运行',
          description,
          status: 'process',
        },
        false as any,
        {
          title: '待运行',
          description,
          status: 'finish',
          disabled: true,
        },
        null as any,
      ]}
    />
  )
})
