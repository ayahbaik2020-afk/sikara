import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { getAccess } from "@/lib/helpers/access";

export async function GET() {
  const member = await getCurrentFamilyMember();
  if (!member || getAccess("backup", member.systemRole) === "none") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const familyId = member.familyId;

  const [
    wallets,
    categories,
    transactions,
    bills,
    savingsGoals,
    assets,
    investments,
    debts,
    receivables,
    setting,
  ] = await Promise.all([
    prisma.wallet.findMany({ where: { familyId } }),
    prisma.category.findMany({ where: { familyId } }),
    prisma.transaction.findMany({ where: { familyId } }),
    prisma.bill.findMany({ where: { familyId } }),
    prisma.savingsGoal.findMany({ where: { familyId } }),
    prisma.asset.findMany({ where: { familyId } }),
    prisma.investment.findMany({ where: { familyId } }),
    prisma.debt.findMany({ where: { familyId } }),
    prisma.receivable.findMany({ where: { familyId } }),
    prisma.setting.findUnique({ where: { familyId } }),
  ]);

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    familyId,
    data: {
      wallets,
      categories,
      transactions,
      bills,
      savingsGoals,
      assets,
      investments,
      debts,
      receivables,
      setting,
    },
  };

  const json = JSON.stringify(backup, null, 2);
  const filename = `sikara-backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
