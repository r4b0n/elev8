init = () => {
  gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger)
  ScrollTrigger.normalizeScroll(true)
  resetScrollTrigger()
  let frame_count = 118
  let selection = 0
  let image_preload_count = 0
  let tl_sprite
  let tl_flavors_anim
  const flavors = [
    {
      name: 'Strawberry Guava',
      can: 'can_sg.webp',
      spin: 'spin_sg.webp',
      frame: 0,
      images: [],
      class: 'sg',
    },
    {
      name: 'Peach Pitaya',
      can: 'can_pp.webp',
      spin: 'spin_pp.webp',
      frame: 0,
      images: [],
      class: 'pp',
    },
    {
      name: 'Pineapple Mango',
      can: 'can_pm.webp',
      spin: 'spin_pm.webp',
      frame: 0,
      images: [],
      class: 'pm',
    },
  ]
  let images = []
  flavors.forEach((flavor) => {
    images.push(flavor.can)
    images.push(flavor.spin)
  })
  for (let i = 0; i < flavors.length; i++) {
    for (let ii = 0; ii < frame_count; ii++) {
      let img_src =
        flavors[i].class + '_webp/' + flavors[i].class + '_' + ii + '.webp'
      images.push(img_src)
      const img = new Image()
      img.src = img_src
      flavors[i].images.push(img)
    }
  }
  const year = new Date().getFullYear()
  document.querySelector('.year').textContent = ' ' + year
  const canvas = document.querySelector('#canvas')
  const context = canvas.getContext('2d')
  canvas.width = 2160
  canvas.height = 2160
  const nav = document.querySelector('nav')
  const can = document.querySelector('.can')
  const carousel = document.querySelector('.carousel-container')
  const flavor = document.querySelector('.carousel-container h2')
  const loader = document.querySelector('.loader')
  loader.classList.remove('hide')
  const loading_duration = 2000
  const arrows = document.querySelectorAll('.arrow')
  const spin_animation = document.querySelector('.spin-anim')
  const spin_sprite = document.querySelector('.spin-sprite')
  const sprite_width = spin_animation.offsetWidth * 17

  arrows.forEach((arrow) => {
    arrow.addEventListener('click', (e) => {
      document
        .querySelector('.elev8')
        .classList.remove(flavors[selection].class)
      switch (e.target.parentNode.classList[1]) {
        case 'arrow-left':
          if (selection == 0) {
            selection = flavors.length - 1
          } else {
            selection -= 1
          }
          break
        case 'arrow-right':
          if (selection == flavors.length - 1) {
            selection = 0
          } else {
            selection += 1
          }
          break
      }
      can.src = flavors[selection].can
      spin_sprite.src = flavors[selection].spin
      let name = flavors[selection].name.split(' ')
      flavor.childNodes[0].nodeValue = name[0] + ' '
      flavor.childNodes[1].firstChild.nodeValue = name[1]
      document.querySelector('.elev8').classList.add(flavors[selection].class)
      ScrollTrigger.getById('flavors').kill(true)
      tl_flavors_anim.kill()
      createFlavorsAnim()
    })
  })

  const nav_carousel = gsap
    .timeline({
      scrollTrigger: {
        trigger: '.elev8',
        pin: false,
        start: 'top top',
        end: '+=50',
        scrub: true,
      },
    })
    .add('start', 0)
    .to('nav, .carousel-container', { autoAlpha: 0, duration: 0.3 }, 'start')
  const bounds = document.querySelector('.scrubber')
  const drag = document.querySelector('.drag')
  const limit = bounds.offsetWidth - drag.offsetWidth
  // preload image assets
  function imageLoaded() {
    image_preload_count += 1
    if (image_preload_count == images.length) {
      console.log('all images are loaded')
      let t_out = setTimeout(() => {
        canvas.classList.remove('hide')
        nav.classList.remove('hide')
        loader.classList.add('hide')
        carousel.classList.remove('hide')
        can.src = flavors[selection].can
        spin_sprite.src = flavors[selection].spin
        spin_sprite.style.width = sprite_width + 'px'
        createFlavorsAnim()
        render()
        clearTimeout(t_out)
      }, loading_duration)
    }
  }
  // preload image assets
  for (let i = 0; i < images.length; i++) {
    let this_image = new Image()
    this_image.src = images[i]
    this_image.onLoad = imageLoaded()
  }
  function render() {
    // console.log(
    //   'rendering',
    //   flavors[selection].images[flavors[selection].frame]
    // )
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      flavors[selection].images[flavors[selection].frame],
      0,
      0,
      canvas.width,
      canvas.height
    )
  }
  const createTimelines = () => {
    tl_sprite = gsap.timeline({ paused: true }).to(spin_sprite, {
      x: -spin_animation.offsetWidth * 16,
      duration: 1,
      ease: 'steps(16)',
    })
    tl_sprite.progress(0.5)
  }
  const handleResize = (e) => {
    tl_sprite.progress(0)
    tl_sprite.kill()
    createTimelines()
    gsap.set(drag, { x: bounds.offsetWidth / 2 - drag.offsetWidth / 2 })
    resetScrollTrigger()
    window.scrollTo(0, 0)
    render()
  }
  // const line_tl = gsap.timeline({
  //   delay: 1,
  //   yoyo: true,
  //   repeat: -1,
  //   repeatDelay: 1,
  // })
  // line_tl.add('start', '>')
  // line_tl.set('.line', { drawSVG: '100% 100%' }, 'start')
  // line_tl.to('.line', { duration: 2, drawSVG: '0% 100%', ease: 'none' }, '>')
  // const angle_tl = gsap.timeline({
  //   delay: 1,
  //   yoyo: true,
  //   repeat: -1,
  //   repeatDelay: 1,
  // })
  // angle_tl.add('start', '>')
  // angle_tl.set('.angle', { drawSVG: '50% 50%' }, 'start')
  // angle_tl.to('.angle', { duration: 2, drawSVG: '0% 100%', ease: 'none' }, '>')
  const createFlavorsAnim = () => {
    tl_flavors_anim = gsap.timeline({}).to(flavors[selection], {
      frame: frame_count - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        id: 'flavors',
        trigger: '.elev8',
        scrub: 0.5,
        pin: true,
        start: 'top top',
        end: '+=4000',
      },
      onUpdate: render, // use animation onUpdate instead of scrollTrigger's onUpdate
    })
  }
  Draggable.create(drag, {
    bounds,
    edgeResistance: 0.95,
    inertia: true,
    throwResistance: 2000,
    type: 'x',
    liveSnap: {
      points: [
        { x: 0, y: 0 },
        { x: bounds.offsetWidth / 2 - drag.offsetWidth / 2, y: 0 },
        { x: bounds.offsetWidth - drag.offsetWidth, y: 0 },
      ],
      radius: 30,
    },
    onThrowUpdate: (e) => {
      let progress = gsap.getProperty(drag, 'x') / limit
      tl_sprite.progress(progress)
    },
    onDrag: (e) => {
      let progress = gsap.getProperty(drag, 'x') / limit
      tl_sprite.progress(progress)
    },
  })
  let t_out = setTimeout(() => {
    gsap.set(drag, { x: bounds.offsetWidth / 2 - drag.offsetWidth / 2 })
    clearTimeout(t_out)
  }, 500)
  window.addEventListener('resize', handleResize)
  createTimelines()
  handleResize()
}

function DOMLoaded() {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed')
    init()
  })
}

window.onload = DOMLoaded()

function detectTouch() {
  if (typeof window !== 'undefined') {
    return Boolean(
      'ontouchstart' in window ||
        window.navigator.maxTouchPoints > 0 ||
        window.navigator.msMaxTouchPoints > 0 ||
        (window.DocumentTouch && document instanceof DocumentTouch)
    )
  }
}

function resetScrollTrigger() {
  ScrollTrigger.clearScrollMemory()
  window.history.scrollRestoration = 'manual'
}
