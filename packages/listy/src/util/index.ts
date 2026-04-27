import type { ListyScrollToConfig, ScrollAlign } from '../interface';

export function isGroupScrollConfig(
  config: ListyScrollToConfig,
): config is { groupKey: string; align?: ScrollAlign; offset?: number } {
  return !!config && typeof config === 'object' && 'groupKey' in config;
}
