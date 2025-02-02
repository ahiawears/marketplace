import { FC } from 'react';

interface CardMetricItemProps {
    title: string;
    value: number | string;
    icon?: FC<{ className?: string }> | null;
}

export const CardMetricItem: FC<CardMetricItemProps> = ({ title, value, icon: Icon }) => {
    return(
        <div className="bg-white rounded-lg shadow-md p-6 w-full ">
            <div className="flex items-center mb-4">
                {Icon && 
                    <Icon 
                        className="h-8 w-8 text-indigo-500 mr-2"
                    />
                } 
                <h3 className="text-lg font-medium text-gray-800">{title}</h3>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
                {value}
            </div>
        </div>
    );
}