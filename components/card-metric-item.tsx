import { FC } from 'react';

interface CardMetricItemProps {
    title: string;
    value: number | string;
    icon?: FC<{ className?: string }> | null;
}

export const CardMetricItem: FC<CardMetricItemProps> = ({ title, value, icon: Icon }) => {
    return(
        <div className="bg-white rounded-lg shadow-md p-6 w-full border-2">
            <div className='flex flex-col md:flex-col lg:flex-col'>
                <div>
                    <h3 className="text-lg font-medium text-gray-800 float-left">{title}</h3>
                </div>
                <div className='flex flex-row md:flex-row lg:flex-row'>
                    <div className='basis-10/12 float-left'>
                        <h3 className="text-lg font-medium text-gray-800 float-left">{value}</h3>
                    </div>
                    <div className='basis-2/12'>
                        {Icon && 
                            <Icon 
                                className="h-8 w-8 text-indigo-500 mr-2 float-right"
                            />
                        } 
                    </div>
                </div>

            </div>
        </div>
    );
}