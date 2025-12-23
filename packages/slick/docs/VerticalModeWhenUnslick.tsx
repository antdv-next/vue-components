import { defineComponent } from 'vue'
import Slider from '../src'

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
      <h2>Vertical Mode When Unslick</h2>
      <Slider {...settings}>
        <div>
          <h3>1</h3>
        </div>
        <div>
          <h3>2</h3>
        </div>
      </Slider>
    </div>
  )
})
