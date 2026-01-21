import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month"); // Format: YYYY-MM
        const year = searchParams.get("year");

        let whereClause = {};
        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            whereClause = {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            };
        }

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("GET /api/transactions error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const { amount, date, category, description, type, paid } = json;

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                date: new Date(date),
                category,
                description,
                type,
                paid: paid ?? true,
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("POST /api/transactions error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
