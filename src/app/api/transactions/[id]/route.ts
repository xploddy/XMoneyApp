import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const json = await request.json();
        const { amount, date, category, description, type, paid } = json;

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount: parseFloat(amount) }),
                ...(date && { date: new Date(date) }),
                ...(category && { category }),
                ...(description !== undefined && { description }),
                ...(type && { type }),
                ...(paid !== undefined && { paid }),
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("PATCH /api/transactions/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.transaction.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/transactions/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
