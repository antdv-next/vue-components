import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, getCurrentInstance, nextTick, ref } from 'vue'
import Tabs from '../src'

// On unmount, scope.stop() runs watcher cleanups inside the parent's render
// effect without pausing tracking: reactive reads there subscribe the parent,
// and reading then writing a ref re-renders it within the same flush.
async function mountAndUnmount(render: () => any, afterMount?: () => Promise<void>) {
  const show = ref(true)
  let parent: any
  let renders = 0
  const wrapper = mount(defineComponent({
    setup() {
      parent = getCurrentInstance()
      return () => {
        renders++
        return <div>{show.value ? render() : null}</div>
      }
    },
  }), { attachTo: document.body })
  await nextTick()
  await nextTick()
  await afterMount?.()
  const rendersBefore = renders
  show.value = false
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 20))
  const deps: unknown[] = []
  for (let link = parent.effect.deps; link; link = link.nextDep) {
    if (link.dep !== (show as any).dep)
      deps.push(link.dep)
  }
  const result = { deps, renders: renders - rendersBefore }
  wrapper.unmount()
  return result
}

describe('tabs unmount cleanup', () => {
  it('does not subscribe or re-render the parent', async () => {
    expect(await mountAndUnmount(() => (
      <Tabs items={[{ key: '1', label: 'Tab 1', children: 'Content 1' }, { key: '2', label: 'Tab 2', children: 'Content 2' }]} />
    ))).toEqual({ deps: [], renders: 1 })
  })
})
