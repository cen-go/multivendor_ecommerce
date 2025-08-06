import { RatingStatisticsType } from '@/lib/types'
import RatingStars from '../shared/rating-stars';

export default function RatingStatisticsCard({
  stats,
}: {
  stats: RatingStatisticsType["ratingStatistics"];
}) {
  return <div className='h-44 flex-1'>
    <div className='py-5 px-7 bg-[#f5f5f5] flex flex-col gap-y-2 h-full justify-center overflow-hidden rounded-lg'>
      {stats.reverse().map(stat => (
        <div key={stat.rating} className='flex items-center h-4'>
          <RatingStars value={stat.rating} size={22} small />
          <div className='relative w-full flex-1 h-1.5 mx-2.5 bg-[#e2dfdf] rounded-full'>
            <div className='absolute left-0 h-full rounded-full bg-[#f2c306]' style={{width: `${stat.percentage}%`}}></div>
          </div>
          <div className='text-xs w-9 leading-4'>{stat.numReviews}</div>
        </div>
      ))}
    </div>
  </div>;
}
