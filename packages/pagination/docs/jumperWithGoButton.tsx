import Pagination from '@v-c/pagination'
/* eslint no-console: 0 */
import { defineComponent } from 'vue'
import PaginationWithSizeChanger from './commonUtil.tsx'
import '../assets/index.less'

function onShowSizeChange(current: number, pageSize: number) {
  console.log(current)
  console.log(pageSize)
}

function onChange(current: number, pageSize: number) {
  console.log('onChange:current=', current)
  console.log('onChange:pageSize=', pageSize)
}

export default defineComponent(() => {
  return () => (
    <>
      <p> customize node </p>
      <PaginationWithSizeChanger
        showSizeChanger
        showQuickJumper={{ goButton: <button type="button">确定</button> }}
        defaultPageSize={20}
        defaultCurrent={5}
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
        total={450}
      />
      <p> default node </p>
      <Pagination
        simple
        showQuickJumper={{ goButton: true }}
        defaultCurrent={1}
        total={50}
      />
    </>
  )
})
