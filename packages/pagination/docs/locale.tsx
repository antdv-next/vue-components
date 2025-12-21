/* eslint no-console: 0 */
import { defineComponent } from 'vue'
import localeInfo from '../src/locale/en_US.ts'
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
    <PaginationWithSizeChanger
      showQuickJumper
      showSizeChanger
      defaultPageSize={20}
      defaultCurrent={5}
      onShowSizeChange={onShowSizeChange}
      onChange={onChange}
      total={450}
      locale={localeInfo}
    />
  )
})
