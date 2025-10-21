import Link from "next/link";
// Images
import CouponImg from "@/public/assets/images/sideline/couponn.png"
import WishlistImg from "@/public/assets/images/sideline/wishlist.png"
import HistoryImg from "@/public/assets/images/sideline/history.png"
import FeedbackImg from "@/public/assets/images/sideline/feedback.png"
// Components
import SidelineItem from "./sideline-item";

export default function HomeSideline() {
  return (
    <div>
      <div className="hidden md:block fixed z-30 w-10 h-120 rounded-bl-full rounded-tl-full top-50 right-0 bg-gradient-to-t from-slate-500 to-slate-800 text-[13px]">
        <div className="fixed top-[34%] -translate-y-1/2 text-center">
          <Link
            href="/profile"
            className="group relative block w-[35px] h-[35px] transition-all duration-100 ease-linear 
            bg-[url('/assets/images/sideline/gift.avif')] hover:bg-[url('/assets/images/sideline/gift-opened.avif')] bg-cover"
          >
            <span
              className="hidden group-hover:block absolute -left-[160px] top-0.5 bg-[#373737] text-white px-4
             py-[0.8rem] rounded-sm transition-all duration-500 ease-linear"
            >
              Check your profile
            </span>
            <div className="hidden group-hover:block w-0 h-0 border-[12px] border-transparent border-l-[#373737] border-r-0 absolute left-[-15px] top-[38%] transition-all duration-500 ease-in-out" />
          </Link>
          <SidelineItem link="/profile" image={CouponImg}>
            Coupons
          </SidelineItem>
          <SidelineItem link="/profile/wishlist" image={WishlistImg}>
            Wishlist
          </SidelineItem>
          <SidelineItem link="/profile/history" image={HistoryImg}>
            History
          </SidelineItem>
        </div>
        <div className="fixed top-[60%] -translate-y-1/2 text-left">
          <SidelineItem link="/feedback" image={FeedbackImg}>
            Feedback
          </SidelineItem>
        </div>
      </div>
    </div>
  );
}