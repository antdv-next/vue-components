<script setup lang="ts">
import AdaptiveHeight from './AdaptiveHeight'
import AppendDots from './AppendDots'
import AsNavFor from './AsNavFor'
import AutoPlay from './AutoPlay'
import AutoPlayMethods from './AutoPlayMethods'
import CenterMode from './CenterMode'
import CustomArrows from './CustomArrows'
import CustomPaging from './CustomPaging'
import CustomSlides from './CustomSlides'
import DynamicSlides from './DynamicSlides'
import Fade from './Fade'
import FocusOnSelect from './FocusOnSelect'
import LazyLoad from './LazyLoad'
import MultipleItems from './MultipleItems'
import MultipleRows from './MultipleRows'
import PauseOnHover from './PauseOnHover'
import PreviousNextMethods from './PreviousNextMethods'
import Resizable from './Resizable'
import Responsive from './Responsive'
import Rtl from './Rtl'
import SimpleSlider from './SimpleSlider'
import SlickGoTo from './SlickGoTo'
import SlideChangeHooks from './SlideChangeHooks'
import SwipeToSlide from './SwipeToSlide'
import UnevenSetsFinite from './UnevenSetsFinite'
import UnevenSetsInfinite from './UnevenSetsInfinite'
import VariableWidth from './VariableWidth'
import VerticalMode from './VerticalMode'
import VerticalModeWhenUnslick from './VerticalModeWhenUnslick'
import VerticalSwipeToSlide from './VerticalSwipeToSlide'

import './assets/slick.css'
import './assets/slick-theme.css'
import './assets/docs.css'
</script>

<template>
  <Story title="Slick">
    <Variant title="Simple">
      <SimpleSlider />
    </Variant>
    <Variant title="AdaptiveHeight">
      <AdaptiveHeight />
    </Variant>
    <Variant title="AppendDots">
      <AppendDots />
    </Variant>
    <Variant title="AsNavFor">
      <AsNavFor />
    </Variant>
    <Variant title="AutoPlay">
      <AutoPlay />
    </Variant>
    <Variant title="AutoPlayMethods">
      <AutoPlayMethods />
    </Variant>
    <Variant title="CenterMode">
      <CenterMode />
    </Variant>
    <Variant title="CustomArrows">
      <CustomArrows />
    </Variant>
    <Variant title="CustomPaging">
      <CustomPaging />
    </Variant>
    <Variant title="CustomSlides">
      <CustomSlides />
    </Variant>
    <Variant title="DynamicSlides">
      <DynamicSlides />
    </Variant>
    <Variant title="Fade">
      <Fade />
    </Variant>
    <Variant title="FocusOnSelect">
      <FocusOnSelect />
    </Variant>
    <Variant title="LazyLoad">
      <LazyLoad />
    </Variant>
    <Variant title="MultipleItems">
      <MultipleItems />
    </Variant>
    <Variant title="MultipleRows">
      <MultipleRows />
    </Variant>
    <Variant title="PauseOnHover">
      <PauseOnHover />
    </Variant>
    <Variant title="PreviousNextMethods">
      <PreviousNextMethods />
    </Variant>
    <Variant title="Resizable">
      <Resizable />
    </Variant>
    <Variant title="Responsive">
      <Responsive />
    </Variant>
    <Variant title="Rtl">
      <Rtl />
    </Variant>
    <Variant title="SlickGoTo">
      <SlickGoTo />
    </Variant>
    <Variant title="SlideChangeHooks">
      <SlideChangeHooks />
    </Variant>
    <Variant title="SwipeToSlide">
      <SwipeToSlide />
    </Variant>
    <Variant title="UnevenSetsFinite">
      <UnevenSetsFinite />
    </Variant>
    <Variant title="UnevenSetsInfinite">
      <UnevenSetsInfinite />
    </Variant>
    <Variant title="VariableWidth">
      <VariableWidth />
    </Variant>
    <Variant title="VerticalMode">
      <VerticalMode />
    </Variant>
    <Variant title="VerticalModeWhenUnslick">
      <VerticalModeWhenUnslick />
    </Variant>
    <Variant title="VerticalSwipeToSlide">
      <VerticalSwipeToSlide />
    </Variant>
  </Story>
</template>
