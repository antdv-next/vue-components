import { defineComponent, ref } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

export default defineComponent(() => {
  const items = ref([
    {
      title: '已完成',
      description:
        '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
    },
    {
      title: '进行中',
      description:
        '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
    },
    {
      title: '待运行',
      description:
        '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
    },
    {
      title: '待运行',
      description:
        '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
    },
  ])

  function addStep() {
    items.value = [
      ...items.value,
      {
        title: '待运行',
        description: '新的节点',
      },
    ]
  }

  return () => (
    <div>
      <button type="button" onClick={addStep}>
        Add new step
      </button>
      <Steps iconRender={createIconRender()} items={items.value as any} />
    </div>
  )
})
