import { getUserFollowedStores } from "@/actions/profile";
import FollowingContainer from "@/components/store/profile/following-container";

export default async function ProfileFollowedStoresPage({params}: {params: Promise<{page: string}>}) {
  const {page} = await params;

  const res = await getUserFollowedStores(parseInt(page));

  return (
    <div className="bg-white py-4 px-6">
      <h1 className="text-lg mb-3 font-bold">Stores you follow</h1>
      <FollowingContainer
        stores={res.stores}
        page={parseInt(page)}
        totalPages={res.totalPages}
      />
    </div>
  );
}
