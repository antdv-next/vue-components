import { defineComponent } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

const description
  = '这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊这里是多信息的描述啊'

export default defineComponent(() => {
  return () => (
    <Steps
      orientation="vertical"
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
          title: '待运行',
          description,
        },
        {
          title: '待运行',
          description,
        },
      ]}
    />
  )
})

