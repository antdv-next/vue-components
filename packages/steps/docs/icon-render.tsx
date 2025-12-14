import type { VNodeChild } from 'vue'

type Status = 'error' | 'process' | 'finish' | 'wait'

export interface StepsIcons {
  finish?: VNodeChild
  error?: VNodeChild
}

export type DemoStepIcon = (info: { status: Status, node: VNodeChild }) => VNodeChild

const prefixCls = 'vc-steps'
const iconCls = `${prefixCls}-icon`

function renderIconFont(type: string) {
  return <i class={`${iconCls} rcicon rcicon-${type}`} />
}

function renderNumber(index: number) {
  return <span class={iconCls}>{index + 1}</span>
}

function renderDot() {
  return (
    <span class={iconCls}>
      <span class={`${iconCls}-dot`} />
    </span>
  )
}

function renderStatusIcon(status: Status, icons?: StepsIcons) {
  if (status === 'finish') {
    return icons?.finish ? <span class={iconCls}>{icons.finish}</span> : renderIconFont('check')
  }
  if (status === 'error') {
    return icons?.error ? <span class={iconCls}>{icons.error}</span> : renderIconFont('cross')
  }
  return null
}

function renderCustomIcon(icon: unknown) {
  if (!icon) {
    return null
  }
  if (typeof icon === 'string') {
    return renderIconFont(icon)
  }
  return <span class={iconCls}>{icon as any}</span>
}

export function createIconRender(options?: {
  progressDot?: boolean
  icons?: StepsIcons
  stepIcon?: DemoStepIcon
}) {
  const { progressDot, icons, stepIcon } = options ?? {}

  return (_originNode: any, info: any) => {
    const { item, index, components } = info ?? {}
    const Icon = components?.Icon

    const status: Status = item?.status ?? 'wait'

    let node: VNodeChild
      = renderCustomIcon(item?.icon)
        ?? (progressDot ? renderDot() : renderStatusIcon(status, icons))
        ?? renderNumber(index ?? 0)

    if (stepIcon) {
      node = stepIcon({ status, node })
    }

    return Icon ? <Icon>{node}</Icon> : node
  }
}
