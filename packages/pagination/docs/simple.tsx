import Pagination from '@v-c/pagination'
import { defineComponent, ref } from 'vue'
import PaginationWithSizeChanger from './commonUtil.tsx'
import '../assets/index.less'

export default defineComponent(() => {
  const pageIndex = ref(1)

  return () => (
    <>
      <button onClick={() => { pageIndex.value += 1 }}>increase</button>
      <Pagination
        simple
        current={pageIndex.value}
        total={50}
        onChange={(page) => { pageIndex.value = page }}
      />
      <br />
      <Pagination
        simple={{ readOnly: true }}
        current={pageIndex.value}
        total={50}
        onChange={(page) => { pageIndex.value = page }}
      />
      <br />
      <Pagination simple defaultCurrent={1} total={50} />
      <br />
      <Pagination
        simple
        defaultCurrent={1}
        total={50}
        showTotal={total => `Total ${total} items`}
      />
      <br />
      <PaginationWithSizeChanger
        simple
        defaultCurrent={1}
        total={50}
        showSizeChanger
      />
      <hr />
      <a href="https://github.com/ant-design/ant-design/issues/46671">
        Antd #46671
      </a>
      <PaginationWithSizeChanger
        simple
        defaultCurrent={1}
        total={50}
        showSizeChanger
        showQuickJumper
      />
    </>
  )
})
