'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Loader2, PenTool, Target, Palette, FileText } from 'lucide-react'
import { BlogRequest } from '@/types/blog-team'

interface BlogCreationFormProps {
  onSubmit: (request: BlogRequest) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function BlogCreationForm({ onSubmit, onCancel, isLoading = false }: BlogCreationFormProps) {
  // Check for agent-extracted data on mount
  const getInitialFormData = (): BlogRequest => {
    // Try blog_form_data first, then agent_extracted_data
    const blogFormDataStr = sessionStorage.getItem("blog_form_data");
    const extractedDataStr = sessionStorage.getItem("agent_extracted_data");
    
    const dataStr = blogFormDataStr || extractedDataStr;
    
    if (dataStr) {
      try {
        const extractedData = JSON.parse(dataStr);
        console.log("📝 Loading form data:", extractedData);
        
        // Clear both after reading
        sessionStorage.removeItem("blog_form_data");
        sessionStorage.removeItem("agent_extracted_data");
        
        return {
          topic: extractedData.topic || extractedData.title || '',
          reference_urls: extractedData.reference_urls || [],
          target_word_count: extractedData.target_word_count || 1500,
          tone: extractedData.tone || 'professional',
          additional_instructions: extractedData.additional_instructions || '',
          seo_keywords: extractedData.seo_keywords || []
        };
      } catch (e) {
        console.error("Error parsing extracted data:", e);
      }
    }
    
    return {
      topic: '',
      reference_urls: [],
      target_word_count: 1500,
      tone: 'professional',
      additional_instructions: '',
      seo_keywords: []
    };
  };
  
  const [formData, setFormData] = useState<BlogRequest>(getInitialFormData())
  
  const [urlInput, setUrlInput] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
    { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
    { value: 'technical', label: 'Technical', description: 'Detailed and precise' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'formal', label: 'Formal', description: 'Structured and official' },
    { value: 'creative', label: 'Creative', description: 'Engaging and imaginative' }
  ]

  const wordCountPresets = [
    { value: 800, label: 'Short (800 words)' },
    { value: 1500, label: 'Medium (1,500 words)' },
    { value: 2500, label: 'Long (2,500 words)' },
    { value: 4000, label: 'Extended (4,000 words)' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required'
    }

    if (formData.target_word_count < 500) {
      newErrors.target_word_count = 'Minimum word count is 500'
    }

    if (formData.target_word_count > 5000) {
      newErrors.target_word_count = 'Maximum word count is 5,000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const addUrl = () => {
    if (urlInput.trim() && !formData.reference_urls.includes(urlInput.trim())) {
      setFormData(prev => ({
        ...prev,
        reference_urls: [...prev.reference_urls, urlInput.trim()]
      }))
      setUrlInput('')
    }
  }

  const removeUrl = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      reference_urls: prev.reference_urls.filter(url => url !== urlToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && urlInput.trim()) {
      e.preventDefault()
      addUrl()
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo_keywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seo_keywords: [...(prev.seo_keywords || []), keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seo_keywords: (prev.seo_keywords || []).filter(kw => kw !== keywordToRemove)
    }))
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PenTool className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Blog Article
          </CardTitle>
        </div>
        <CardDescription className="text-lg">
          Let our AI agents research, write, and optimize your blog article with images
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Article Topic *
            </Label>
            <Input
              id="topic"
              placeholder="e.g., The Future of AI in Healthcare"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              className={`text-base ${errors.topic ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.topic && (
              <p className="text-sm text-red-500">{errors.topic}</p>
            )}
            <p className="text-sm text-gray-600">
              Describe what you want to write about. Our research agent will gather relevant information.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reference URLs (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={addUrl}
                disabled={!urlInput.trim() || isLoading}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.reference_urls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.reference_urls.map((url, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <span className="truncate max-w-[200px]">{url}</span>
                    <Button
                      type="button"
                      onClick={() => removeUrl(url)}
                      disabled={isLoading}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600">
              Add specific sources you want our research agent to analyze and reference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="word-count" className="text-base font-semibold">
                Target Word Count
              </Label>
              <div className="space-y-2">
                <Input
                  id="word-count"
                  type="number"
                  min="500"
                  max="5000"
                  step="100"
                  value={formData.target_word_count}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    target_word_count: parseInt(e.target.value) || 1500 
                  }))}
                  className={errors.target_word_count ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                <div className="flex flex-wrap gap-1">
                  {wordCountPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      type="button"
                      variant={formData.target_word_count === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, target_word_count: preset.value }))}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              {errors.target_word_count && (
                <p className="text-sm text-red-500">{errors.target_word_count}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Writing Tone
              </Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              SEO Keywords (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AI healthcare, machine learning"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={addKeyword}
                disabled={!keywordInput.trim() || isLoading}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.seo_keywords && formData.seo_keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.seo_keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                    <span>{keyword}</span>
                    <Button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      disabled={isLoading}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-blue-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600">
              Add specific keywords you want to target for SEO optimization.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-base font-semibold">
              Additional Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              placeholder="Any specific requirements, focus areas, or style preferences..."
              value={formData.additional_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, additional_instructions: e.target.value }))}
              className="min-h-[100px] resize-y"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600">
              Provide any specific guidance for our AI writer agent.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !formData.topic.trim()}
              className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Article...
                </>
              ) : (
                <>
                  <PenTool className="mr-2 h-5 w-5" />
                  Create Blog Article
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Research Agent</strong> will analyze your topic and gather information</p>
              <p>• <strong>SEO Agent</strong> will identify keywords and optimize for search</p>
              <p>• <strong>Writer Agent</strong> will create engaging, well-structured content</p>
              <p>• <strong>Image Agents</strong> will generate and find relevant visuals</p>
              <p>• <strong>Compiler Agent</strong> will assemble everything into a polished article</p>
              <p>• You'll review and can request changes before publishing</p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default BlogCreationForm
