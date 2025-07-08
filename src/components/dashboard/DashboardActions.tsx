import Link from "next/link";
import { FiPlus, FiGrid } from "react-icons/fi";

export default function DashboardActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      <Link href="/create-poem" className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl p-4 transition group">
        <FiPlus className="text-blue-600 text-2xl group-hover:scale-110 transition-transform" />
        <span className="font-medium text-blue-700">Yeni Şiir Ekle</span>
      </Link>
      
      <Link href="/dashboard/collections" className="flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl p-4 transition group">
        <FiGrid className="text-indigo-600 text-2xl group-hover:scale-110 transition-transform" />
        <span className="font-medium text-indigo-700">Koleksiyonlarım</span>
      </Link>
    </div>
  );
}
