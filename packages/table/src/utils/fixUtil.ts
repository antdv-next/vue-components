import type { Direction, FixedType, StickyOffsets } from '../interface';

export interface FixedInfo {
  fixLeft: number | false;
  fixRight: number | false;
  lastFixLeft: boolean;
  firstFixRight: boolean;

  // For Rtl Direction
  lastFixRight: boolean;
  firstFixLeft: boolean;

  isSticky: boolean;
}

function normalizeFixed(fixed: FixedType | undefined, direction: Direction) {
  if (fixed === true || fixed === 'start' || fixed === 'left') {
    return direction === 'rtl' ? 'right' : 'left';
  }
  if (fixed === 'end' || fixed === 'right') {
    return direction === 'rtl' ? 'left' : 'right';
  }
  return undefined;
}

export function getCellFixedInfo(
  colStart: number,
  colEnd: number,
  columns: readonly { fixed?: FixedType }[],
  stickyOffsets: StickyOffsets,
  direction: 'ltr' | 'rtl',
): FixedInfo {
  const startColumn = columns[colStart] || {};
  const endColumn = columns[colEnd] || {};
  const startFixed = normalizeFixed(startColumn.fixed, direction);
  const endFixed = normalizeFixed(endColumn.fixed, direction);

  let fixLeft: number | false = false;
  let fixRight: number | false = false;

  if (startFixed === 'left') {
    const leftOffsets = stickyOffsets.left || stickyOffsets.start;
    fixLeft = leftOffsets[colStart];
  } else if (endFixed === 'right') {
    const rightOffsets = stickyOffsets.right || stickyOffsets.end;
    fixRight = rightOffsets[colEnd];
  }

  let lastFixLeft = false;
  let firstFixRight = false;

  let lastFixRight = false;
  let firstFixLeft = false;

  const nextColumn = columns[colEnd + 1];
  const prevColumn = columns[colStart - 1];
  const nextFixed = normalizeFixed(nextColumn?.fixed, direction);
  const prevFixed = normalizeFixed(prevColumn?.fixed, direction);

  if (direction === 'rtl') {
    if (fixLeft !== undefined) {
      const prevFixLeft = prevFixed === 'left';
      firstFixLeft = !prevFixLeft;
    } else if (fixRight !== undefined) {
      const nextFixRight = nextFixed === 'right';
      lastFixRight = !nextFixRight;
    }
  } else if (fixLeft !== undefined) {
    const nextFixLeft = nextFixed === 'left';
    lastFixLeft = !nextFixLeft;
  } else if (fixRight !== undefined) {
    const prevFixRight = prevFixed === 'right';
    firstFixRight = !prevFixRight;
  }

  return {
    fixLeft,
    fixRight,
    lastFixLeft,
    firstFixRight,
    lastFixRight,
    firstFixLeft,
    isSticky: !!stickyOffsets.isSticky,
  };
}
