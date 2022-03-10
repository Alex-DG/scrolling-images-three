import Sketch from './experience'
import './style.css'
import gsap from 'gsap'
import * as THREE from 'three'

let sketch = new Sketch({
  dom: document.getElementById('container'),
})

let attracktMode = false
let attracktTo = 0
let speed = 0
let position = 0
let rounded = 0
let wrap = document.getElementById('wrap')
let elems = [...document.querySelectorAll('.n')]

window.addEventListener('wheel', (e) => {
  speed += e.deltaY * 0.0003
})

let objs = Array(5).fill({ dist: 0 })

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

const tick = () => {
  position = minMaxPosition()
  speed *= 0.8

  objs.forEach((o, i) => {
    o.dist = Math.min(Math.abs(position - i), 1)
    o.dist = 1 - o.dist ** 2
    elems[i].style.transform = `scale(${1 + 0.4 * o.dist})`

    let scale = 1 + 0.1 * o.dist
    sketch.meshes[i].position.y = i * 1.2 - position * 1.2
    sketch.meshes[i].scale.set(scale, scale, scale)
    sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist
  })

  rounded = Math.round(position)

  let diff = rounded - position

  if (attracktMode) {
    position += -(position - attracktTo) * 0.04
  } else {
    position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015
    wrap.style.transform = `translate(0, ${-position * 100}px)`
  }

  window.requestAnimationFrame(tick)
}

tick()

const navs = [...document.querySelectorAll('li')]
const nav = document.querySelector('.nav')

let rots = sketch.groups.map((g) => g.rotation)
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
