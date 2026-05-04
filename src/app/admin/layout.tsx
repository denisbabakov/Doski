import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, Image as ImageIcon, LogOut, FolderOpen, Star, BarChart2 } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Категории", icon: FolderOpen },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/collections", label: "Подборки", icon: Star },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
  { href: "/admin/customers", label: "Клиенты (CRM)", icon: Users },
  { href: "/admin/banners", label: "Баннеры", icon: ImageIcon },
  { href: "/admin/wb", label: "Wildberries", icon: BarChart2 },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <span className="text-white font-bold text-lg">KRZME<span className="text-sky-400"> ADMIN</span></span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-700 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> На сайт
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto text-gray-900">
        {children}
      </main>
    </div>
  );
}
