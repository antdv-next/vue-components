<script setup>
import BodyOverflow from './body-overflow.tsx'
import Case from './case.tsx'
import ClickNested from './click-nested.tsx'
import Clip from './clip.tsx'
import Container from './container.tsx'
import Inside from './inside.tsx'
import LargePopup from './large-popup.tsx'
import Mobile from './mobile.tsx'
import Nested from './nested.tsx'
import Point from './point.tsx'
import Portal from './portal.tsx'
import ShadowChild from './shadow-child.tsx'
import Shadow from './shadow.tsx'
import Simple from './simple.tsx'
import StaticScroll from './static-scroll.tsx'
import TwoButtons from './two-buttons.tsx'
import VisibleFallback from './visible-fallback.tsx'
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
    <Variant title="Mobile">
      <Mobile />
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
    <Variant title="Shadow Child">
      <ShadowChild />
    </Variant>
    <Variant title="Simple">
      <Simple />
    </Variant>
    <Variant title="Static Scroll">
      <StaticScroll />
    </Variant>
    <Variant title="Two Buttons Unique">
      <TwoButtons />
    </Variant>
    <Variant title="Visible Fallback">
      <VisibleFallback />
    </Variant>
  </Story>
</template>
