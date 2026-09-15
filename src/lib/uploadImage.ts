const MAX_DIMENSION = 512
const JPEG_QUALITY = 0.8

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("تعذر قراءة الصورة"))
    reader.readAsDataURL(file)
  })

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("صورة غير صالحة"))
    image.src = src
  })

export async function uploadImage(file: File): Promise<string> {
  const source = await readAsDataUrl(file)

  const image = await loadImage(source)

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) throw new Error("المتصفح لا يدعم تحرير الصور")

  context.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY)
}