export function nextSlice(callback: () => void) {
  Promise.resolve().then(callback)
}
