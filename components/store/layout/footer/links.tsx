import { getRandomSubcategories } from "@/actions/subcategory";
import Link from "next/link";

export default async function Links() {
  const subcategories = await getRandomSubcategories(7, true);

  return (
    <div className="grid md:grid-cols-3 gap-4 mt-5 text-sm">
      {/* Subcategories */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Find it fast</h3>
        <ul className="flex flex-col gap-y-1">
          {subcategories.map(ctg => (
            <li key={ctg.id}>
              <Link href={`/browse?subcategory=${ctg.url}`}>{ctg.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Company Links */}
      <div className="space-y-4 md:mt-10">
        <ul className="flex flex-col gap-y-1">
          {footer_links.slice(0, 6).map((link) => (
            <Link href={link.link} key={link.link}>
              <li>
                <span>{link.title}</span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Customer care</h3>
        <ul className="flex flex-col gap-y-1">
          {footer_links.slice(6).map((link) => (
            <Link href={link.link} key={link.link}>
              <li>
                <span>{link.title}</span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  )
}

const footer_links = [
  {
    title: "About",
    link: "/about",
  },
  {
    title: "Contact",
    link: "/contact",
  },
  {
    title: "Wishlist",
    link: "/profile/wishlist",
  },
  {
    title: "Compare",
    link: "/compare",
  },
  {
    title: "FAQ",
    link: "/faq",
  },
  {
    title: "Store Directory",
    link: "/profile",
  },
  {
    title: "My Account",
    link: "/profile",
  },
  {
    title: "Track your Order",
    link: "/track-order",
  },
  {
    title: "Customer Service",
    link: "/customer-service",
  },
  {
    title: "Returns/Exchange",
    link: "/returns-exchange",
  },
  {
    title: "FAQs",
    link: "/faqs",
  },
  {
    title: "Product Support",
    link: "/product-support",
  },
];
