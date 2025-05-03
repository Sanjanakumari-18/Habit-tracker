'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const data = [
  { name: 'Day 1', streak: 1 },
  { name: 'Day 2', streak: 2 },
  { name: 'Day 3', streak: 3 },
  { name: 'Day 4', streak: 1 },
  { name: 'Day 5', streak: 4 },
];

export default function Chart() {
  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="streak" stroke="#8884d8" />
    </LineChart>
  );
}
