import { cloneVNode, defineComponent, ref } from 'vue'
import Steps from '../src'
import { createIconRender } from './icon-render'

export default defineComponent(() => {
  const current = ref(0)

  return () => (
    <>
      <button
        type="button"
        onClick={() => {
          current.value = 0
        }}
      >
        Current:
        {' '}
        {current.value}
      </button>

      <br />

      <Steps
        className="vc-steps-dot vc-steps-inline"
        current={current.value}
        onChange={(val) => {
          current.value = val
        }}
        iconRender={createIconRender({ progressDot: true })}
        items={[
          {
            title: '开发',
            description: '开发阶段：开发中',
          },
          {
            title: '测试',
            description: '测试阶段：测试中',
          },
          {
            title: '预发',
            description: '预发阶段：预发中',
          },
          {
            title: '发布',
            description: '发布阶段：发布中',
          },
        ]}
        itemRender={(originNode: any, info: any) => {
          const title = typeof info?.item?.description === 'string' ? info.item.description : undefined
          return cloneVNode(originNode, { title })
        }}
      />
    </>
  )
})
