export function getMotion(
  mode: string,
  motion?: object,
  defaultMotions?: Record<string, any>,
) {
  if (motion) {
    return motion
  }

  if (defaultMotions) {
    return defaultMotions[mode] || defaultMotions.other
  }

  return undefined
}
