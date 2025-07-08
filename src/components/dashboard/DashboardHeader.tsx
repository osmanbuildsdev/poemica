import { useSession } from "next-auth/react";
import ProfileAvatar from "@/components/ProfileAvatar";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hoş geldin{user?.name ? `, ${user.name}` : "!"}</h1>
        <p className="text-gray-500 mt-1">Burası şiirlerinin ve istatistiklerinin merkezi.</p>
      </div>
      {user && (
        <ProfileAvatar 
          user={{
            id: user.id,
            name: user.name,
            image: user.image
          }}
          size="lg"
        />
      )}
    </div>
  );
}
