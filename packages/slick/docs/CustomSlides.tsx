import { defineComponent } from 'vue'
import Slider from '../src'

const CustomSlide = defineComponent<{ index: number }>((props, { attrs }) => {
  return () => (
    <div {...attrs}>
      <h3>{props.index}</h3>
    </div>
  )
})

export default defineComponent(() => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  return () => (
    <div class="slider-container">
      <Slider {...settings}>
        <CustomSlide index={1} />
        <CustomSlide index={2} />
        <CustomSlide index={3} />
        <CustomSlide index={4} />
        <CustomSlide index={5} />
        <CustomSlide index={6} />
      </Slider>
    </div>
  )
})
