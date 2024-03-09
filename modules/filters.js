// Clase base para filtros
export class Filter {
}

// Clase para filtro de mejora de brillo
export class BrightenEnhanceFilter extends Filter {
  constructor (brightnessLevel = 0) {
    super()
    this.brightnessLevel = brightnessLevel
  }

  // Método para aplicar el filtro de mejora de brillo
  applyFilter (imageData) {
    const data = imageData.data
    const brightnessLevel = this.brightnessLevel

    if (brightnessLevel !== 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] += brightnessLevel
        data[i + 1] += brightnessLevel
        data[i + 2] += brightnessLevel
      }
    }
  }
}

// Clase para filtro de escala de grises
export class GrayscaleFilter extends Filter {
  // Método para aplicar el filtro de escala de grises
  applyFilter (imageData) {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const average = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = average
      data[i + 1] = average
      data[i + 2] = average
    }
  }
}

// Clase para filtro de negativo
export class NegativeFilter extends Filter {
  // Método para aplicar el filtro de negativo
  applyFilter (imageData) {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]
      data[i + 1] = 255 - data[i + 1]
      data[i + 2] = 255 - data[i + 2]
    }
  }
}

// Clase para filtro de espejo horizontal
export class MirrorHorizontalFilter extends Filter {
  // Método para aplicar el filtro de espejo horizontal
  applyFilter (imageData) {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const index1 = (y * width + x) * 4
        const index2 = (y * width + (width - 1 - x)) * 4

        const tempR = data[index1]
        const tempG = data[index1 + 1]
        const tempB = data[index1 + 2]

        data[index1] = data[index2]
        data[index1 + 1] = data[index2 + 1]
        data[index1 + 2] = data[index2 + 2]

        data[index2] = tempR
        data[index2 + 1] = tempG
        data[index2 + 2] = tempB
      }
    }
  }
}

// Clase para filtro de sepia
export class SepiaFilter extends Filter {
  // Método para aplicar el filtro sepia
  applyFilter (imageData) {
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const tr = 0.393 * r + 0.769 * g + 0.189 * b
      const tg = 0.349 * r + 0.686 * g + 0.168 * b
      const tb = 0.272 * r + 0.534 * g + 0.131 * b

      data[i] = tr < 255 ? tr : 255
      data[i + 1] = tg < 255 ? tg : 255
      data[i + 2] = tb < 255 ? tb : 255
    }
  }
}

// Clase para filtro de pixel
export class PixelateFilter extends Filter {
  constructor () {
    super()
    this.blockSize = 22
  }

  // Método para aplicar el filtro
  applyFilter (imageData) {
    const data = imageData.data
    const width = imageData.width

    for (let y = 0; y < imageData.height; y += this.blockSize) {
      for (let x = 0; x < width; x += this.blockSize) {
        this.averageColors(imageData, data, width, x, y)
      }
    }
  }

  // Método para promediar los colores en un bloque
  averageColors (imageData, data, width, startX, startY) {
    const blockSize = this.blockSize

    let sumRed = 0
    let sumGreen = 0
    let sumBlue = 0

    for (let y = 0; y < blockSize && startY + y < imageData.height; y++) {
      for (let x = 0; x < blockSize && startX + x < width; x++) {
        const index = ((startY + y) * width + startX + x) * 4

        sumRed += data[index]
        sumGreen += data[index + 1]
        sumBlue += data[index + 2]
      }
    }

    const numPixels = Math.min(blockSize, imageData.height - startY) * Math.min(blockSize, width - startX)
    const avgRed = sumRed / numPixels
    const avgGreen = sumGreen / numPixels
    const avgBlue = sumBlue / numPixels

    for (let y = 0; y < blockSize && startY + y < imageData.height; y++) {
      for (let x = 0; x < blockSize && startX + x < width; x++) {
        const index = ((startY + y) * width + startX + x) * 4

        data[index] = avgRed
        data[index + 1] = avgGreen
        data[index + 2] = avgBlue
      }
    }
  }
}

// Clase para filtro de limpiar lienzo
export class ClearCanvasFilter extends Filter {
  // Método para aplicar el filtro de limpiar lienzo
  applyFilter () {
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')
    const width = 300
    const height = 150

    context.clearRect(0, 0, canvas.width, canvas.height)
    canvas.width = width
    canvas.height = height

    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)
  }
}

// Clase para filtro de guardar contenido de lienzo
export class SaveCanvasContentFilter extends Filter {
  // Método para guardar el contenido del lienzo
  saveCanvasContent () {
    const canvasId = 'canvas'
    const canvas = document.getElementById(canvasId)

    if (!canvas) {
      console.error(`Canvas element with id '${canvasId}' not found.`)
      return
    }

    const { width, height } = canvas
    const startX = width / 2 + 5
    const widthToCapture = width / 2 - 5
    const heightToCapture = height

    const tempCanvas = this.createTempCanvas(canvas, startX, 0, widthToCapture, heightToCapture)

    this.downloadCanvasImage(tempCanvas)
  }

  // Método para crear un lienzo temporal
  createTempCanvas (originalCanvas, startX, startY, widthToCapture, heightToCapture) {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = widthToCapture
    tempCanvas.height = heightToCapture
    const tempContext = tempCanvas.getContext('2d')

    tempContext.drawImage(
      originalCanvas,
      startX,
      startY,
      widthToCapture,
      heightToCapture,
      0,
      0,
      widthToCapture,
      heightToCapture
    )

    return tempCanvas
  }

  // Método para descargar la imagen del lienzo
  downloadCanvasImage (canvas) {
    const link = document.createElement('a')
    link.download = 'imgFilter.jpg'
    link.href = canvas.toDataURL('image/jpeg', 1)
    link.click()
  }
}
