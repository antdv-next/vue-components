export interface Gap {
  offset?: number | [number, number]
  radius?: number
}

export interface PosInfo {
  left: number
  top: number
  height: number
  width: number
  radius: number
}
function isValidNumber(val: unknown): boolean {
  return typeof val === 'number' && !Number.isNaN(val)
}

export default function useTarget() {
  return {}
}
