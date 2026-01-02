import type { SlickRef } from '../src'
import { defineComponent, ref } from 'vue'
import Slider from '../src'
import { imageUrls, renderImageSlides } from './shared'

export default defineComponent(() => {
  const slideIndex = ref(0)
  const updateCount = ref(0)
  const sliderRef = ref<SlickRef | null>(null)

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: () => {
      updateCount.value += 1
    },
    beforeChange: (_current: number, next: number) => {
      slideIndex.value = next
    },
  }

  const onRangeChange = (event: Event) => {
    const value = Number((event.target as HTMLInputElement).value)
    sliderRef.value?.slickGoTo(value)
  }

  return () => (
    <div class="slider-container">
      <p>
        Total updates:
        {updateCount.value}
      </p>
      <input
        type="range"
        min={0}
        max={3}
        value={slideIndex.value}
        onInput={onRangeChange}
      />
      <Slider ref={sliderRef} {...settings}>
        {renderImageSlides(imageUrls)}
      </Slider>
    </div>
  )
})
