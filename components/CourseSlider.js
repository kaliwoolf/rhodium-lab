// components/CourseSlider.js
import { useRef, useEffect, useState } from 'react'
import GlassCourseCard from '../components/GlassCourseCard'
import styles from '../styles/CourseSlider.module.css'

const baseCourses = [
  {
    title: 'КОД СТЫДА',
    description: 'Онлайн-курс из 12 занятий по системной проработке механизмов стыда',
    link: '/courses/kod-styda',
    video: '/video/ks.mp4',
    texture: '/textures/glass-noise.png'
  },
  {
    title: 'ИНКВИЗИЦИЯ БОГАТСТВА',
    description: 'Курс о власти, деньгах и родовых ограничениях через архетипы',
    link: '/courses/wealth-inquisition',
    video: '/video/p2.mp4',
    texture: '/textures/glass-gold.jpg'
  },
  {
    title: 'ПРОФАЙЛИНГ',
    description: 'Анализ архетипов и поведения через системную оптику и карты',
    link: '/courses/profiling-thoth',
    video: '/video/profiling.mp4',
    texture: '/textures/glass-blue.jpg'
  },
  {
    title: 'ПРИДВОРНЫЕ КАРТЫ',
    description: 'I Модуль по психотипам',
    link: '/courses/profiling-thoth',
    video: '/video/profiling.mp4',
    texture: '/textures/glass-neon.jpg'
  }
]

const courses = baseCourses
const middleIndex = Math.floor(courses.length / 2)


export default function CourseSlider() {
  const sliderRef = useRef()
  const [centerIndex, setCenterIndex] = useState(middleIndex)
  const [activeIndex, setActiveIndex] = useState(middleIndex)


  const scroll = (dir) => {
  const newIndex = Math.min(
    Math.max(0, activeIndex + dir),
    courses.length - 1
  )
  setActiveIndex(newIndex)

  if (sliderRef.current) {
    const scrollAmount = 340 // карточка + gap
    sliderRef.current.scrollTo({
      left: newIndex * scrollAmount,
      behavior: 'smooth'
    })
  }
}


  // swipe на мобилках
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    let startX = 0
    let endX = 0
    const onTouchStart = (e) => startX = e.touches[0].clientX
    const onTouchEnd = (e) => {
      endX = e.changedTouches[0].clientX
      const delta = startX - endX
      if (delta > 50) scroll(1)
      if (delta < -50) scroll(-1)
    }
    slider.addEventListener('touchstart', onTouchStart)
    slider.addEventListener('touchend', onTouchEnd)
    return () => {
      slider.removeEventListener('touchstart', onTouchStart)
      slider.removeEventListener('touchend', onTouchEnd)
    }
  }, [])


  return (
    <div className={styles.wrapper}>
      <button className={styles.leftButton} onClick={() => scroll(-1)}>‹</button>
      <div className={styles.slider} ref={sliderRef}>
        {courses.map((course, index) => (
          <div
            key={index}
            data-index={index}
            className={`${styles.card} ${
              index === activeIndex
                ? styles.focused
                : styles.dimmed
            }`}
          >
            <GlassCourseCard
              {...course}
              isFocused={index === activeIndex}
              sliderRef={sliderRef}
            />
          </div>
        ))}
      </div>
      <button className={styles.rightButton} onClick={() => scroll(1)}>›</button>
    </div>
  )
}
