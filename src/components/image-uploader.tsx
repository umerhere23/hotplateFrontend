"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, Camera, ArrowUp, Trash2, CropIcon, Sliders, ImageIcon, Check, X, Maximize2 } from "lucide-react"
import Cropper from "react-easy-crop"
import "react-easy-crop/react-easy-crop.css"

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void
  initialImage?: string
}

type FilterType = "normal" | "vivid" | "bw" | "sepia"

interface FilterOption {
  name: string
  filter: string
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageUploader({ onImageSelect, initialImage }: ImageUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null)
  const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null)
  const [isEditing, setIsEditing] = useState(false)
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [activeTab, setActiveTab] = useState<"crop" | "adjust" | "filter">("crop")
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("normal")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const filterOptions: Record<FilterType, FilterOption> = {
    normal: { name: "Normal", filter: "brightness(100%) contrast(100%)" },
    vivid: { name: "Vivid", filter: "brightness(110%) contrast(120%) saturate(130%)" },
    bw: { name: "B&W", filter: "grayscale(100%)" },
    sepia: { name: "Sepia", filter: "sepia(80%)" },
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsEditing(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const imageDataUrl = reader.result as string
        setSelectedImage(imageDataUrl)
        setOriginalImage(imageDataUrl)
        setIsModalOpen(false)
        setIsEditing(true)
        // Reset editing options when a new image is loaded
        setBrightness(100)
        setContrast(100)
        setSelectedFilter("normal")
        setZoom(1)
        setCrop({ x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const imageDataUrl = reader.result as string
        setSelectedImage(imageDataUrl)
        setOriginalImage(imageDataUrl)
        setIsModalOpen(false)
        setIsEditing(true)
        // Reset editing options when a new image is loaded
        setBrightness(100)
        setContrast(100)
        setSelectedFilter("normal")
        setZoom(1)
        setCrop({ x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    // In a real implementation, this would open the device camera
    alert("Camera functionality would be implemented here")
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.setAttribute("crossOrigin", "anonymous")
      image.src = url
    })

  const getCroppedImg = async (imageSrc: string, pixelCrop: CropArea, filter: string): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return imageSrc
    }

    // Set canvas size to the cropped size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Apply filters
    ctx.filter = filter

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    )

    // As a blob
    return canvas.toDataURL("image/jpeg")
  }

  const applyEdits = async () => {
    if (!originalImage || !croppedAreaPixels) return

    try {
      const currentFilter = `${filterOptions[selectedFilter].filter} brightness(${brightness}%) contrast(${contrast}%)`
      const croppedImage = await getCroppedImg(originalImage, croppedAreaPixels, currentFilter)

      setSelectedImage(croppedImage)
      onImageSelect(croppedImage)
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    }
  }

  const deleteImage = () => {
    setSelectedImage(null)
    setOriginalImage(null)
    onImageSelect("")
  }

  const editImage = () => {
    setIsEditing(true)
    // When re-editing, make sure we're working with the original image
    if (originalImage) {
      setSelectedImage(originalImage)
    }
  }

  // Get the current filter style
  const getCurrentFilterStyle = () => {
    return `${filterOptions[selectedFilter].filter} brightness(${brightness}%) contrast(${contrast}%)`
  }

  // Toggle fullscreen preview
  const toggleFullscreenPreview = () => {
    setIsFullscreenPreview(!isFullscreenPreview)
  }

  return (
    <div>
      {!selectedImage ? (
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-2 p-3 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors w-full"
        >
          <Upload size={18} />
          <span>Upload photo</span>
        </button>
      ) : (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Event"
            className="w-full h-48 object-cover"
            ref={imageRef}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={toggleFullscreenPreview}
              className="p-2 bg-gray-900 bg-opacity-70 rounded-md text-white hover:bg-opacity-90 transition-opacity"
              title="View full image"
            >
              <Maximize2 size={16} />
            </button>
            <button
              type="button"
              onClick={editImage}
              className="p-2 bg-gray-900 bg-opacity-70 rounded-md text-white hover:bg-opacity-90 transition-opacity"
              title="Edit image"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              onClick={deleteImage}
              className="p-2 bg-red-500 bg-opacity-70 rounded-md text-white hover:bg-opacity-90 transition-opacity"
              title="Delete image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-md p-8 mb-4 flex flex-col items-center justify-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{ minHeight: "200px" }}
            >
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <ArrowUp size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-700 mb-4">Drop photo here</p>

              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={openFileDialog}
                className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Upload size={18} />
                <span>From device</span>
              </button>
              <button
                type="button"
                onClick={openCamera}
                className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Camera size={18} />
                <span>Camera</span>
              </button>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="w-full p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {isFullscreenPreview && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={toggleFullscreenPreview}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              type="button"
              onClick={toggleFullscreenPreview}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-opacity"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {isEditing && originalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
          <div className="flex-1 relative">
            <div className="absolute inset-0">
              {activeTab === "crop" ? (
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={undefined}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  style={{
                    containerStyle: {
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#000",
                    },
                    cropAreaStyle: {
                      filter: getCurrentFilterStyle(),
                    },
                    mediaStyle: {
                      filter: getCurrentFilterStyle(),
                    },
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={originalImage || "/placeholder.svg"}
                    alt="Preview"
                    style={{
                      maxHeight: "70vh",
                      maxWidth: "100%",
                      filter: getCurrentFilterStyle(),
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="bg-white p-4">
            <div className="flex justify-center mb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("crop")}
                className={`px-4 py-2 ${activeTab === "crop" ? "border-b-2 border-black" : ""}`}
              >
                <CropIcon size={20} className="mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("adjust")}
                className={`px-4 py-2 ${activeTab === "adjust" ? "border-b-2 border-black" : ""}`}
              >
                <Sliders size={20} className="mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("filter")}
                className={`px-4 py-2 ${activeTab === "filter" ? "border-b-2 border-black" : ""}`}
              >
                <ImageIcon size={20} className="mx-auto" />
              </button>
            </div>

            {activeTab === "crop" && (
              <div className="mb-4">
                <label className="block text-sm mb-1">Zoom</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {activeTab === "adjust" && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm mb-1">Brightness</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Contrast</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {activeTab === "filter" && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {(Object.keys(filterOptions) as FilterType[]).map((filter) => (
                  <div
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`cursor-pointer p-1 rounded ${selectedFilter === filter ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="relative">
                      <div
                        className="w-full h-16 overflow-hidden rounded"
                        style={{
                          backgroundImage: `url(${originalImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: filterOptions[filter].filter,
                        }}
                      />
                      <div className="text-center text-xs mt-1">{filterOptions[filter].name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <button type="button" onClick={closeModal} className="p-2 rounded-full">
                <X size={24} />
              </button>
              <button type="button" onClick={applyEdits} className="p-2 rounded-full text-blue-500">
                <Check size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
