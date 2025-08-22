"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/toast-container"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import { MessageCircle, Mail, FileText, Send } from "lucide-react"
import type { Company } from "@/lib/supabase"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company & { industries?: string[]; technologies?: string[] }
  onStartChat?: (companyId: string, message: string) => void
}

const contactMethods = [
  { value: "modal", label: "Direct Message", icon: MessageCircle, description: "Send a direct message through our platform" },
  { value: "email", label: "Email Contact", icon: Mail, description: "Request email introduction" },
  { value: "chat", label: "Live Chat", icon: MessageCircle, description: "Start a real-time conversation" },
  { value: "inquiry", label: "Formal Inquiry", icon: FileText, description: "Submit a formal business inquiry" }
]

const priorities = [
  { value: "low", label: "Low Priority", description: "General inquiry or future consideration" },
  { value: "normal", label: "Normal Priority", description: "Standard business inquiry" },
  { value: "high", label: "High Priority", description: "Urgent project requirement" },
  { value: "urgent", label: "Urgent", description: "Immediate response needed" }
]

export function ContactModal({ isOpen, onClose, company, onStartChat }: ContactModalProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  
  const [formData, setFormData] = useState({
    contactMethod: "modal",
    subject: "",
    message: "",
    priority: "normal"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      addToast({
        type: "warning",
        title: "Login Required",
        description: "Please log in to contact companies"
      })
      return
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please fill in both subject and message fields"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Handle different contact methods
      switch (formData.contactMethod) {
        case "chat":
          if (onStartChat) {
            onStartChat(company.id, formData.message)
            addToast({
              type: "success",
              title: "Chat Started",
              description: `Started chat with ${company.company_name}`
            })
            onClose()
            return
          }
          break
          
        case "modal":
        case "email":
        case "inquiry":
          // Save contact history if Supabase is available
          if (isSupabaseAvailable() && !user.is_guest) {
            const { error } = await supabase!
              .from('contact_history')
              .insert({
                buyer_id: user.id,
                company_id: company.id,
                contact_method: formData.contactMethod,
                subject: formData.subject,
                initial_message: formData.message,
                priority: formData.priority,
                status: 'sent'
              })

            if (error) throw error
          }

          // For demo purposes, simulate different contact methods
          let successMessage = ""
          switch (formData.contactMethod) {
            case "modal":
              successMessage = `Message sent to ${company.company_name}`
              break
            case "email":
              successMessage = `Email introduction requested with ${company.company_name}`
              break
            case "inquiry":
              successMessage = `Formal inquiry submitted to ${company.company_name}`
              break
          }

          addToast({
            type: "success",
            title: "Contact Successful",
            description: successMessage
          })
          break
      }

      // Reset form and close modal
      setFormData({
        contactMethod: "modal",
        subject: "",
        message: "",
        priority: "normal"
      })
      onClose()

    } catch (error) {
      console.error("Error sending contact:", error)
      addToast({
        type: "error",
        title: "Contact Failed",
        description: "Failed to send contact message. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            Contact {company.company_name}
          </DialogTitle>
          <DialogDescription>
            Send a message to {company.company_name} to discuss your project requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Method Selection */}
          <div className="space-y-2">
            <Label htmlFor="contactMethod">Contact Method</Label>
            <Select 
              value={formData.contactMethod} 
              onValueChange={(value) => handleInputChange("contactMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                {contactMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-xs text-muted-foreground">{method.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div>
                      <div className="font-medium">{priority.label}</div>
                      <div className="text-xs text-muted-foreground">{priority.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., React Development Project Inquiry"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Please describe your project requirements, timeline, budget range, and any specific questions you have for this company..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={6}
              required
            />
            <div className="text-xs text-muted-foreground">
              Minimum 20 characters ({formData.message.length}/20)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formData.message.length < 20}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}