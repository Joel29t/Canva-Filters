import {
  BrightenEnhanceFilter,
  GrayscaleFilter,
  NegativeFilter,
  MirrorHorizontalFilter,
  SepiaFilter,
  PixelateFilter,
  ClearCanvasFilter,
  SaveCanvasContentFilter
} from './filters.js'

// Clase principal para gestionar el lienzo y filtros
export class CanvasManager {
  #canvas
  #context
  #thumbnailsContainer
  #image
  #originalImageData
  #selectedFilter
  #filtersContainer
  #brightenEnhanceFilter
  #uploadInput
  #uploadButton

  // Constructor para inicializar la clase
  constructor (canvasId, thumbnailsContainerSelector) {
    // Inicializar propiedades
    this.#canvas = document.getElementById(canvasId)
    this.#context = this.#canvas.getContext('2d')
    this.#context.willReadFrequently = true
    this.#thumbnailsContainer = document.querySelector(thumbnailsContainerSelector)
    this.#image = new Image()
    this.#originalImageData = null
    this.#selectedFilter = null

    // Configurar eventos para miniaturas y filtros
    this.#thumbnailsContainer.addEventListener('click', this.loadThumbnail.bind(this))
    this.#filtersContainer = document.getElementById('filters')
    this.#filtersContainer.addEventListener('click', this.handleFilterClick.bind(this))

    // Configurar filtro de mejora de brillo
    this.#brightenEnhanceFilter = new BrightenEnhanceFilter()
    document.getElementById('brightnessRange').addEventListener('input', (event) => {
      this.#brightenEnhanceFilter.brightnessLevel = parseInt(event.target.value, 10)
      this.applyFilter()
    })

    // Configurar carga de imágenes desde local
    this.#uploadInput = document.getElementById('uploadInput')
    this.#uploadButton = document.getElementById('uploadButton')
    this.#uploadButton.addEventListener('click', this.#handleUploadClick.bind(this))
    this.#uploadInput.addEventListener('change', this.#handleFileSelect.bind(this))

    // Configurar evento de carga de imagen
    this.#image.onload = this.drawImage.bind(this)
  }

  // Método para aplicar el filtro actual
  applyFilter () {
    this.drawImage()
  }

