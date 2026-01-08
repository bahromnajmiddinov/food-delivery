import { Review } from '@/types';

export const mockReviews: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Amazing food! The chicken was perfectly crispy and the delivery was super fast.',
    createdAt: new Date('2024-12-28'),
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Sarah Smith',
    rating: 4,
    comment: 'Great taste but portion could be bigger. Overall satisfied!',
    createdAt: new Date('2024-12-27'),
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Mike Johnson',
    rating: 5,
    comment: 'Best burger in town! Highly recommend the double beef burger.',
    createdAt: new Date('2024-12-26'),
  },
  {
    id: 'r4',
    userId: 'u4',
    userName: 'Emily Brown',
    rating: 4,
    comment: 'Delicious pizza and friendly delivery driver. Will order again!',
    createdAt: new Date('2024-12-25'),
  },
];
