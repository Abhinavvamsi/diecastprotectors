import { prisma } from "@/lib/prisma"
import AdminNav from "@/components/admin-nav"
import { requireOwner } from "@/lib/admin"
import AdminsList from "@/components/admins-list"
export default async function AdminsPage() {

  await requireOwner()

  const admins = await prisma.admin.findMany({
    orderBy: {
      createdAt: "asc",
    },
  })

  return (
    <main className="min-h-screen bg-[#09090B] text-white p-8">

      <div className="max-w-7xl mx-auto">

        <AdminNav />

        <div className="mb-12">

          <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
            Shinsei Diecast Admin
          </p>

          <h1 className="text-5xl font-bold mt-3">
            Admin Management
          </h1>

          <p className="text-zinc-400 mt-3">
            Manage administrators and permissions.
          </p>

        </div>

        <div className="grid gap-6">

          <AdminsList
  initialAdmins={admins}
/>

        </div>

      </div>

    </main>
  )
}