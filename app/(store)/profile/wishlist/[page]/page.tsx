import { getUserWishlist } from "@/actions/profile";
import WishlistContainer from "@/components/store/profile/wishlist-container";

export default async function ProfileWishlistPage({params}: {params: Promise<{page: string}>}) {
  const { page } = await params;

  const wishlist_data = await getUserWishlist(parseInt(page));
  const { wishlist, totalPages } = wishlist_data;

  return (
    <div className="bg-white py-4 px-6">
      <h1 className="text-lg mb-3 font-bold">Your Wishlist</h1>
      {wishlist.length > 0 ? (
        <WishlistContainer
          products={wishlist}
          page={parseInt(page)}
          totalPages={totalPages}
        />
      ) : (
        <div>No products</div>
      )}
    </div>
  );
}
