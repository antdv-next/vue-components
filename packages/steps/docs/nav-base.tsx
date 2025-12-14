import { defineComponent, ref } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

export default defineComponent(() => {
  const current = ref(0)

  const onChange = (next: number) => {
    console.log('onChange:', next)
    current.value = next
  }

  const containerStyle = {
    border: '1px solid rgb(235, 237, 240)',
    marginBottom: 24,
  }

  const description = 'This is a description.'

  return () => (
    <div>
      <Steps
        className="vc-steps-navigation"
        style={containerStyle as any}
        current={current.value}
        onChange={onChange}
        iconRender={createIconRender()}
        items={[
          {
            title: 'Step 1',
            status: 'finish',
            subTitle: '剩余 00:00:05 超长隐藏',
            description,
          },
          {
            title: 'Step 2',
            status: 'process',
            description,
          },
          {
            title: 'Step 3',
            status: 'wait',
            description,
            disabled: true,
          },
        ]}
      />
      <Steps
        className="vc-steps-navigation"
        style={containerStyle as any}
        current={current.value}
        onChange={onChange}
        iconRender={createIconRender()}
        items={[
          {
            title: 'Step 1',
            status: 'finish',
            subTitle: '剩余 00:00:05 超长隐藏',
          },
          {
            title: 'Step 2',
            status: 'process',
          },
          {
            title: 'Step 3',
            status: 'wait',
          },
          {
            title: 'Step 3',
            status: 'wait',
          },
        ]}
      />
    </div>
  )
})
