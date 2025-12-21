import type { PaginationProps } from '@v-c/pagination'
import Pagination from '@v-c/pagination'
import { defineComponent } from 'vue'
import '../assets/index.less'

type ItemRender = PaginationProps['itemRender']

const itemRender: ItemRender = (current, type, element) => {
  if (type === 'page') {
    return <a href={`#${current}`}>{current}</a>
  }
  return element
}

const textItemRender: ItemRender = (_current, type, element) => {
  if (type === 'prev') {
    return 'Prev'
  }
  if (type === 'next') {
    return 'Next'
  }
  return element
}

const buttonItemRender: ItemRender = (_current, type, element) => {
  if (type === 'prev') {
    return <button type="button">Prev</button>
  }
  if (type === 'next') {
    return <button type="button">Next</button>
  }
  return element
}

const divItemRender: ItemRender = (_current, type, element) => {
  if (type === 'prev') {
    return <div>Prev</div>
  }
  if (type === 'next') {
    return <div>Next</div>
  }
  return element
}

export default defineComponent(() => {
  return () => (
    <>
      <Pagination total={100} itemRender={itemRender} />
      <Pagination total={100} itemRender={textItemRender} />
      <Pagination total={100} itemRender={buttonItemRender} />
      <Pagination total={100} itemRender={divItemRender} />
    </>
  )
})
