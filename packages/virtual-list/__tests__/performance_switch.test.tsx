import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import VirtualList from '../src/List';
import { defineComponent, ref } from 'vue';

describe('VirtualList Performance Switch', () => {
  it('should switch from 100k to 50k items without freezing', async () => {
    // Large dataset 1
    const data100k = Array.from({ length: 100000 }).map((_, i) => ({ id: i }));
    // Large dataset 2
    const data50k = Array.from({ length: 50000 }).map((_, i) => ({ id: i }));

    const wrapper = mount(VirtualList, {
      props: {
        data: data100k,
        height: 200,
        itemHeight: 20,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }) => <div>{item.id}</div>,
      },
    });
    
    expect(wrapper.vm.scrollTo).toBeDefined();

    // Trigger switch
    const startTime = Date.now();
    await wrapper.setProps({ data: data50k });
    const duration = Date.now() - startTime;
    
    // If O(N*M) exists, 100k * 50k = 5 * 10^9 operations.
    // In JS, 10^8 ops takes ~100ms. 5 * 10^9 takes ~5000ms (5 seconds).
    // So if it takes > 1000ms, it's definitely frozen.
    
    console.log(`Switch duration (100k -> 50k): ${duration}ms`);
    expect(duration).toBeLessThan(1000); 

    // Trigger switch back (50k -> 100k, WORST CASE for naive diff)
    const startTime2 = Date.now();
    await wrapper.setProps({ data: data100k });
    const duration2 = Date.now() - startTime2;
    console.log(`Switch duration (50k -> 100k): ${duration2}ms`);
    expect(duration2).toBeLessThan(1000);

    expect(wrapper.html()).toBeTruthy();
  });
});
