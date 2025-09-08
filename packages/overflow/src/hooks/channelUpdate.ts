import raf from '@v-c/util/dist/raf'

export default function channelUpdate(callback: VoidFunction) {
  if (typeof MessageChannel === 'undefined') {
    raf(callback)
  }
  else {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => callback()
    channel.port2.postMessage(undefined)
  }
}
