import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
];

export const PieCharts = () => {
    const [domLoaded, setDomLoaded] = useState(false);

    useEffect(() => {
        setDomLoaded(true);
    }, []); 

    return (
        <>
            {domLoaded &&
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie dataKey="value" data={data} fill="#8884d8" label />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            }
        </>
    )
}