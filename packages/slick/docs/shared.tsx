export const baseUrl = '/img/react-slick'

export const imageUrls = [
  `${baseUrl}/abstract01.jpg`,
  `${baseUrl}/abstract02.jpg`,
  `${baseUrl}/abstract03.jpg`,
  `${baseUrl}/abstract04.jpg`,
]

export function renderNumberSlides(count: number, start = 1) {
  return Array.from({ length: count }, (_, index) => {
    const value = start + index
    return (
      <div key={value}>
        <h3>{value}</h3>
      </div>
    )
  })
}

export function renderImageSlides(urls: string[]) {
  return urls.map((url, index) => (
    <div key={`${url}-${index}`}>
      <img src={url} />
    </div>
  ))
}
