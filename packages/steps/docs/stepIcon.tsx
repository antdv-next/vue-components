import { defineComponent, ref } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

function stepIcon({ status, node }: { status: string, node: any }) {
  const isProcessing = status === 'process'
  return isProcessing ? <div style={{ backgroundColor: 'blue' }}>{node}</div> : node
}

export default defineComponent(() => {
  const current = ref(0)

  return () => (
    <>
      <button
        type="button"
        onClick={() => {
          current.value = (current.value + 1) % 5
        }}
      >
        loop
      </button>
      <Steps
        current={current.value}
        iconRender={createIconRender({ stepIcon: stepIcon as any })}
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
          {
            title: '待运行',
          },
        ]}
      />
    </>
  )
})
