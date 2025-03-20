import { FaChartLine, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { CardMetricItem } from "../card-metric-item";


const metrics = [
    { title: 'Orders', value: '1,250', icon: FaUsers },
    { title: 'Monthly Active Users', value: '850', icon: FaChartLine },
    { title: 'Revenue', value: '$12,500', icon: FaMoneyBillWave },
];

export const CardMetricsGrid = () => {
    return (
        <div>
            <div className="mx-auto py-10 sm:py-10 shadow-2xl">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        {metrics.map((metric, index) => (
                            <CardMetricItem key={index} title={metric.title} value={metric.value} icon={metric.icon}/>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}