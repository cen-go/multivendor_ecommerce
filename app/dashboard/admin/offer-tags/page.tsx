// Queries
import { getAllOfferTags } from "@/actions/offer-tag";

// Data table
import DataTable from "@/components/ui/data-table";

// Plus icon
import { Plus } from "lucide-react";

// Offer tag details
import OfferTagDetails from "@/components/dashboard/forms/offer-tag-details";

// Columns
import { columns } from "./columns";

export default async function AdminOfferTagsPage() {
  // Fetching offer tags data from the database
  const offerTags = await getAllOfferTags();

  // Checking if no offer tags are found
  if (!offerTags) return null; // If no offer tags found, return null

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create offer tag
        </>
      }
      modalChildren={<OfferTagDetails />}
      filterValue="name"
      data={offerTags}
      searchPlaceHolder="Search offer tags"
      columns={columns}
    />
  );
}