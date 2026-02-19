'use client'

import { useState, useRef } from 'react'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ImageUploadCardProps {
  onAnalyze: (file: File) => Promise<void>
  isAnalyzing: boolean
}

export function ImageUploadCard({ onAnalyze, isAnalyzing }: ImageUploadCardProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 2000)
    }
    reader.readAsDataURL(file)

    // Trigger analysis
    await onAnalyze(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2 border-border p-8">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleClick}
          className="flex flex-col items-center justify-center gap-4 cursor-pointer"
        >
          {!preview ? (
            <>
              <div className="rounded-lg bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Upload Shelf Image</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to upload a photo of your shelf
                </p>
              </div>
            </>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={preview}
                  alt="Shelf preview"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="space-y-2">
                {uploadSuccess && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{fileName} uploaded successfully</span>
                  </div>
                )}
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm text-info">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-info border-t-transparent" />
                    <span>Analyzing shelf layout with AI...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview && (
        <Button
          onClick={handleClick}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Upload Different Image
        </Button>
      )}
    </div>
  )
}
