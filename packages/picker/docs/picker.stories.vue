<script setup lang="ts">
import Basic from './basic.vue'
import Calendar from './calendar.vue'
import CellRender from './cellRender.vue'
import Customize from './customize.vue'
import Debug from './debug.vue'
import DisabledDate from './disabledDate.vue'
import Focus from './focus.vue'
import Limitation from './limitation.vue'
import Locale from './locale.vue'
import Modes from './modes.vue'
import Multiple from './multiple.vue'
import Panel from './panel.vue'
import PanelRender from './panelRender.vue'
import Range from './range.vue'
import Rtl from './rtl.vue'
import SwitchType from './switchType.vue'
import Time from './time.vue'
import ValueFormat from './valueFormat.vue'
</script>

<template>
  <Story title="Picker">
    <Variant title="Basic">
      <Basic />
    </Variant>
    <Variant title="Calendar">
      <Calendar />
    </Variant>
    <Variant title="CellRender">
      <CellRender />
    </Variant>
    <Variant title="Range">
      <Range />
    </Variant>
    <Variant title="DisabledDate">
      <DisabledDate />
    </Variant>
    <Variant title="Focus">
      <Focus />
    </Variant>
    <Variant title="Locale">
      <Locale />
    </Variant>
    <Variant title="Modes">
      <Modes />
    </Variant>
    <Variant title="Multiple">
      <Multiple />
    </Variant>
    <Variant title="Panel">
      <Panel />
    </Variant>
    <Variant title="PanelRender">
      <PanelRender />
    </Variant>
    <Variant title="Customize">
      <Customize />
    </Variant>
    <Variant title="Debug">
      <Debug />
    </Variant>
    <Variant title="Limitation">
      <Limitation />
    </Variant>
    <Variant title="Rtl">
      <Rtl />
    </Variant>
    <Variant title="SwitchType">
      <SwitchType />
    </Variant>
    <Variant title="Time">
      <Time />
    </Variant>
    <Variant title="ValueFormat">
      <ValueFormat />
    </Variant>
    <!--    <Variant title="Uncontrolled"> -->
    <!--      <Uncontrolled /> -->
    <!--    </Variant> -->
  </Story>
</template>
