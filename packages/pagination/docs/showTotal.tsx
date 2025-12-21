import Pagination from '@v-c/pagination'
import { defineComponent } from 'vue'
import '../assets/index.less'

const showTotal1 = (total: number) => `Total ${total} items`
const showTotal2 = (total: number, range: number[]) => `${range[0]} - ${range[1]} of ${total} items`
const showTotal3 = (total: number, range: number[]) => `${range[0]} - ${range[1]} of ${total} items`

export default defineComponent(() => {
  return () => (
    <>
      <Pagination showTotal={showTotal1} total={455} />
      <br />
      <Pagination showTotal={showTotal2} total={455} />
      <br />
      <Pagination showTotal={showTotal3} total={0} />
    </>
  )
})
