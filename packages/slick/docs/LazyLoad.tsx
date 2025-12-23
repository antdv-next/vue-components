import { defineComponent } from 'vue'
import Slider from '../src'
import { imageUrls, renderImageSlides } from './shared'

export default defineComponent(() => {
  const settings = {
    dots: true,
    lazyLoad: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 2,
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderImageSlides(imageUrls)}
      </Slider>
    </div>
  )
})
