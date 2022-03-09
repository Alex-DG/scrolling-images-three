import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom

    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0xeeeeee, 1)
    this.renderer.outputEncoding = THREE.sRGBEncoding

    this.textureLoader = new THREE.TextureLoader()

    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    )
    this.camera.position.set(0, 0, 2)

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.time = 0

    this.isPlaying = true

    this.addObjects()
    this.resize()
    this.render()
    this.setupResize()
    // this.settings();

    this.materials = []
    this.meshes = []
    this.groups = []

    this.handleImages()
  }

  handleImages() {
    let images = [...document.querySelectorAll('img')]
    images.forEach((img, i) => {
      // const aspect = img.naturalWidth / img.naturalHeight or 1.4

      let mat = this.material.clone()
      this.materials.push(mat)
      let group = new THREE.Group()

      mat.uniforms.texture1.value = this.textureLoader.load(img.src)
      mat.uniforms.texture1.value.needsUpdate = true

      let geo = new THREE.PlaneBufferGeometry(1.4, 1, 20, 20)
      let mesh = new THREE.Mesh(geo, mat)
      group.add(mesh)
      this.groups.push(group)
      this.scene.add(group)
      this.meshes.push(mesh)
      mesh.position.y = i * 1.2

      group.rotation.x = -0.3
      group.rotation.y = -0.3
      group.rotation.z = -0.3
    })
  }

  settings() {
    let that = this
    this.settings = {
      progress: 0,
    }
    this.gui = new dat.GUI()
    this.gui.add(this.settings, 'progress', 0, 1, 0.01)
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addObjects() {
    let that = this
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        texture1: { value: null },
        resolution: { value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    })

    // this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    // this.plane = new THREE.Mesh(this.geometry, this.material)
    // this.scene.add(this.plane)
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

    this.materials?.forEach((m) => {
      m.uniforms.time.value = this.time
    })

    // this.material.uniforms.time.value = this.time

    requestAnimationFrame(this.render.bind(this))

    this.renderer.render(this.scene, this.camera)
  }
}
