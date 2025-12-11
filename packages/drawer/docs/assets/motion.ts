import type { DrawerProps } from '../../src'
import './motion.less'

export const maskMotion: DrawerProps['maskMotion'] = {
  appear: true,
  name: 'mask-motion',
}

export const motion: DrawerProps['motion'] = (placement: string) => ({
  appear: true,
  name: `panel-motion-${placement}`,
})

const motionProps: Partial<DrawerProps> = {
  maskMotion,
  motion,
}

export default motionProps
