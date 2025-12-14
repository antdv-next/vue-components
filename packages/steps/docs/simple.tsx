import { defineComponent, ref } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

const description
  = '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶'

const ControlSteps = defineComponent(() => {
  const current = ref(0)

  return () => (
    <Steps
      current={current.value}
      onChange={(val) => {
        console.log('Change:', val)
        current.value = val
      }}
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
          description: 'Hello World!',
        },
        {
          title: '待运行',
        },
      ]}
    />
  )
})

export default defineComponent(() => {
  return () => (
    <div>
      <Steps
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
        current={1}
        style={{ marginTop: 40 } as any}
        iconRender={createIconRender()}
        items={[
          {
            title: '已完成',
            description,
          },
          {
            title: '进行中',
            subTitle: '剩余 00:00:07',
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
      <Steps
        current={1}
        style={{ marginTop: 40 } as any}
        status="error"
        iconRender={createIconRender()}
        items={[
          {
            title: '已完成',
            description,
          },
          {
            title: '进行中',
            subTitle: '剩余 00:00:07',
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
      <ControlSteps />
    </div>
  )
})
