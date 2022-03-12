import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'

import gsap from 'gsap'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom

    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0xeeeeee, 1)
    this.renderer.outputEncoding = THREE.sRGBEncoding

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2(-1, -1)

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
    this.isShowing = false
    this.resetRotation = new THREE.Vector3()
    this.currentSelection = null

    this.addObjects()
    this.resize()
    this.render()
    this.setupResize()

    this.materials = []
    this.meshes = []
    this.groups = []

    this.handleImages()

    this.onPointerMove = this.onPointerMove.bind(this)

    window.addEventListener('pointermove', this.onPointerMove)
  }

  onPointerMove(event) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
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
      mesh.name = `photo-${i}`
      mesh.userData = {
        index: i,
      }

      group.rotation.x = -0.3
      group.rotation.y = -0.5
      group.rotation.z = -0.1
    })
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
      // wireframe: true,
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

  showPhoto(index) {
    if (!this.isShowing) {
      this.clearTweens()
      this.isShowing = true
      this.currentSelection = index
      const mesh = this.meshes[index]
      this.resetRotation.copy(mesh.rotation.clone())

      const tl = gsap.timeline()
      tl.to(mesh.rotation, {
        x: 0.2,
        y: 0.5,
        z: 0,
        duration: 0.35,
        ease: 'power3.inOut',
      })
      tl.to(this.camera.position, {
        z: 1.7,
        duration: 0.35,
        ease: 'power3.inOut',
      })
      gsap.to(this.materials[this.currentSelection].uniforms.bendFactor, {
        value: 0.0,
        duration: 0.5,
        ease: 'power3.inOut',
      })
    }
  }

  resetPhoto() {
    if (typeof this.currentSelection === 'number') {
      this.clearTweens()
      const mesh = this.meshes[this.currentSelection]
      const tl = gsap.timeline()
      tl.to(mesh.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.35,
        ease: 'power3.inOut',
      })
      tl.to(this.camera.position, {
        z: 2,
        duration: 0.35,
        ease: 'power3.inOut',
      })
      gsap.to(this.materials[this.currentSelection].uniforms.bendFactor, {
        value: 0.025,
        duration: 0.5,
        ease: 'power3.inOut',
      })

      this.currentSelection = null
    }
  }

  clearTweens() {
    gsap.globalTimeline.clear()
  }

  render() {
    if (!this.isPlaying) return

    this.time += 0.05

    this.materials?.forEach((m, i) => {
      if (this.currentSelection !== i) {
        m.uniforms.time.value = this.time
      }
    })

    // update the picking ray with the camera and pointer position
    // this.raycaster.setFromCamera(this.pointer, this.camera)

    // // calculate objects intersecting the picking ray
    // const intersects = this.raycaster.intersectObjects(this.scene.children)
    // if (intersects.length > 0) {
    //   const photo = intersects[0].object
    //   this.showPhoto(photo.userData.index)
    // } else {
    //   this.isShowing = false
    //   this.resetPhoto()
    // }

    // console.log({ isShowing: this.isShowing })

    // this.material.uniforms.time.value = this.time

    requestAnimationFrame(this.render.bind(this))

    this.renderer.render(this.scene, this.camera)
  }
}
