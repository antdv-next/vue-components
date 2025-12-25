import { defineComponent } from 'vue'
import Table from '../src'

const data = Array.from({ length: 100 }, (_, i) => ({
  key: i,
  a: `a${i}`,
  b: `b${i}`,
  c: `c${i}`,
}))

const HeaderTable = defineComponent({
  name: 'HeaderTable',
  setup(_props, { attrs, slots }) {
    return () => (
      <>
        <div style={{ background: '#fff' }}>header table</div>
        {(() => {
          const { class: className, style, ...restAttrs } = attrs as any
          return (
            <table class={className} style={style} {...restAttrs}>
              {slots.default?.()}
            </table>
          )
        })()}
      </>
    )
  },
})

export default defineComponent(() => {
  return () => (
    <div>
      <Table
        classNames={{
          body: {
            wrapper: 'test-body-wrapper',
            cell: 'test-body-cell',
            row: 'test-body-row',
          },
          header: {
            wrapper: 'test-header-wrapper',
            cell: 'test-header-cell',
            row: 'test-header-row',
          },
        }}
        components={{ header: { table: HeaderTable } }}
        sticky
        columns={[
          { title: 'title1', dataIndex: 'a', key: 'a', width: 100 },
          { title: 'title2', dataIndex: 'b', key: 'b', width: 100 },
          { title: 'title3', dataIndex: 'c', key: 'c', width: 200 },
        ]}
        data={data}
      />
    </div>
  )
})
