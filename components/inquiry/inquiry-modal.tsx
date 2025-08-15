"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, Star, MapPin, Users } from "lucide-react"
import type { Company } from "@/lib/supabase"

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company & {
    industries?: string[]
    technologies?: string[]
  }
  onStartChat: (companyId: string, initialMessage: string) => void
}

export function InquiryModal({ isOpen, onClose, company, onStartChat }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    contactPerson: "",
    email: "",
    companyName: "",
    projectType: "",
    budget: "",
    timeline: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create initial message from form data
    const initialMessage = `Hello! I'm ${formData.contactPerson} from ${formData.companyName}.

Project Type: ${formData.projectType}
Budget: ${formData.budget}
Timeline: ${formData.timeline}

Message: ${formData.message}

I'd like to discuss this project with your team. Please let me know if you're available for a consultation.`

    // Start chat with the company
    onStartChat(company.id, initialMessage)

    // Reset form and close modal
    setFormData({
      contactPerson: "",
      email: "",
      companyName: "",
      projectType: "",
      budget: "",
      timeline: "",
      message: "",
    })
    setIsSubmitting(false)
    onClose()
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
      />
    ))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" />
            Contact {company.company_name}
          </DialogTitle>
          <DialogDescription>Send an inquiry to start a conversation with this development team.</DialogDescription>
        </DialogHeader>

        {/* Company Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={company.logo_url || "/placeholder.svg"} />
              <AvatarFallback>{company.company_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{company.company_name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {company.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {company.employee_count} employees
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {renderStars(company.average_rating)}
                  <span className="text-sm font-medium">{company.average_rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">({company.total_reviews} reviews)</span>
              </div>
              <div className="text-sm font-medium text-primary mt-1">
                ${company.hourly_rate_min}-${company.hourly_rate_max} USD/hour
              </div>
            </div>
          </div>

          {/* Technologies */}
          {company.technologies && company.technologies.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {company.technologies.slice(0, 6).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {company.technologies.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{company.technologies.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
              placeholder="Your company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type *</Label>
            <Select
              value={formData.projectType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, projectType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="mobile-app">Mobile App Development</SelectItem>
                <SelectItem value="ecommerce">E-commerce Platform</SelectItem>
                <SelectItem value="enterprise-software">Enterprise Software</SelectItem>
                <SelectItem value="ai-ml">AI/Machine Learning</SelectItem>
                <SelectItem value="blockchain">Blockchain Development</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <Select
                value={formData.budget}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-10k">Under $10,000</SelectItem>
                  <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                  <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                  <SelectItem value="250k-plus">$250,000+</SelectItem>
                  <SelectItem value="discuss">Prefer to discuss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Select
                value={formData.timeline}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, timeline: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="2-3-months">2-3 months</SelectItem>
                  <SelectItem value="3-6-months">3-6 months</SelectItem>
                  <SelectItem value="6-months-plus">6+ months</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Project Details *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Please describe your project requirements, goals, and any specific technologies or features you need..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Start Conversation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
