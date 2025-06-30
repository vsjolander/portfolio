import * as THREE from "three"
// import Scene from "./scene"
// import Camera from "./camera"
// import Renderer from "./renderer" // Temporarily disabled - file doesn't exist
import fragmentShader from "./glsl/fragment.glsl"
import vertexShader from "./glsl/vertex.glsl"

/*
 * Converting colors to proper format
 */
function normalizeColor(hexCode: string | number) {
  let num: number
  if (typeof hexCode === "string") {
    num = parseInt(hexCode, 16)
  } else {
    num = hexCode
  }
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (255 & num) / 255,
  ]
}

export default class Gradient {
  canvas: HTMLCanvasElement
  wrapper: HTMLDivElement
  computedCanvasStyle: CSSStyleDeclaration
  // renderer // Temporarily disabled - missing type
  conf = {
    presetName: "",
    wireframe: false,
    density: [0.06, 0.16],
    zoom: 1,
    rotation: 0,
    playing: true,
  }
  seed = 5
  time = 0
  last: number = 0
  width: number
  height: number
  sectionColors: number[][] = []
  material: THREE.ShaderMaterial | undefined
  xSegments: number
  ySegments: number
  geometry: THREE.PlaneGeometry
  plane: THREE.Mesh<THREE.PlaneGeometry> | undefined
  pointLight = new THREE.PointLight(0xffffff, 2)
  constructor({
    canvas,
    wrapper,
  }: {
    canvas: HTMLCanvasElement
    wrapper: HTMLDivElement
  }) {
    this.canvas = canvas
    this.wrapper = wrapper
    const { width, height } = this.wrapper.getBoundingClientRect()
    this.width = width
    this.height = height
    this.xSegments = Math.ceil(this.width * this.conf.density[0])
    this.ySegments = Math.ceil(this.height * this.conf.density[0])
    this.geometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      this.xSegments,
      this.ySegments
    )
    this.computedCanvasStyle = getComputedStyle(this.canvas)
    // this.scene = new Scene()
    // this.camera = new Camera()
    // this.renderer = new Renderer(this.canvas, this.width, this.height) // Temporarily disabled - Renderer class missing
    this.pointLight.position.set(10, 10, 10)

    this.render.bind(this)

    this.init()

    requestAnimationFrame((e) => this.render(e))
  }

  createUvNormAttribute() {
    const uvNorm = new Float32Array(this.geometry.attributes.uv.count * 2)

    this.geometry.attributes.uv.array.forEach((item: number, index: number) => {
      uvNorm[index] = 2 * item - 1
    })

    this.geometry.setAttribute(
      "uvNorm",
      new THREE.Float32BufferAttribute(uvNorm, 2)
    )
  }

  initGradientColors() {
    this.sectionColors = [
      "--gradientColorZero",
      "--gradientColorOne",
      "--gradientColorTwo",
      "--gradientColorThree",
    ]
      .map((cssPropertyName) => {
        console.log(cssPropertyName)

        let hex = this.computedCanvasStyle
          .getPropertyValue(cssPropertyName)
          .trim()
        console.log(hex)

        if (4 === hex.length) {
          const hexTemp = hex
            .substr(1)
            .split("")
            .map((hexTemp) => hexTemp + hexTemp)
            .join("")
          hex = `#${hexTemp}`
          console.log(hex)
        }
        return hex && `0x${hex.substr(1)}`
      })
      .filter(Boolean)
      .map(normalizeColor)
  }

  initMaterial() {
    console.log("initMaterial")

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(this.width, this.height) },
      u_active_colors: {
        value: new THREE.Vector3(1, 1, 1),
      },
      u_global: {
        value: {
          noiseFreq: new THREE.Vector2(14e-5, 29e-5),
          noiseSpeed: 5e-6,
        },
      },
      u_vertDeform: {
        value: {
          incline: Math.sin(0) / Math.cos(0), // 0 is this.angle,
          offsetTop: 0,
          offsetBottom: 0,
          noiseFreq: new THREE.Vector2(3, 4),
          noiseAmp: 320,
          noiseSpeed: 10,
          noiseFlow: 3,
          noiseSeed: 5,
        },
      },
      u_baseColor: {
        value: new THREE.Vector3(0.5, 0.5, 0.5),
      },
      u_waveLayers: {
        value: this.sectionColors.map((_item, e) => ({
          color: new THREE.Vector3(
            this.sectionColors[e][0],
            this.sectionColors[e][1],
            this.sectionColors[e][2]
          ),
          noiseFreq: new THREE.Vector2(
            2 + e / this.sectionColors.length,
            3 + e / this.sectionColors.length
          ),
          noiseSpeed: 11 + 0.3 * e,
          noiseFlow: 6.5 + 0.3 * e,
          noiseSeed: this.seed + 10 * e,
          noiseFloor: 0.1,
          noiseCeil: 0.63 + 0.07 * e,
        })),
      },
    }

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      fragmentShader,
      vertexShader,
    })
  }

  initMesh() {
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane.geometry.rotateX(-Math.PI / 2)
  }

  resize() {
    const { width, height } = this.wrapper.getBoundingClientRect()
    this.width = width
    this.height = height
    // this.renderer.WebGLRenderer?.setSize(this.width, this.height) // Temporarily disabled
  }

  init() {
    this.createUvNormAttribute()
    this.initGradientColors()
    this.initMaterial()
    this.initMesh()
    this.resize()
  }

  public render(e: number) {
    this.time += Math.min(e - this.last, 1e3 / 15)
    this.last = e

    if (this.material) this.material.uniforms.u_time.value = this.time

    requestAnimationFrame((e) => this.render(e))
  }

  public dispose() {
    // Clean up Three.js resources
    if (this.geometry) {
      this.geometry.dispose()
    }
    if (this.material) {
      this.material.dispose()
    }
    // if (this.renderer.WebGLRenderer) {
    //   this.renderer.WebGLRenderer.dispose()
    // } // Temporarily disabled
  }
}
