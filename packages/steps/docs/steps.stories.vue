<script setup lang="ts">
import AlternativeLabel from './alternativeLabel'
import Composable from './composable'
import CustomSvgIcon from './custom-svg-icon'
import CustomIcon from './customIcon'
import Dynamic from './dynamic'
import ErrorStep from './errorStep'
import Inline from './inline'
import NavBase from './nav-base'
import NextStep from './nextStep'
import ProgressDot from './progressDot'
import Simple from './simple'
import SmallSize from './smallSize'
import StepIcon from './stepIcon'
import Vertical from './vertical'
import VerticalSmall from './verticalSmall'

import '../assets/index.less'
import '../assets/custom-icon.less'
import '../assets/small.less'
import '../assets/vertical.less'
import '../assets/label-placement.less'
import '../assets/progress-dot.less'
import '../assets/nav.less'
import '../assets/inline.less'
import '../assets/iconfont.less'
</script>

<template>
  <Story title="Steps">
    <Variant title="alternativeLabel">
      <AlternativeLabel />
    </Variant>
    <Variant title="composable">
      <Composable />
    </Variant>
    <Variant title="custom-svg-icon">
      <CustomSvgIcon />
    </Variant>
    <Variant title="customIcon">
      <CustomIcon />
    </Variant>
    <Variant title="dynamic">
      <Dynamic />
    </Variant>
    <Variant title="errorStep">
      <ErrorStep />
    </Variant>
    <Variant title="inline">
      <Inline />
    </Variant>
    <Variant title="nav-base">
      <NavBase />
    </Variant>
    <Variant title="nextStep">
      <NextStep />
    </Variant>
    <Variant title="progressDot">
      <ProgressDot />
    </Variant>
    <Variant title="simple">
      <Simple />
    </Variant>
    <Variant title="smallSize">
      <SmallSize />
    </Variant>
    <Variant title="stepIcon">
      <StepIcon />
    </Variant>
    <Variant title="vertical">
      <Vertical />
    </Variant>
    <Variant title="verticalSmall">
      <VerticalSmall />
    </Variant>
  </Story>
</template>
