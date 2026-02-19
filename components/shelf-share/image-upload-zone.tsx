"use client"

import { useRef, useState } from "react"

interface ImageUploadZoneProps {
  onImageSelect: (file: File) => void
  isLoading?: boolean
}

export function ImageUploadZone({ onImageSelect, isLoading = false }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onImageSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8">
      {preview ? (
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-md mx-auto">
            <img src={preview} alt="Shelf preview" className="w-full h-auto rounded-lg border border-border" />
          </div>
          <button
            onClick={() => {
              setPreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
            className="mx-auto px-4 py-2 rounded-md bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Clear & Upload New
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 py-12 cursor-pointer transition-colors ${
            isDragging ? "bg-primary/10" : ""
          }`}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop your shelf photo here" : "Drag and drop your shelf photo"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG, or WebP • Up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
              Analyzing shelf...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
