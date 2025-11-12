import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Tableau de bord", path: "/admin" },
  { label: "Produits", path: "/admin/produits" },
  { label: "Catégories", path: "/admin/categories" },
  { label: "Clients", path: "/admin/clients" },
  { label: "Commandes", path: "/admin/commandes" },
  { label: "Stocks", path: "/admin/stocks" },
  { label: "Avis", path: "/admin/avis" },
  { label: "Retours", path: "/admin/retours" },
  { label: "Paiements", path: "/admin/paiements" },
  { label: "Livraisons", path: "/admin/livraisons" },
  { label: "Adresses", path: "/admin/adresses" },
  { label: "Favoris", path: "/admin/favoris" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8 text-blue-600">T-Express Admin</h2>
      <nav>
        <ul className="space-y-3">
          {menu.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`block px-4 py-2 rounded hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors ${
                  pathname === item.path ? "bg-blue-100 text-blue-700" : "text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
