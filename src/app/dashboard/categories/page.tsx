import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createCategory, deleteCategory } from "@/features/category/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

export default async function CategoriesPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const categories = await prisma.category.findMany({
    where: { familyId: member.familyId },
    orderBy: { type: "asc" },
  });

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Kategori</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="flex flex-wrap gap-2">
            <Input
              name="name"
              placeholder="Nama kategori"
              required
              className="min-w-[160px] flex-1"
            />
            <select
              name="type"
              required
              className="flex h-8 min-w-[140px] items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>
            <Input
              name="color"
              type="color"
              defaultValue="#6366F1"
              className="h-8 w-9 p-0.5"
            />
            <Button type="submit">
              <Plus className="size-4" />
              Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Pemasukan</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={incomeCategories}
            onDelete={deleteCategory}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={expenseCategories}
            onDelete={deleteCategory}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryList({
  categories,
  onDelete,
}: {
  categories: { id: string; name: string; color: string }[];
  onDelete: (formData: FormData) => Promise<void>;
}) {
  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Belum ada kategori.</p>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-4 w-4 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span>{cat.name}</span>
          </div>
          <form action={onDelete}>
            <input type="hidden" name="id" value={cat.id} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
            >
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </form>
        </div>
      ))}
    </div>
  );
}
