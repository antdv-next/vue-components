import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, getCurrentInstance, nextTick, ref } from 'vue'
import Menu from '../src'

// On unmount, scope.stop() runs watcher cleanups inside the parent's render
// effect without pausing tracking. Reactive state read there subscribes the
// parent to the unmounted menu (a computed keeps it alive until the parent
// re-renders), and a write there re-triggers the parent within the same flush.
function getDeps(instance: any) {
  const deps: unknown[] = []
  for (let link = instance.effect.deps; link; link = link.nextDep)
    deps.push(link.dep)
  return deps
}

describe('menu unmount cleanup', () => {
  it('does not subscribe or re-render the parent when the menu unmounts', async () => {
    const show = ref(true)
    let parent: any
    let renders = 0
    const wrapper = mount(defineComponent({
      setup() {
        parent = getCurrentInstance()
        return () => {
          renders++
          return (
            <div>
              {show.value
                ? (
                    <Menu
                      mode="inline"
                      defaultOpenKeys={['sub']}
                      items={[
                        { key: 'a', label: 'A' },
                        { key: 'sub', label: 'Sub', children: [{ key: 'b', label: 'B' }] },
                      ]}
                    />
                  )
                : null}
            </div>
          )
        }
      },
    }))
    await nextTick()
    await nextTick()
    const rendersBefore = renders

    show.value = false
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // Only the render that removed the menu, depending on `show` alone.
    expect(renders - rendersBefore).toBe(1)
    expect(getDeps(parent)).toHaveLength(1)
    wrapper.unmount()
  })
})
