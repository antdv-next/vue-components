import { defineComponent, reactive, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

function getSum(str: string) {
  let total = 0
  str.split('').forEach((c) => {
    const num = Number(c)
    if (!Number.isNaN(num)) {
      total += num
    }
  })
  return total
}

const CHINESE_NUMBERS = '零一二三四五六七八九'

function chineseParser(text: string) {
  const parsed = [...text]
    .map((cell) => {
      const index = CHINESE_NUMBERS.indexOf(cell)
      if (index !== -1) {
        return index
      }
      return cell
    })
    .join('')

  if (Number.isNaN(Number(parsed))) {
    return text
  }
  return parsed
}

function chineseFormatter(value: string) {
  return [...value]
    .map((cell) => {
      const index = Number(cell)
      if (!Number.isNaN(index)) {
        return CHINESE_NUMBERS[index]
      }
      return cell
    })
    .join('')
}

export default defineComponent(() => {
  const state = reactive({ value: 1000 })
  const valueRef = ref<number | string>(state.value)

  return () => (
    <div style={{ margin: '10px' }}>
      <InputNumber
        aria-label="Controlled number input demonstrating a custom currency format"
        defaultValue={1000}
        formatter={val => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        onChange={console.log}
      />
      <InputNumber
        aria-label="Controlled number input demonstrating a custom percentage format"
        defaultValue={100}
        formatter={val => `${val}%`}
        parser={val => val.replace('%', '')}
        onChange={console.log}
      />
      <InputNumber
        aria-label="Controlled number input demonstrating a custom format to add commas"
        style={{ width: '100px' }}
        formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        onChange={console.log}
      />

      <div>
        <h1>In Control</h1>
        <InputNumber
          aria-label="Controlled number input demonstrating a custom format"
          value={valueRef.value}
          onChange={(val) => {
            valueRef.value = val as any
          }}
          formatter={(val, { userTyping, input }) => {
            if (userTyping) {
              return input
            }
            return `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }}
        />

        <InputNumber<string | number>
          aria-label="Controlled number input demonstrating a custom format"
          value={valueRef.value}
          onChange={(val) => {
            console.log(val)
            valueRef.value = val as any
          }}
          parser={chineseParser}
          formatter={chineseFormatter}
        />
      </div>

      <div>
        <h1>Strange Format</h1>
        <InputNumber
          aria-label="Number input example demonstrating a strange custom format"
          defaultValue={1000}
          formatter={val => `$ ${val} - ${getSum(String(val))}`}
          parser={val => (val.match(/^\$ ([\d.]*) .*$/) || [])[1]}
          onChange={console.log}
        />
      </div>
    </div>
  )
})
