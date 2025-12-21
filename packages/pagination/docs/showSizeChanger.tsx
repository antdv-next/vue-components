/* eslint no-console: 0 */
import { defineComponent } from 'vue'
import PaginationWithSizeChanger from './commonUtil.tsx'
import '../assets/index.less'

export default defineComponent(() => {
  const onPageSizeChange = (value: number | string) => {
    console.log(value)
  }

  return () => (
    <>
      <PaginationWithSizeChanger
        defaultCurrent={1}
        total={50}
        showSizeChanger={false}
      />
      <PaginationWithSizeChanger
        defaultCurrent={1}
        total={50}
        showSizeChanger
      />
      <PaginationWithSizeChanger
        defaultCurrent={1}
        showSizeChanger
        sizeChangerProps={{
          options: [
            { value: 10, label: '10 条每页' },
            { value: 25, label: '25 条每页' },
            { value: 100, label: '100 条每页' },
          ],
          onChange: onPageSizeChange,
        }}
      />
    </>
  )
})
