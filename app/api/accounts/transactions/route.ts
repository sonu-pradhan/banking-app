import { getTransactions } from "@/lib/transaction.action";
import { getCurrentUser } from "@/lib/user.action";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const accountId = searchParams.get("accountId") || undefined;

    const pageParam = Number(searchParams.get("page")) || 1;

    const page = Math.max(1, pageParam);

    const data = await getTransactions(
      user.id,
      accountId,
      page
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Transaction history error:", error);

    return NextResponse.json(
      { message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}