"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const params = new URLSearchParams({
      name: formData.name,
      company: formData.company || "未入力",
      message: `【${formData.inquiryType}】${formData.subject}\n\n${formData.message}`,
    })

    router.push(`/contact/chat?${params.toString()}`)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">お問い合わせ</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ご質問やご相談がございましたら、お気軽にお問い合わせください。
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせ先</CardTitle>
                <CardDescription>以下の方法でもお問い合わせいただけます</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium">メール</p>
                    <p className="text-gray-600">support@vnoffshore.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium">電話</p>
                    <p className="text-gray-600">03-1234-5678</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium">住所</p>
                    <p className="text-gray-600">
                      東京都渋谷区渋谷1-1-1
                      <br />
                      渋谷ビル10F
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium">営業時間</p>
                    <p className="text-gray-600">
                      平日 9:00 - 18:00
                      <br />
                      (土日祝日を除く)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせフォーム</CardTitle>
                <CardDescription>必要事項をご入力の上、送信してください</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">お名前 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">メールアドレス *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">会社名</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inquiryType">お問い合わせ種別 *</Label>
                    <Select value={formData.inquiryType} onValueChange={(value) => handleChange("inquiryType", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="お問い合わせ種別を選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">一般的なお問い合わせ</SelectItem>
                        <SelectItem value="technical">技術的なサポート</SelectItem>
                        <SelectItem value="business">ビジネス提携</SelectItem>
                        <SelectItem value="account">アカウントについて</SelectItem>
                        <SelectItem value="billing">料金について</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">件名 *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">お問い合わせ内容 *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      rows={6}
                      className="mt-1"
                      placeholder="お問い合わせ内容を詳しくご記入ください"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    {isSubmitting ? "送信中..." : "チャットで相談する"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
