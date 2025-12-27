import { ref } from 'vue'

export type OnHover = (start: number, end: number) => void

export default function useHover(): [startRow: ReturnType<typeof ref>, endRow: ReturnType<typeof ref>, onHover: OnHover] {
  const startRow = ref(-1)
  const endRow = ref(-1)

  const onHover: OnHover = (start, end) => {
    startRow.value = start
    endRow.value = end
  }

  return [startRow, endRow, onHover]
}
