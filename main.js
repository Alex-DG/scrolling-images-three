import './style.css'

import Sketch from './experience'
import gsap from 'gsap'
import * as THREE from 'three'

/**
 * Init experience
 */
const sketch = new Sketch({
  dom: document.getElementById('container'),
})

/**
 * Utils
 */

const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

// Handle max/min scroll position
const minMaxPosition = () => {
  let pos = position
  if (position >= 0 && position <= elems.length - 1) {
    pos += speed
  } else {
    const smooth =
      position < 1
        ? THREE.MathUtils.lerp(position, Math.ceil(position), 0.2)
        : THREE.MathUtils.lerp(position, Math.floor(position), 0.2)
    pos = smooth
  }
  return pos
}

/**
 * Base
 */
let attracktMode = false
let attracktTo = 0
let speed = 0
let position = 0
let rounded = 0

let objs = Array(5).fill({ dist: 0 })
let rots = sketch.groups.map((g) => g.rotation)

/**
 * Dom Elements
 */
const wrap = document.getElementById('wrap')
const elems = [...document.querySelectorAll('.n')]
const dots = [...document.querySelectorAll('li')]
const navs = [...document.querySelectorAll('li')]
const nav = document.querySelector('.nav')

/**
 * Events - desktop & mobile
 */
if (isMobile) {
  let startY
  window.addEventListener('touchmove', (evt) => {
    const deltaY = evt.touches[0].clientY - startY
    speed += deltaY * 0.00003
  })
  window.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY
  })
} else {
  window.addEventListener('wheel', (event) => {
    speed += event.deltaY * 0.0002
  })
}

// Dots navigation - on mouse enter
nav.addEventListener('mouseenter', () => {
  attracktMode = true

  gsap.to(rots, {
    x: -0.5,
    y: 0,
    z: 0,
    duration: 0.35,
    ease: 'power3.inOut',
  })
})

// Dots navigation - on mouse leave
nav.addEventListener('mouseleave', () => {
  attracktMode = false

  gsap.to(rots, {
    x: -0.3,
    y: -0.5,
    z: -0.1,
    duration: 0.35,
    ease: 'power3.inOut',
  })
})

navs.forEach((el) => {
  el.addEventListener('mouseover', (e) => {
    attracktTo = Number(e.target.getAttribute('data-nav'))
  })
})

/**
 * Update loop
 */
const tick = () => {
  position = minMaxPosition()
  speed *= 0.8

  objs.forEach((o, i) => {
    o.dist = Math.min(Math.abs(position - i), 1)
    o.dist = 1 - o.dist ** 2
    elems[i].style.transform = `scale(${1 + 0.4 * o.dist})`
    elems[i].style.opacity = `${o.dist}`
    dots[i].style.opacity = `${o.dist + 0.5}`

    if (Math.ceil(o.dist) === 1) {
      elems[i].style.display = 'block'
    } else {
      elems[i].style.display = 'none'
    }

    let scale = 1 + 0.25 * o.dist
    sketch.meshes[i].position.y = i * 1.4 - position * 1.4
    sketch.meshes[i].scale.set(scale, scale, scale)
    sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist
  })

  rounded = Math.round(position)

  const diff = rounded - position
  if (attracktMode) {
    position += -(position - attracktTo) * 0.04
  } else {
    position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015
  }

  wrap.style.transform = `translate(0, ${-position * 100}px)`

  window.requestAnimationFrame(tick)
}

tick()
