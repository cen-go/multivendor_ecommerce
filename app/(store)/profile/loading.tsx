import { MoonLoader } from "react-spinners";

export default function ProfileLoadingPage() {
  return (
    <div className="mx-auto h-full flex items-center justify-center py-24">
      <MoonLoader color="#d3031c" speedMultiplier={0.5} size={40} />
    </div>
  )
}
