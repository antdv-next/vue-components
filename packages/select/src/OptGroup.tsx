import type { FunctionalComponent } from 'vue'
import type { DefaultOptionType } from './Select.tsx'

export interface OptGroupProps extends Omit<DefaultOptionType, 'options'> {

}

const OptGroup: FunctionalComponent<OptGroupProps> = () => null

;(OptGroup as any).isSelectOptGroup = true

export default OptGroup
