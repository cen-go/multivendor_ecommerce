"use client"

import { Category, OfferTag } from '@prisma/client'
import { useState } from 'react';
import CategoriesMenu from './categories-menu';
import OfferTagsLinks from './offer-tags-links';

export default function CategoriesHeaderContainer({
  categories,
  offerTags,
}: {
  categories: Category[];
  offerTags: OfferTag[];
}) {
  const [ open, setOpen] = useState<boolean>(false);

  return (
    <div className="w-full px-4 flex items-center gap-x-1">
      {/* Category menu */}
      <CategoriesMenu categories={categories} open={open} setOpen={setOpen} />
      {/* Offer tags links */}
      <OfferTagsLinks offerTags={offerTags} />
    </div>
  );
}
