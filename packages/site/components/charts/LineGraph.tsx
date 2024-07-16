"use client";

import { Chart } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function LineGraph(props: { title: string; chart: Chart }) {

  let data = [];
  
  for(var i=0; i < props.chart.labels.length; i++) {

    let obj : any = {
      name: props.chart.labels[i]
    }

    props.chart.datasets.forEach(ds => {
      obj[ds.label] = ds.data[i]
    })

    data.push(obj);
  }

  return (
    <ResponsiveContainer width={"100%"} aspect={1}>
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis type="number" domain={[0, 5]} />
        <Tooltip />
        <Legend />
        {props.chart.datasets.map((ds, idx) => (
        <Area type="monotone" dataKey={ds.label} stroke={ds.borderColor} activeDot={{ r: 8 }} key={idx} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
