<script setup lang="ts">
import Combobox from './combobox.tsx'
import Controlled from './controlled.tsx'
import CustomIcon from './custom-icon.tsx'
import CustomLabel from './custom-label.tsx'
import CustomTags from './custom-tags.tsx'
import DropdownRender from './dropdownRender.tsx'
import Email from './email.tsx'
import FilterSort from './filterSort.tsx'
import Focus from './focus.tsx'
import Loading from './loading.tsx'
import MultipleReadonly from './multiple-readonly.tsx'
import MaxCount from './multiple-with-maxCount.tsx'
import Multiple from './multiple.tsx'
import OptGroup from './optgroup.tsx'
import OptionRender from './option-render.tsx'
import ScrollLoading from './scroll-loading.tsx'
import Single from './single.tsx'
import FieldNames from './singleFieldNames.tsx'
import Suggest from './suggest.tsx'
import Tags from './tags.tsx'
</script>

<template>
  <Story title="Select">
    <Variant title="Single">
      <Single />
    </Variant>
    <Variant title="Multiple">
      <Multiple />
    </Variant>
    <Variant title="Tags">
      <Tags />
    </Variant>
    <Variant title="Combobox">
      <Combobox />
    </Variant>
    <Variant title="OptGroup">
      <OptGroup />
    </Variant>
    <Variant title="Controlled">
      <Controlled />
    </Variant>
    <Variant title="Loading">
      <Loading />
    </Variant>
    <Variant title="Focus">
      <Focus />
    </Variant>
    <Variant title="FilterSort">
      <FilterSort />
    </Variant>
    <Variant title="CustomIcon">
      <CustomIcon />
    </Variant>
    <Variant title="DropdownRender">
      <DropdownRender />
    </Variant>
    <Variant title="OptionRender">
      <OptionRender />
    </Variant>
    <Variant title="MaxCount">
      <MaxCount />
    </Variant>
    <Variant title="Email">
      <Email />
    </Variant>
    <Variant title="Suggest">
      <Suggest />
    </Variant>
    <Variant title="ScrollLoading">
      <ScrollLoading />
    </Variant>
    <Variant title="CustomLabel">
      <CustomLabel />
    </Variant>
    <Variant title="CustomTags">
      <CustomTags />
    </Variant>
    <Variant title="MultipleReadonly">
      <MultipleReadonly />
    </Variant>
    <Variant title="FieldNames">
      <FieldNames />
    </Variant>
  </Story>
</template>
