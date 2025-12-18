<script setup lang="ts">
import Basic from './basic'
import BigData from './big-data'
import Controlled from './controlled'
import CustomIcons from './custom-icons'
import Debug from './debug'
import Disable from './disable'
import Dynamic from './dynamic'
import FieldNames from './fieldNames'
import Filter from './filter'
import Form from './form'
import MultipleWithMaxCount from './mutiple-with-maxCount'
import TreeNodeLabelProp from './treeNodeLabelProp'
import Width from './width'
</script>

<template>
  <Story title="TreeSelect">
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="controlled">
      <Controlled />
    </Variant>
    <Variant title="dynamic">
      <Dynamic />
    </Variant>
    <Variant title="filter">
      <Filter />
    </Variant>
    <Variant title="disable">
      <Disable />
    </Variant>
    <Variant title="custom-icons">
      <CustomIcons />
    </Variant>
    <Variant title="big-data">
      <BigData />
    </Variant>
    <Variant title="fieldNames">
      <FieldNames />
    </Variant>
    <Variant title="treeNodeLabelProp">
      <TreeNodeLabelProp />
    </Variant>
    <Variant title="width">
      <Width />
    </Variant>
    <Variant title="mutiple-with-maxCount">
      <MultipleWithMaxCount />
    </Variant>
    <Variant title="debug">
      <Debug />
    </Variant>
    <Variant title="form">
      <Form />
    </Variant>
  </Story>
</template>

