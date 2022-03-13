import * as THREE from 'three'

import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)

    this.textureLoader = new THREE.TextureLoader()

    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    )
    this.camera.position.set(0, 0, 2)

    this.time = 0
    this.isPlaying = true

    this.materials = []
    this.meshes = []
    this.groups = []

    this.addObjects()
    this.resize()
    this.render()
    this.setupResize()
    this.setImages()
  }

  setImages() {
    let images = [...document.querySelectorAll('img')]

    images.forEach((img, i) => {
      // const imgAspect = img.naturalWidth / img.naturalHeight or 1.4
      const group = new THREE.Group()

      const geo = new THREE.PlaneBufferGeometry(1.4, 1, 20, 20)
      const mat = this.material.clone()
      this.materials.push(mat)
      mat.uniforms.texture1.value = this.textureLoader.load(img.src)
      mat.uniforms.texture1.value.needsUpdate = true

      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = i * 1.2
      mesh.name = `photo-${i}`
      mesh.userData = {
        index: i,
        project: `Photo ${i}`,
        link: 'https://github.com/alex-dg',
      }

      group.add(mesh)
      group.rotation.x = -0.3
      group.rotation.y = -0.5
      group.rotation.z = -0.1

      this.groups.push(group)
      this.scene.add(group)
      this.meshes.push(mesh)
    })
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize() {
    // TODO: resize shader
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0.0 },
        texture1: { value: null },
        resolution: { value: new THREE.Vector4() },
        distanceFromCenter: { value: 0.0 },
        bendFactor: { value: 0.025 },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    })
  }

  stop() {
    this.isPlaying = false
  }

  play() {
    if (!this.isPlaying) {
      this.render()
      this.isPlaying = true
    }
  }

  render() {
    if (!this.isPlaying) return

    this.time += 0.05

    this.materials?.forEach((m, _) => (m.uniforms.time.value = this.time))

    requestAnimationFrame(this.render.bind(this))

    this.renderer.render(this.scene, this.camera)
  }
}
