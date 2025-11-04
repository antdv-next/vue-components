<script setup>
import BodyOverflow from './body-overflow.tsx'
import Case from './case.vue'
import ClickNested from './clickNested.vue'
import Clip from './clip.vue'
import Container from './container.vue'
import Inside from './inside.vue'
import LargePopup from './largePopup.vue'
import Nested from './nested.vue'
import Point from './point.vue'
import Portal from './portal.vue'
import Shadow from './shadow.vue'
import Simple from './simple.vue'
import StaticScroll from './staticScroll.vue'
import VisibleFallback from './visibleFallback.vue'
</script>

<template>
  <Story title="Trigger">
    <Variant title="Body Overflow">
      <BodyOverflow />
    </Variant>
    <Variant title="Case">
      <Case />
    </Variant>
    <Variant title="Click Nested">
      <ClickNested />
    </Variant>
    <Variant title="Clip">
      <Clip />
    </Variant>
    <Variant title="Container">
      <Container />
    </Variant>
    <Variant title="Inside">
      <Inside />
    </Variant>
    <Variant title="Large Popup">
      <LargePopup />
    </Variant>
    <Variant title="Nested">
      <Nested />
    </Variant>
    <Variant title="Point">
      <Point />
    </Variant>
    <Variant title="Portal">
      <Portal />
    </Variant>
    <Variant title="Shadow">
      <Shadow />
    </Variant>
    <Variant title="Simple">
      <Simple />
    </Variant>
    <Variant title="Static Scroll">
      <StaticScroll />
    </Variant>
    <Variant title="Visible Fallback">
      <VisibleFallback />
    </Variant>
  </Story>
</template>
