import History from "@/components/store/profile/history";

export default async function ViewedProductsPage({params}: {params: Promise<{page: string}>}) {
  const { page } = await params;
  return (
    <History page={parseInt(page)} />
  )
}
