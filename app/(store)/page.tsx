import Image from "next/image";
// Server actions
import { getHomeDataDynamic } from "@/actions/home";
import { getProducts } from "@/actions/product";
// Types
import { SimpleProduct } from "@/lib/types";
// Components
import ProductCard from "@/components/store/cards/product/product-card";
import AnimatedDeals from "@/components/store/home/animated-deals";
import Featured from "@/components/store/home/featured";
import FeaturedCategories from "@/components/store/home/featured-categories";
import HomeMainSwiper from "@/components/store/home/home-main-swiper";
// import HomeSideline from "@/components/store/home/sideline/home-sideline";
import HomeUserCard from "@/components/store/home/user-card/home-user-card";
import MainSwiper from "@/components/store/shared/swiper";

import SuperDealsImg from "@/public/assets/images/ads/super-deals.avif";

export default async function Home() {
  const productsData = await getProducts({}, "", 1, 30);
  const { products } = productsData;

  const {
    products_best_deals,
    products_user_card,
    products_featured,
  } = await getHomeDataDynamic([
    { property: "offer", value: "best-deals", type: "simple" },
    { property: "offer", value: "user-card", type: "simple" },
    { property: "offer", value: "featured", type: "simple" },
  ]);

  return (
    <div className="relative w-full">
      {/* <HomeSideline /> */}
      <div className="w-full h-full bg-[#f5f5f5] overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto min-h-screen p-4">
            {/* Main */}
            <div className="w-full grid gap-2 min-[1170px]:grid-cols-[1fr_350px] min-[1465px]:grid-cols-[200px_1fr_350px]">
              {/* Left */}
              <div
                className="cursor-pointer hidden min-[1465px]:block bg-cover bg-no-repeat rounded-md"
                style={{
                  backgroundImage:
                    "url(/assets/images/ads/retro-gaming-ad.jpg)",
                }}
              />
              {/* Middle */}
              <div className="space-y-2 w-full h-fit min-w-0">
                {/* Main swiper */}
                <HomeMainSwiper />
                {/* Featured card */}
                <Featured
                  products={products_featured.filter(
                    (product): product is SimpleProduct =>
                      "variantSlug" in product
                  )}
                />
              </div>
              {/* Right */}
              <div className="h-full">
                <HomeUserCard
                  products={products_user_card.filter(
                    (product): product is SimpleProduct =>
                      "variantSlug" in product
                  )}
                />
              </div>
            </div>
            
            {/* Animated deals */}
            <div className="mt-4 hidden min-[915px]:block">
              <AnimatedDeals
                products={products_best_deals.filter(
                  (product): product is SimpleProduct =>
                    "variantSlug" in product
                )}
              />
            </div>
            <div className="mt-10 space-y-10">
              <div className="bg-white rounded-md">
                <MainSwiper products={products} type="curved">
                  <div className="mb-4 pl-4 flex items-center justify-between">
                    <Image
                      src={SuperDealsImg}
                      alt="Super deals"
                      width={200}
                      height={50}
                    />
                  </div>
                </MainSwiper>
              </div>

              <FeaturedCategories />

              <div>
                {/* Header */}
                <div className="text-center h-[32px] leading-[32px] text-[24px] font-extrabold text-[#222] flex justify-center">
                  <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
                  <span>More to love</span>
                  <div className="h-[1px] flex-1 border-t-[2px] border-t-[hsla(0,0%,59.2%,.3)] my-4 mx-[14px]" />
                </div>
                <div className="mt-7 bg-white justify-center gap-10 flex flex-wrap min-[1530px]:grid min-[1530px]:grid-cols-7 p-4 pb-26 rounded-md">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
    </div>
  );
}
