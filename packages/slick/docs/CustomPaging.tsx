import { defineComponent } from 'vue'
import Slider from '../src'
import { baseUrl, imageUrls, renderImageSlides } from './shared'

export default defineComponent(() => {
  const settings = {
    customPaging: (i: number) => (
      <a>
        <img src={`${baseUrl}/abstract0${i + 1}.jpg`} />
      </a>
    ),
    dots: true,
    dotsClass: 'slick-dots slick-thumb',
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        {renderImageSlides(imageUrls)}
      </Slider>
    </div>
  )
})
