import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const importantInfoParam = searchParams.get("importantInfo")

    if (!importantInfoParam) {
      return NextResponse.json(
        { error: "缺少 importantInfo 参数" },
        { status: 400 }
      )
    }

    const importantInfo = JSON.parse(importantInfoParam)
    const count = importantInfo.length
    const isCompressed = count === 1 && importantInfo[0].includes("摘要")

    return NextResponse.json({
      importantInfo,
      count,
      isCompressed,
    })
  } catch (error) {
    console.error("Important Info API Error:", error)
    return NextResponse.json(
      { error: "获取重要信息失败" },
      { status: 500 }
    )
  }
}
