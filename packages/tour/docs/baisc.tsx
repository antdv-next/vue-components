import { defineComponent, ref } from 'vue'
import Tour from '../src'
import './assets/basic.less'

const App = defineComponent(() => {
  const createBtnRef = ref<HTMLButtonElement | null>(null)
  const updateBtnRef = ref<HTMLButtonElement | null>(null)
  const deleteBtnRef = ref<HTMLButtonElement | null>(null)
  return () => {
    return (
      <div style={{ margin: '20px' }}>
        <div>
          <button class="ant-target" ref={createBtnRef} style={{ marginLeft: '100px' }}>
            Create
          </button>
          <div style={{ height: '200px' }}></div>
          <button class="ant-target" ref={updateBtnRef}>
            Update
          </button>
          <button class="ant-target" ref={deleteBtnRef}>
            Delete
          </button>
        </div>
        <div style={{ height: '200px' }}></div>
        <Tour
          defaultCurrent={2}
          steps={[
            {
              title: '创建',
              description: '创建一条数据',
              target: () => createBtnRef.value!,
              mask: true,
            },
            {
              title: '更新',
              description: (
                <div>
                  <span>更新一条数据</span>
                  <button>帮助文档</button>
                </div>
              ),
              target: () => updateBtnRef.value!,
            },
            {
              title: '更新（无阴影）',
              description: (
                <div>
                  <span>更新一条数据</span>
                  <button>帮助文档</button>
                </div>
              ),
              mask: false,
              target: () => updateBtnRef.value!,
            },
            {
              title: '删除',
              description: (
                <div>
                  <span>危险操作：删除一条数据</span>
                  <button>帮助文档</button>
                </div>
              ),
              target: () => deleteBtnRef.value!,
              mask: true,
              style: { color: 'red' },
            },
          ]}
        >
          {/*    */}
        </Tour>
      </div>
    )
  }
})

export default App
