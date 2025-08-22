import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Home, Search, ArrowLeft } from "lucide-react"

export default function CompanyNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mb-6">
            <Building2 className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">企業が見つかりません</h1>
            <p className="text-muted-foreground">
              お探しの企業は存在しないか、削除された可能性があります。
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/search" className="block">
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                企業を検索する
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>

            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              前のページに戻る
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              お困りの場合は
            </p>
            <Link href="/contact" className="text-sm text-primary hover:underline">
              サポートにお問い合わせ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}