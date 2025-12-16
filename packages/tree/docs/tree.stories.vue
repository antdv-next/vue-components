<script setup lang="ts">
import Basic from './basic'
import BigData from './bigData'
import Contextmenu from './contextmenu'
import Controlled from './controlled'
import CustomSwitcherIcon from './customSwitcherIcon'
import Draggable from './draggable'
import DraggableAllowDrop from './draggableAllowDrop'
import Dropdown from './dropdown'
import Dynamic from './dynamic'
import ExpandAction from './expandAction'
import FieldNames from './fieldNames'
import Icon from './icon'
import Selectable from './selectable'
import './assets/index.less'
</script>

<template>
  <Story title="Tree">
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="controlled">
      <Controlled />
    </Variant>
    <Variant title="fieldNames">
      <FieldNames />
    </Variant>
    <Variant title="dynamic">
      <Dynamic />
    </Variant>
    <Variant title="draggable">
      <Draggable />
    </Variant>
    <Variant title="draggableAllowDrop">
      <DraggableAllowDrop />
    </Variant>
    <Variant title="expandAction">
      <ExpandAction />
    </Variant>
    <Variant title="selectable">
      <Selectable />
    </Variant>
    <Variant title="icon">
      <Icon />
    </Variant>
    <Variant title="customSwitcherIcon">
      <CustomSwitcherIcon />
    </Variant>
    <Variant title="dropdown">
      <Dropdown />
    </Variant>
    <Variant title="contextmenu">
      <Contextmenu />
    </Variant>
    <Variant title="bigData">
      <BigData />
    </Variant>
  </Story>
</template>
