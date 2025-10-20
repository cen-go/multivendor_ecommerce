"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Img1 from "@/public/assets/images/swiper/1.webp";
import Img2 from "@/public/assets/images/swiper/2.webp";
import Img3 from "@/public/assets/images/swiper/3.webp";
import Img4 from "@/public/assets/images/swiper/4.webp";

export default function HomeMainSwiper() {
  return (
    <div className="w-full h-[140px] sm:h-[250px] md:h-[300px] lg:h-[340px] xl:h-[380px] 2xl:h-[420px] overflow-hidden">

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        pagination= {{type: "progressbar"}}
        navigation={true}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        className="w-full h-full min-w-0"
      >
        {images.map((img) => (
          <SwiperSlide key={img.id} className="flex items-center justify-center">
            <div className="w-full h-full relative">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 1170px) 100vw, max-width: 1465px) 75vw, 50vw"
                className="object-cover"
                priority={img.id === 1} // Prioritize loading the first image
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const images = [
  { id: 1, url: Img1, alt: "Swiper image 1" },
  { id: 2, url: Img2, alt: "Swiper image 2" },
  { id: 3, url: Img3, alt: "Swiper image 3" },
  { id: 4, url: Img4, alt: "Swiper image 4" },
];