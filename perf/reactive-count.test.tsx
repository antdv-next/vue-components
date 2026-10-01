/**
 * Per-instance reactive-object budget for the headless @v-c components.
 *
 * Counts how many `computed` / `watch` / `watchEffect` calls and how many
 * component instances a single component instance costs at mount time, and
 * compares the numbers against `reactive-baseline.json`.
 *
 * - A number going DOWN is an improvement: update the baseline.
 * - A number going UP fails the test. If the increase is intentional
 *   (new feature that really needs more reactive state), update the baseline
 *   in the same PR so the change is reviewed on purpose.
 *
 * Update the baseline with:
 *   UPDATE_PERF_BASELINE=1 pnpm vitest run --project perf
 *
 * Counts are measured as `(N instances - 1 instance) / (N - 1)` so that the
 * one-time cost of the root component is excluded. The per-file breakdown
 * printed below each scenario is attributed from the call stack.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'

const tally = vi.hoisted(() => ({
  computed: new Map<string, number>(),
  watch: new Map<string, number>(),
  on: false,
}))

function attribute(map: Map<string, number>) {
  if (!tally.on)
    return
  const stack = new Error('attribution').stack || ''
  const line = stack
    .split('\n')
    .find(l => l.includes('/packages/') && !l.includes('/perf/') && !l.includes('/node_modules/'))
  const match = line?.match(/packages\/([^/]+)\/src\/([^:?]+)/)
  const key = match ? `${match[1]}/${match[2]}` : 'other'
  map.set(key, (map.get(key) || 0) + 1)
}

vi.mock('vue', async (importOriginal) => {
  const vue = await importOriginal<typeof import('vue')>()
  const wrap = <T extends (...args: any[]) => any>(fn: T, map: Map<string, number>): T =>
    ((...args: any[]) => {
      attribute(map)
      return fn(...args)
    }) as T
  return {
    ...vue,
    computed: wrap(vue.computed, tally.computed),
    watch: wrap(vue.watch, tally.watch),
    watchEffect: wrap(vue.watchEffect, tally.watch),
    watchPostEffect: wrap(vue.watchPostEffect, tally.watch),
    watchSyncEffect: wrap(vue.watchSyncEffect, tally.watch),
  }
})

// Imported after the mock so every module in the graph sees the wrapped `vue`.
const { default: Trigger } = await import('../packages/trigger/src')
const { default: Tooltip } = await import('../packages/tooltip/src')
const { default: Picker, RangePicker } = await import('../packages/picker/src')
const { default: dayjsGenerateConfig } = await import('../packages/picker/src/generate/dayjs')
const { default: enUS } = await import('../packages/picker/src/locale/en_US')
const { default: Select } = await import('../packages/select/src')
const { default: Menu } = await import('../packages/menu/src')
const { default: Table } = await import('../packages/table/src')
const { default: Tree } = await import('../packages/tree/src')

interface Metrics {
  computed: number
  watch: number
  instances: number
}

type Scenario = (n: number) => () => any

const placements = { top: { points: ['bc', 'tc'] } }
const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const columns = range(6).map(i => ({ title: `Col ${i}`, dataIndex: `c${i}`, key: `c${i}` }))

const scenarios: Record<string, Scenario> = {
  'trigger': n => () => range(n).map(i => h(Trigger, {
    key: i,
    popupPlacement: 'top',
    builtinPlacements: placements,
    popup: () => h('div', 'popup'),
  }, () => h('span', 'target'))),
  'tooltip': n => () => range(n).map(i => h(Tooltip, {
    key: i,
    overlay: () => 'tip',
    builtinPlacements: placements,
  }, () => h('span', 'target'))),
  'picker': n => () => range(n).map(i => h(Picker, {
    key: i,
    generateConfig: dayjsGenerateConfig,
    locale: enUS,
  })),
  'range-picker': n => () => range(n).map(i => h(RangePicker, {
    key: i,
    generateConfig: dayjsGenerateConfig,
    locale: enUS,
  })),
  'select': n => () => range(n).map(i => h(Select, {
    key: i,
    value: 'a',
    options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
  })),
  'menu-item': n => () => h(Menu, {
    mode: 'inline',
    items: range(n).map(i => ({ key: `item-${i}`, label: `Item ${i}` })),
  }),
  'table-row': n => () => h(Table, {
    columns,
    data: range(n).map((r) => {
      const row: Record<string, any> = { key: r }
      columns.forEach((col, c) => {
        row[col.dataIndex] = `r${r}c${c}`
      })
      return row
    }),
  }),
  'tree-node': n => () => h(Tree, {
    treeData: range(n).map(i => ({ key: `node-${i}`, title: `Node ${i}` })),
  }),
}

async function measure(render: () => any) {
  tally.computed.clear()
  tally.watch.clear()
  let instances = 0

  const el = document.createElement('div')
  document.body.appendChild(el)
  const app = createApp(defineComponent({ render }))
  app.mixin({
    beforeCreate() {
      instances += 1
    },
  })

  tally.on = true
  app.mount(el)
  await nextTick()
  tally.on = false

  const sum = (map: Map<string, number>) => [...map.values()].reduce((a, b) => a + b, 0)
  const result = {
    computed: sum(tally.computed),
    watch: sum(tally.watch),
    instances,
    byFile: new Map(tally.computed),
  }

  app.unmount()
  el.remove()
  return result
}

async function measurePerInstance(scenario: Scenario, n = 11) {
  const single = await measure(scenario(1))
  const many = await measure(scenario(n))
  const per = (key: keyof Metrics) => Number(((many[key] - single[key]) / (n - 1)).toFixed(1))
  const byFile = [...many.byFile.entries()]
    .map(([file, count]) => [file, Number((count / n).toFixed(1))] as const)
    .sort((a, b) => b[1] - a[1])
  return {
    metrics: { computed: per('computed'), watch: per('watch'), instances: per('instances') } as Metrics,
    byFile,
  }
}

const baselinePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'reactive-baseline.json')
const baseline: Record<string, Metrics> = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath, 'utf-8'))
  : {}
const shouldUpdate = !!process.env.UPDATE_PERF_BASELINE

describe('per-instance reactive object budget', () => {
  const measured: Record<string, Metrics> = {}
  const breakdown: Record<string, (readonly [string, number])[]> = {}

  for (const [name, scenario] of Object.entries(scenarios)) {
    it(name, async () => {
      const { metrics, byFile } = await measurePerInstance(scenario)
      measured[name] = metrics
      breakdown[name] = byFile

      const expected = baseline[name]
      if (shouldUpdate || !expected) {
        return
      }

      for (const key of Object.keys(metrics) as (keyof Metrics)[]) {
        expect(
          metrics[key],
          `${name}.${key} grew from ${expected[key]} to ${metrics[key]}; update reactive-baseline.json if intended`,
        ).toBeLessThanOrEqual(expected[key])
      }
    })
  }

  it('report', () => {
    const rows = Object.entries(measured).map(([name, m]) => {
      const b = baseline[name]
      const fmt = (key: keyof Metrics) => b ? `${m[key]} (base ${b[key]})` : `${m[key]}`
      return `| ${name} | ${fmt('computed')} | ${fmt('watch')} | ${fmt('instances')} |`
    })
    const files = Object.entries(breakdown).map(([name, list]) => [
      `  ${name}:`,
      ...list.slice(0, 6).map(([file, count]) => `    ${String(count).padStart(6)}  ${file}`),
    ].join('\n'))

    process.stdout.write([
      '',
      '| scenario | computed / instance | watch / instance | components / instance |',
      '|---|---:|---:|---:|',
      ...rows,
      '',
      'computed by source file (per instance):',
      ...files,
      '',
      '',
    ].join('\n'))

    if (shouldUpdate) {
      fs.writeFileSync(baselinePath, `${JSON.stringify(measured, null, 2)}\n`)
      process.stdout.write(`[perf] baseline written to ${baselinePath}\n`)
    }
  })
})