  // Método para cargar una miniatura al hacer clic
  loadThumbnail (event) {
    if (event.target.classList.contains('thumbnail')) {
      this.#image.src = event.target.src
      this.clearActiveThumbnails()
      event.target.classList.add('active')
      if (this.#selectedFilter instanceof ClearCanvasFilter || this.#selectedFilter instanceof SaveCanvasContentFilter) {
        this.applyFilterByType(this.#selectedFilter.constructor.name)
      }
    }
  }

  // Método para dibujar la imagen en el lienzo principal
  drawImage () {
    const { width, height } = this.#image

    this.#canvas.width = width + 20
    this.#canvas.height = height + 20

    if (!this.#originalImageData) {
      this.#originalImageData = this.#context.getImageData(10, 10, width, height)
    }

    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
    this.#context.drawImage(this.#image, 10, 10)

    this.applySelectedFilter()
  }

  // Método para desactivar todas las miniaturas
  clearActiveThumbnails () {
    this.#thumbnailsContainer
      .querySelectorAll('.thumbnail')
      .forEach((thumbnail) => thumbnail.classList.remove('active'))
  }

  // Método para aplicar el filtro seleccionado
  applySelectedFilter () {
    if (this.#selectedFilter && this.#image.src && typeof this.#selectedFilter.applyFilter === 'function') {
      const imageDataFilter = this.#context.getImageData(10, 10, this.#image.width, this.#image.height)

      // Aplica el filtro seleccionado de la clase Filter a los datos de la imagen
      this.#selectedFilter.applyFilter(imageDataFilter)

      if (!(this.#selectedFilter instanceof ClearCanvasFilter)) {
        this.#canvas.width = this.#image.width * 2 + 30
        this.#canvas.height = this.#image.height + 20

        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
        this.#context.drawImage(this.#image, 10, 10)
        this.#context.putImageData(imageDataFilter, this.#image.width + 20, 10)
      }
    }
  }

  // Método para aplicar un filtro específico según el tipo
  applyFilterByType (filterType) {
    const brightnessRange = document.getElementById('brightnessRange')
    brightnessRange.style.display = 'none'

    switch (filterType) {
      case 'brighten_enhance':
        this.#selectedFilter = this.#brightenEnhanceFilter
        brightnessRange.style.display = 'block'
        break
      case 'grayscale':
        this.#selectedFilter = new GrayscaleFilter()
        break
      case 'negative':
        this.#selectedFilter = new NegativeFilter()
        break
      case 'mirror_horizontal':
        this.#selectedFilter = new MirrorHorizontalFilter()
        break
      case 'sepia':
        this.#selectedFilter = new SepiaFilter()
        break
      case 'pixelate':
        this.#selectedFilter = new PixelateFilter()
        break
      case 'clear_canvas':
        this.#selectedFilter = new ClearCanvasFilter()
        break
      case 'save_canvas_content':
        if (this.#selectedFilter != null && !(this.#selectedFilter instanceof ClearCanvasFilter)) {
          this.#selectedFilter = new SaveCanvasContentFilter()
          this.applySelectedFilter()
          this.#selectedFilter.saveCanvasContent()
        } else {
          alert('No hi ha cap filtre seleccionat')
        }
        return
      default:
        this.#selectedFilter = null
        break
    }

    if (!(this.#selectedFilter instanceof SaveCanvasContentFilter)) {
      this.applySelectedFilter()
    }
  }

  // Método para manejar clics en los filtros
  handleFilterClick (event) {
    if (event.target.tagName === 'IMG') {
      this.applyFilterByType(event.target.id)
    }
  }

  // Método privado para manejar clics en el botón de carga
  #handleUploadClick () {
    this.#uploadInput.click()
  }

  // Método privado para manejar la selección de archivos
  #handleFileSelect (event) {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result
        this.#addImageThumbnail(imageUrl)
      }

      reader.readAsDataURL(file)
    }
  }

  // Método privado para agregar una miniatura de imagen
  #addImageThumbnail (imageUrl) {
    const thumbnailContainer = document.querySelector('.thumbnails')
    const thumbnailImage = document.createElement('img')
    thumbnailImage.classList.add('thumbnail')
    thumbnailImage.src = imageUrl
    thumbnailImage.alt = 'Thumbnail'

    thumbnailContainer.appendChild(thumbnailImage)
  }

  // Getter y Setter para #canvas
  get canvas () {
    return this.#canvas
  }

  set canvas (value) {
    this.#canvas = value
  }

  // Getter y Setter para #context
  get context () {
    return this.#context
  }

  set context (value) {
    this.#context = value
  }

  // Getter y Setter para #thumbnailsContainer
  get thumbnailsContainer () {
    return this.#thumbnailsContainer
  }

  set thumbnailsContainer (value) {
    this.#thumbnailsContainer = value
  }

  // Getter y Setter para #image
  get image () {
    return this.#image
  }

  set image (value) {
    this.#image = value
  }

  // Getter y Setter para #originalImageData
  get originalImageData () {
    return this.#originalImageData
  }

  set originalImageData (value) {
    this.#originalImageData = value
  }

  // Getter y Setter para #selectedFilter
  get selectedFilter () {
    return this.#selectedFilter
  }

  set selectedFilter (value) {
    this.#selectedFilter = value
  }

  // Getter y Setter para #filtersContainer
  get filtersContainer () {
    return this.#filtersContainer
  }

  set filtersContainer (value) {
    this.#filtersContainer = value
  }

  // Getter y Setter para #brightenEnhanceFilter
  get brightenEnhanceFilter () {
    return this.#brightenEnhanceFilter
  }

  set brightenEnhanceFilter (value) {
    this.#brightenEnhanceFilter = value
  }

  // Getter y Setter para #uploadInput
  get uploadInput () {
    return this.#uploadInput
  }

  set uploadInput (value) {
    this.#uploadInput = value
  }

  // Getter y Setter para #uploadButton
  get uploadButton () {
    return this.#uploadButton
  }

  set uploadButton (value) {
    this.#uploadButton = value
  }
}
