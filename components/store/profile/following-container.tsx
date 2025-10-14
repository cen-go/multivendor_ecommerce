"use client"

import Pagination from "../../shared/pagination";
import StoreCard from "@/components/store/cards/store-card";

interface Props {
  stores: {
    id: string;
    url: string;
    name: string;
    logo: string;
    followersCount: number;
    isUserFollowingStore: boolean;
  }[];
  page: number;
  totalPages: number;
}

export default function FollowingContainer ({ stores, page, totalPages }: Props)  {

  return (
    <div>
      <div className="flex flex-wrap pb-16">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      <Pagination page={page} pathname="/profile/following" totalPages={totalPages} />
    </div>
  );
};