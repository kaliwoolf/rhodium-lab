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
    title: 'ПРИДВОРНЫЕ КАРТЫ',
    description: 'I Модуль по психотипам',
    link: '/courses/profiling-thoth',
    video: '/video/profiling.mp4',
    texture: '/textures/glass-neon.jpg'
  },
  {
    title: 'ТАРО БОТ',
    description: 'Бот Телеграм для определения психотипа',
    link: 'https://t.me/portolux',
    video: '/video/bot.mp4',
    texture: '/textures/glass-ice.jpg'
  }
]

const courses = baseCourses
const middleIndex = Math.floor(courses.length / 2)

export default function CourseSlider() {
  const sliderRef = useRef()
  const [activeIndex, setActiveIndex] = useState(middleIndex)

  const scrollToCard = (index) => {
    const clampedIndex = Math.max(0, Math.min(index, courses.length - 1))
    setActiveIndex(clampedIndex)

    const slider = sliderRef.current
    if (!slider) return

    const card = slider.querySelector(`[data-index="${clampedIndex}"]`)
    if (!card) return

    const sliderRect = slider.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const scrollOffset = card.offsetLeft - (sliderRect.width / 2 - cardRect.width / 2)

    slider.scrollTo({
      left: scrollOffset,
       behavior: smooth ? 'smooth' : 'auto',
    })
  }

  const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
      if (!hasInitialized) {
        requestAnimationFrame(() => scrollToCard(activeIndex, false));
        setHasInitialized(true);
      }
    }, [hasInitialized]);


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
      if (delta > 50) scrollToCard(activeIndex + 1)
      if (delta < -50) scrollToCard(activeIndex - 1)
    }

    slider.addEventListener('touchstart', onTouchStart)
    slider.addEventListener('touchend', onTouchEnd)
    return () => {
      slider.removeEventListener('touchstart', onTouchStart)
      slider.removeEventListener('touchend', onTouchEnd)
    }
  }, [activeIndex])

  return (
    <div className={styles.wrapper}>
      <div className={styles.sliderOuterWrapper}>
        {activeIndex > 0 && (
          <button
            className={styles.leftButton}
            onClick={() => scrollToCard(activeIndex - 1)}
          >
            ‹
          </button>
        )}

        <div className={styles.sliderContainer}>
          <div className={styles.slider} ref={sliderRef}>
            {courses.map((course, index) => (
              <div
                key={index}
                data-index={index}
                className={`${styles.card} ${index === activeIndex ? styles.focused : styles.dimmed}`}
              >
                <GlassCourseCard
                  {...course}
                  isFocused={index === activeIndex}
                  sliderRef={sliderRef}
                />
              </div>
            ))}
          </div>
        </div>

        {activeIndex < courses.length - 1 && (
          <button
            className={styles.rightButton}
            onClick={() => scrollToCard(activeIndex + 1)}
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}
