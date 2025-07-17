import type { ComputedRef } from 'vue'
import type { Color } from '../color'
import type { ColorGenInput } from '../interface'
import useMergedState from '@v-c/util/dist/hooks/useMergedState.ts'
import { computed, ref } from 'vue'
import { generateColor } from '../util'

type ColorValue = ColorGenInput | undefined

function useColorState(defaultValue: ColorValue, value?: any): [ComputedRef<Color>, (value: any) => void] {
  const [mergedValue, setValue] = useMergedState(defaultValue, {
    value: ref(value?.value),
    defaultValue: ref(value?.defaultValue),
  })
  const color = computed(() => generateColor(mergedValue.value!))

  return [color, setValue]
}

export default useColorState
