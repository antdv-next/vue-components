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
      <h3>默认</h3>
      <PaginationWithSizeChanger
        showQuickJumper
        showSizeChanger
        defaultPageSize={20}
        defaultCurrent={5}
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
        total={450}
      />
      <h3>禁用</h3>
      <PaginationWithSizeChanger
        showQuickJumper
        showSizeChanger
        defaultPageSize={20}
        defaultCurrent={5}
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
        total={450}
        disabled
      />
      <h3>单页默认隐藏</h3>
      <PaginationWithSizeChanger
        showQuickJumper
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
        total={8}
      />
      <br />
      <PaginationWithSizeChanger
        showQuickJumper
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
        pageSize={10}
        total={8}
      />
    </>
  )
})
