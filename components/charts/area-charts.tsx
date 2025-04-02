import { useEffect, useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, CartesianGrid, Area } from "recharts";


const data = [
    {
        name: "A",
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: "B",
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: "C",
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: "D",
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: "E",
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: "F",
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: "G",
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

export const AreaCharts = () => {
    const [domLoaded, setDomLoaded] = useState(false);

    useEffect(() => {
        setDomLoaded(true);
    }, []);
    
  
    return (
        <> 
            {domLoaded && 
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
                            <Area type="monotone" dataKey="pv" stroke="#8884d8" fill="#FFF000" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            }
            
        </>
    )
}