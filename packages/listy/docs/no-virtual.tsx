import type { CSSProperties } from 'vue'
import type { ListyRef } from '../src'
import { defineComponent, ref } from 'vue'
import Listy from '../src'

const GROUP_META = {
  fruits: {
    title: 'Fruits',
    description: 'Tropical & Seasonal',
    accent: '#f6ffed',
  },
  vegetables: {
    title: 'Vegetables',
    description: 'Leafy & Root',
    accent: '#fff7e6',
  },
  desserts: {
    title: 'Desserts',
    description: 'Sweet & Baked',
    accent: '#f0f5ff',
  },
} as const;

type GroupId = keyof typeof GROUP_META;

interface ProduceItem {
  id: string;
  name: string;
  groupId: GroupId;
}

const items: ProduceItem[] = [
  { id: 'fruits-1', name: 'Mango', groupId: 'fruits' },
  { id: 'fruits-2', name: 'Pineapple', groupId: 'fruits' },
  { id: 'fruits-3', name: 'Banana', groupId: 'fruits' },
  { id: 'fruits-4', name: 'Grapes', groupId: 'fruits' },
  { id: 'fruits-5', name: 'Peach', groupId: 'fruits' },
  { id: 'fruits-6', name: 'Dragon Fruit', groupId: 'fruits' },
  { id: 'fruits-7', name: 'Papaya', groupId: 'fruits' },
  { id: 'fruits-8', name: 'Lychee', groupId: 'fruits' },
  { id: 'vegetables-1', name: 'Spinach', groupId: 'vegetables' },
  { id: 'vegetables-2', name: 'Bok Choy', groupId: 'vegetables' },
  { id: 'vegetables-3', name: 'Carrot', groupId: 'vegetables' },
  { id: 'vegetables-4', name: 'Kale', groupId: 'vegetables' },
  { id: 'vegetables-5', name: 'Sweet Potato', groupId: 'vegetables' },
  { id: 'vegetables-6', name: 'Beetroot', groupId: 'vegetables' },
  { id: 'vegetables-7', name: 'Asparagus', groupId: 'vegetables' },
  { id: 'vegetables-8', name: 'Broccoli', groupId: 'vegetables' },
  { id: 'vegetables-9', name: 'Okra', groupId: 'vegetables' },
  { id: 'desserts-1', name: 'Cheesecake', groupId: 'desserts' },
  { id: 'desserts-2', name: 'Chocolate Tart', groupId: 'desserts' },
  { id: 'desserts-3', name: 'Panna Cotta', groupId: 'desserts' },
  { id: 'desserts-4', name: 'Macaron', groupId: 'desserts' },
  { id: 'desserts-5', name: 'Brownie', groupId: 'desserts' },
  { id: 'desserts-6', name: 'Tiramisu', groupId: 'desserts' },
  { id: 'desserts-7', name: 'Apple Pie', groupId: 'desserts' },
  { id: 'desserts-8', name: 'Lemon Tart', groupId: 'desserts' },
  { id: 'desserts-9', name: 'Mousse', groupId: 'desserts' },
  { id: 'desserts-10', name: 'Creme Brulee', groupId: 'desserts' },
  { id: 'desserts-11', name: 'Eclair', groupId: 'desserts' },
  { id: 'desserts-12', name: 'Pavlova', groupId: 'desserts' },
  { id: 'desserts-13', name: 'Baklava', groupId: 'desserts' },
  { id: 'desserts-14', name: 'Donut', groupId: 'desserts' },
  { id: 'desserts-15', name: 'Cupcake', groupId: 'desserts' },
  { id: 'desserts-16', name: 'Souffle', groupId: 'desserts' },
];

const GROUP_IDS = Object.keys(GROUP_META) as GroupId[]

export default defineComponent(() => {
  const listRef = ref<ListyRef | null>(null);

  const itemStyle: CSSProperties = {
      padding: '0 16px',
      height: 40,
      lineHeight: '40px',
      borderBottom: '1px solid #f0f0f0',
      background: '#fff',
    }

  const getGroupMeta = (groupId: GroupId) => GROUP_META[groupId]

  const handleScrollToGroup = (groupId: GroupId) => {
      listRef.value?.scrollTo({ groupKey: groupId, align: 'top' });
    }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Listy
        ref={listRef}
        height={420}
        itemHeight={40}
        items={items}
        virtual={false}
        sticky
        rowKey="id"
        itemRender={(item, index) => {
          const baseHeight = 40;
          const height = baseHeight + (index % 2 === 0 ? 0 : 10);
          return (
            <div
              style={{
                ...itemStyle,
                height: `${height}px`,
                lineHeight: `${height}px`,
              }}
            >
              {item.name}
            </div>
          );
        }}
        group={{
          key: (item) => item.groupId,
          title: (groupKey, groupItems) => {
            const metadata = getGroupMeta(groupKey);
            const accent = metadata?.accent ?? '#fafafa';
            return (
              <div
                style={{
                  padding: '12px 16px',
                  background: accent,
                  borderBottom: '1px solid #eaeaea',
                  boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: '600px' }}>
                  {metadata?.title ?? groupKey}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {metadata?.description ?? 'Group items'}
                </div>
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#888' }}>
                  {groupItems.length} items
                </div>
              </div>
            );
          },
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {GROUP_IDS.map((groupId) => {
          const meta = GROUP_META[groupId];
          return (
            <button key={groupId} onClick={() => handleScrollToGroup(groupId)}>
              Scroll to {meta.title}
            </button>
          );
        })}
        <span>Total Items: {items.length}</span>
      </div>
    </div>
  )
})
