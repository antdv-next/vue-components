import type { ComputedRef } from 'vue'
import type { Color } from '../color'
import type { ColorGenInput } from '../interface'
// import useMergedState from '@v-c/util/dist/hooks/useMergedState.ts'
import { computed, ref } from 'vue'
import { generateColor } from '../util'

type ColorValue = ColorGenInput | undefined

function useColorState(defaultValue: ColorValue, value?: ColorValue): [ComputedRef<Color>, (value: any) => void] {
  // const [mergedValue, setValue] = useMergedState(defaultValue, { value: computed(() => value) })
  const mergedValue = ref(value ?? defaultValue)
  const color = computed(() => generateColor(mergedValue.value!))
  const setValue = (newValue: ColorValue) => {
    mergedValue.value = newValue
  }
  return [color, setValue]
}

export default useColorState
