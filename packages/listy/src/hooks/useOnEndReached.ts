import { ref } from 'vue'

interface UseOnEndReachedParams {
  enabled: boolean;
  onEndReached?: () => void;
}

export default function useOnEndReached(params: UseOnEndReachedParams) {
  const { enabled, onEndReached } = params;

  const lastTriggeredScrollHeightRef = ref<number | null>(null);

  const onScroll = (e: Event) => {
    if (!enabled) {
      lastTriggeredScrollHeightRef.value = null;
      return;
    }

    const target = e.target;

    const { scrollTop, clientHeight, scrollHeight } = target;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceToBottom <= 0) {
      if (lastTriggeredScrollHeightRef.value !== scrollHeight) {
        onEndReached?.();
        lastTriggeredScrollHeightRef.value = scrollHeight;
      }
    }
  }

  return onScroll;
}
