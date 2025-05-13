import { num2str, trimNumber } from '@v-c/mini-decimal'

export function getDecupleSteps(step: string | number) {
  const stepStr = typeof step === 'number' ? num2str(step) : trimNumber(step).fullStr
  const hasPoint = stepStr.includes('.')
  if (!hasPoint) {
    return `${step}0`
  }
  return trimNumber(stepStr.replace(/(\d)\.(\d)/g, '$1$2.')).fullStr
}
