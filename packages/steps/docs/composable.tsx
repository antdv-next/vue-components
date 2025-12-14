import { defineComponent } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

const description
  = '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶'

export default defineComponent(() => {
  return () => (
    <Steps
      current={1}
      iconRender={createIconRender()}
      items={[
        {
          title: '已完成',
          description,
        },
        {
          title: '进行中',
          description,
        },
        {
          title: '进行中',
          description,
          style: { fontWeight: 'bold', fontStyle: 'italic' },
        },
        {
          title: '待运行',
          description,
        },
      ]}
    />
  )
})
