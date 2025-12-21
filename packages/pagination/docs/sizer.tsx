/* eslint no-console: 0 */
import { defineComponent, ref } from 'vue'
import PaginationWithSizeChanger from './commonUtil.tsx'
import '../assets/index.less'

export default defineComponent(() => {
  const pageSize = ref(15)

  const onShowSizeChange = (current: number, nextPageSize: number) => {
    console.log(current)
    pageSize.value = nextPageSize
  }

  return () => (
    <div style={{ margin: '10px' }}>
      <PaginationWithSizeChanger
        showSizeChanger
        pageSize={pageSize.value}
        onShowSizeChange={onShowSizeChange}
        defaultCurrent={3}
        total={40}
      />
      <PaginationWithSizeChanger
        pageSize={pageSize.value}
        onShowSizeChange={onShowSizeChange}
        defaultCurrent={3}
        total={50}
      />
      <PaginationWithSizeChanger
        pageSize={pageSize.value}
        onShowSizeChange={onShowSizeChange}
        defaultCurrent={3}
        total={60}
      />
      <PaginationWithSizeChanger
        showSizeChanger={false}
        pageSize={pageSize.value}
        onShowSizeChange={onShowSizeChange}
        defaultCurrent={3}
        total={60}
      />
    </div>
  )
})
