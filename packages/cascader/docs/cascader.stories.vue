<script setup lang="ts">
import AdjustOverflow from './adjust-overflow'
import Animation from './animation'
import ChangeOnSelect from './change-on-select'
import CustomArrowIcon from './custom-arrow-icon'
import CustomFieldName from './custom-field-name'
import Debug from './debug'
import DefaultExpandSingleOption from './default-expand-single-option'
import DefaultValue from './defaultValue'
import Disabled from './disabled'
import DynamicOptions from './dynamic-options'
import Hover from './hover'
import Multiple from './multiple'
import MultipleSearch from './multiple-search'
import OptionRender from './option-render'
import Panel from './panel'
import PopupRender from './popup-render'
import RcForm from './rc-form'
import Search from './search'
import Simple from './simple'
import TextTrigger from './text-trigger'
import Value from './value'
import Visible from './visible'
</script>

<template>
  <Story title="Cascader">
    <Variant title="simple">
      <Simple />
    </Variant>
    <Variant title="adjust-overflow">
      <AdjustOverflow />
    </Variant>
    <Variant title="animation">
      <Animation />
    </Variant>
    <Variant title="change-on-select">
      <ChangeOnSelect />
    </Variant>
    <Variant title="custom-arrow-icon">
      <CustomArrowIcon />
    </Variant>
    <Variant title="custom-field-name">
      <CustomFieldName />
    </Variant>
    <Variant title="debug">
      <Debug />
    </Variant>
    <Variant title="default-expand-single-option">
      <DefaultExpandSingleOption />
    </Variant>
    <Variant title="defaultValue">
      <DefaultValue />
    </Variant>
    <Variant title="disabled">
      <Disabled />
    </Variant>
    <Variant title="dynamic-options">
      <DynamicOptions />
    </Variant>
    <Variant title="hover">
      <Hover />
    </Variant>
    <Variant title="multiple">
      <Multiple />
    </Variant>
    <Variant title="multiple-search">
      <MultipleSearch />
    </Variant>
    <Variant title="option-render">
      <OptionRender />
    </Variant>
    <Variant title="panel">
      <Panel />
    </Variant>
    <Variant title="popup-render">
      <PopupRender />
    </Variant>
    <Variant title="rc-form">
      <RcForm />
    </Variant>
    <Variant title="search">
      <Search />
    </Variant>
    <Variant title="text-trigger">
      <TextTrigger />
    </Variant>
    <Variant title="value">
      <Value />
    </Variant>
    <Variant title="visible">
      <Visible />
    </Variant>
  </Story>
</template>
