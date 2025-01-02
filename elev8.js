init = () => {
  gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger)
  ScrollTrigger.normalizeScroll(true)
  resetScrollTrigger()
  let sg_frame_count = 118
  let selection = 0
  const flavors = [
    {
      name: 'Strawberry Guava',
      can: 'can_sg.png',
      spin: 'spin_sg.jpg',
      class: 'sg',
    },
    {
      name: 'Peach Pitaya',
      can: 'can_pp.png',
      spin: 'spin_pp.jpg',
      class: 'pp',
    },
    {
      name: 'Pineapple Mango',
      can: 'can_pm.png',
      spin: 'spin_pm.jpg',
      class: 'pm',
    },
  ]
  const sg_anim = {
    frame: 0,
  }
  let images = []
  let sg_images = []
  let anim_images = []
  flavors.forEach((flavor) => {
    images.push(flavor.can)
    images.push(flavor.spin)
  })
  for (let i = 0; i < sg_frame_count; i++) {
    let img_src = 'sg_png/sg_' + i + '.png'
    sg_images.push(img_src)
    const img = new Image()
    img.src = img_src
    anim_images.push(img)
  }
  images.push(...sg_images)
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
  let image_preload_count = 0
  let tl_sprite
  // preload image assets
  function imageLoaded() {
    image_preload_count += 1
    if (image_preload_count == images.length) {
      console.log('all images loaded')
      let t_out = setTimeout(() => {
        canvas.classList.remove('hide')
        nav.classList.remove('hide')
        loader.classList.add('hide')
        carousel.classList.remove('hide')
        can.src = flavors[selection].can
        spin_sprite.src = flavors[selection].spin
        spin_sprite.style.width = sprite_width + 'px'
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
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      anim_images[sg_anim.frame],
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
  }
  gsap.to(sg_anim, {
    frame: sg_frame_count - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      trigger: '.elev8',
      scrub: 0.5,
      pin: true,
      start: 'top top',
      end: '+=4000',
    },
    onUpdate: render, // use animation onUpdate instead of scrollTrigger's onUpdate
  })
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

window.onload = init()

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
