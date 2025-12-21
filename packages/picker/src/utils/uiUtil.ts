export function getRealPlacement(placement: string | undefined, rtl: boolean) {
  if (placement === undefined) {
    return rtl ? 'bottomRight' : 'bottomLeft'
  }
  return placement
}
