
export default async function ViewedProductsPage({params}: {params: Promise<{page: string}>}) {
  const { page } = await params;
  return (
    <div>ViewedProductsPage {page}</div>
  )
}
