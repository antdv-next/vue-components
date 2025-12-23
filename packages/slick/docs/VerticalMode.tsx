import { defineComponent } from 'vue'
import Slider from '../src'
import { renderNumberSlides } from './shared'

export default defineComponent(() => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    beforeChange: (currentSlide: number, nextSlide: number) => {
      console.log('before change', currentSlide, nextSlide)
    },
    afterChange: (currentSlide: number) => {
      console.log('after change', currentSlide)
    },
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderNumberSlides(6)}
      </Slider>
    </div>
  )
})
