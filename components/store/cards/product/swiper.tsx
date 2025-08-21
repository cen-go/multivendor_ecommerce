// Swiper React components
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { Autoplay } from "swiper/modules";
// Swiper styles
import "swiper/css"
// Types
import { ProductVariantImage } from "@prisma/client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function ProductCardImageSwiper({images}: {images: ProductVariantImage[]}) {
  const swiperRef = useRef<SwiperRef>(null);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.autoplay.stop();
    }
  }, [swiperRef])

  return (
    <div
      onMouseEnter={() => swiperRef.current?.swiper.autoplay.start()}
      onMouseLeave={() => {
        swiperRef.current?.swiper.autoplay.stop();
        swiperRef.current?.swiper.slideTo(0)
      }}
      className="relative mb-2 w-full h-[200px] bg-white contrast-[90%] rounded-2xl overflow-hidden"
    >
      <Swiper
        ref={swiperRef}
        modules={[Autoplay]}
        autoplay={{ delay: 1000 }}
        className="h-full"
      >
        {images.map((image) => (
          <SwiperSlide key={image.id}>
            <Image
              src={image.url}
              alt="product variant image"
              width={400}
              height={400}
              className="block object-contain h-full w-48 sm:w-52"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
