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
      <div class="content">
        <SimpleSlider />
      </div>
    </Variant>
    <Variant title="AdaptiveHeight">
      <div class="content">
        <AdaptiveHeight />
      </div>
    </Variant>
    <Variant title="AppendDots">
      <div class="content">
        <AppendDots />
      </div>
    </Variant>
    <Variant title="AsNavFor">
      <div class="content">
        <AsNavFor />
      </div>
    </Variant>
    <Variant title="AutoPlay">
      <div class="content">
        <AutoPlay />
      </div>
    </Variant>
    <Variant title="AutoPlayMethods">
      <div class="content">
        <AutoPlayMethods />
      </div>
    </Variant>
    <Variant title="CenterMode">
      <div class="content">
        <CenterMode />
      </div>
    </Variant>
    <Variant title="CustomArrows">
      <div class="content">
        <CustomArrows />
      </div>
    </Variant>
    <Variant title="CustomPaging">
      <div class="content">
        <CustomPaging />
      </div>
    </Variant>
    <Variant title="CustomSlides">
      <div class="content">
        <CustomSlides />
      </div>
    </Variant>
    <Variant title="DynamicSlides">
      <div class="content">
        <DynamicSlides />
      </div>
    </Variant>
    <Variant title="Fade">
      <div class="content">
        <Fade />
      </div>
    </Variant>
    <Variant title="FocusOnSelect">
      <div class="content">
        <FocusOnSelect />
      </div>
    </Variant>
    <Variant title="LazyLoad">
      <div class="content">
        <LazyLoad />
      </div>
    </Variant>
    <Variant title="MultipleItems">
      <div class="content">
        <MultipleItems />
      </div>
    </Variant>
    <Variant title="MultipleRows">
      <div class="content">
        <MultipleRows />
      </div>
    </Variant>
    <Variant title="PauseOnHover">
      <div class="content">
        <PauseOnHover />
      </div>
    </Variant>
    <Variant title="PreviousNextMethods">
      <div class="content">
        <PreviousNextMethods />
      </div>
    </Variant>
    <Variant title="Resizable">
      <div class="content">
        <Resizable />
      </div>
    </Variant>
    <Variant title="Responsive">
      <div class="content">
        <Responsive />
      </div>
    </Variant>
    <Variant title="Rtl">
      <div class="content">
        <Rtl />
      </div>
    </Variant>
    <Variant title="SlickGoTo">
      <div class="content">
        <SlickGoTo />
      </div>
    </Variant>
    <Variant title="SlideChangeHooks">
      <div class="content">
        <SlideChangeHooks />
      </div>
    </Variant>
    <Variant title="SwipeToSlide">
      <div class="content">
        <SwipeToSlide />
      </div>
    </Variant>
    <Variant title="UnevenSetsFinite">
      <div class="content">
        <UnevenSetsFinite />
      </div>
    </Variant>
    <Variant title="UnevenSetsInfinite">
      <div class="content">
        <UnevenSetsInfinite />
      </div>
    </Variant>
    <Variant title="VariableWidth">
      <div class="content">
        <VariableWidth />
      </div>
    </Variant>
    <Variant title="VerticalMode">
      <div class="content">
        <VerticalMode />
      </div>
    </Variant>
    <Variant title="VerticalModeWhenUnslick">
      <div class="content">
        <VerticalModeWhenUnslick />
      </div>
    </Variant>
    <Variant title="VerticalSwipeToSlide">
      <div class="content">
        <VerticalSwipeToSlide />
      </div>
    </Variant>
  </Story>
</template>
