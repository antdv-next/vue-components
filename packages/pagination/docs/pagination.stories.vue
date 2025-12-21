<script setup lang="ts">
import AlignDemo from './align.tsx'
import BasicDemo from './basic.tsx'
import ControlledDemo from './controlled.tsx'
import ItemRenderDemo from './itemRender.tsx'
import JumperDemo from './jumper.tsx'
import JumperWithGoButtonDemo from './jumperWithGoButton.tsx'
import LessPagesDemo from './lessPages.tsx'
import LocaleDemo from './locale.tsx'
import MoreDemo from './more.tsx'
import ShowSizeChangerDemo from './showSizeChanger.tsx'
import ShowTitleDemo from './showTitle.tsx'
import ShowTotalDemo from './showTotal.tsx'
import SimpleDemo from './simple.tsx'
import SizerDemo from './sizer.tsx'
import StylesDemo from './styles.tsx'
</script>

<template>
  <Story title="Pagination">
    <Variant title="align">
      <AlignDemo />
    </Variant>

    <Variant title="basic">
      <BasicDemo />
    </Variant>

    <Variant title="controlled">
      <ControlledDemo />
    </Variant>

    <Variant title="itemRender">
      <ItemRenderDemo />
    </Variant>

    <Variant title="jumper">
      <JumperDemo />
    </Variant>

    <Variant title="jumperWithGoButton">
      <JumperWithGoButtonDemo />
    </Variant>

    <Variant title="lessPages">
      <LessPagesDemo />
    </Variant>

    <Variant title="locale">
      <LocaleDemo />
    </Variant>

    <Variant title="more">
      <MoreDemo />
    </Variant>

    <Variant title="showSizeChanger">
      <ShowSizeChangerDemo />
    </Variant>

    <Variant title="showTitle">
      <ShowTitleDemo />
    </Variant>

    <Variant title="showTotal">
      <ShowTotalDemo />
    </Variant>

    <Variant title="simple">
      <SimpleDemo />
    </Variant>

    <Variant title="sizer">
      <SizerDemo />
    </Variant>

    <Variant title="styles">
      <StylesDemo />
    </Variant>
  </Story>
</template>
