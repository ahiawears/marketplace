"use client";
import React from "react";

interface ShippingDetails {
  shippingMethods: {
    sameDayDelivery: boolean;
    standardShipping: boolean;
    expressShipping: boolean;
    internationalShipping: boolean;
  };
  shippingZones: {
    domestic: boolean;
    regional: boolean;
    international: boolean;
  };
  handlingTime: string;
  shippingFees: {
    sameDayFee: number;
    standardFee: number;
    expressFee: number;
    internationalFee: number;
  };
  defaultPackage: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  paymentOptions: {
    cashOnDelivery: boolean;
  };
  freeShippingThreshold?: number;
  estimatedDeliveryTimes: {
    domestic: string;
    regional: string;
    international: string;
  };
}

interface ShippingConfigurationProps {
  initialData?: Partial<ShippingDetails>;
  onSave: (config: ShippingDetails) => void;
  userCountry: string;
  currency?: string;
}

interface MethodToggleProps {
  label: string;
  checked: boolean;
  fee: number;
  onToggle: (checked: boolean) => void;
  onFeeChange: (fee: number) => void;
  currency: string;
}

interface ZoneToggleProps {
  label: string;
  checked: boolean;
  deliveryTime: string;
  onToggle: (checked: boolean) => void;
  onTimeChange: (time: string) => void;
  canOfferSameDay: boolean;
}

interface DefaultPackageConfigProps {
	config: {
	  weight: number;
	  dimensions: {
		length: number;
		width: number;
		height: number;
	  };
	};
	onChange: (updates: {
	  weight?: number;
	  dimensions?: Partial<{
		length: number;
		width: number;
		height: number;
	  }>;
	}) => void;
  }

const AFRICAN_COUNTRIES_WITH_SAME_DAY = [
  'Nigeria', 'Kenya', 'South Africa', 
  'Egypt', 'Ghana', 'Morocco'
];

const DEFAULT_SHIPPING_CONFIG: ShippingDetails = {
  shippingMethods: {
    sameDayDelivery: false,
    standardShipping: true,
    expressShipping: false,
    internationalShipping: false,
  },
  shippingZones: {
    domestic: true,
    regional: false,
    international: false,
  },
  handlingTime: "1-2 days",
  shippingFees: {
    sameDayFee: 10,
    standardFee: 5,
    expressFee: 15,
    internationalFee: 25,
  },
  defaultPackage: {
    weight: 0.5,
    dimensions: {
      length: 20,
      width: 15,
      height: 10,
    },
  },
  paymentOptions: {
    cashOnDelivery: true,
  },
  estimatedDeliveryTimes: {
    domestic: "1-3 days",
    regional: "3-5 days",
    international: "7-14 days",
  },
};

const ShippingConfiguration = ({ 
  initialData,
  onSave,
  userCountry,
  currency = 'USD'
}: ShippingConfigurationProps) => {
  const [config, setConfig] = React.useState<ShippingDetails>({
    ...DEFAULT_SHIPPING_CONFIG,
    ...initialData
  });

  const canOfferSameDay = AFRICAN_COUNTRIES_WITH_SAME_DAY.includes(userCountry);

  const handleSave = () => {
    onSave(config);
  };

  const updateConfig = (updates: Partial<ShippingDetails>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Shipping Configuration</h2>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Configuration
        </button>
      </div>

      {/* Shipping Methods Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Shipping Methods</h3>
        <div className="space-y-4">
          {canOfferSameDay && (
            <MethodToggle
              label="Same Day Delivery"
              checked={config.shippingMethods.sameDayDelivery}
              fee={config.shippingFees.sameDayFee}
              onToggle={(checked) => updateConfig({
                shippingMethods: { ...config.shippingMethods, sameDayDelivery: checked }
              })}
              onFeeChange={(fee) => updateConfig({
                shippingFees: { ...config.shippingFees, sameDayFee: fee }
              })}
              currency={currency}
            />
          )}
          
          <MethodToggle
            label="Standard Shipping"
            checked={config.shippingMethods.standardShipping}
            fee={config.shippingFees.standardFee}
            onToggle={(checked) => updateConfig({
              shippingMethods: { ...config.shippingMethods, standardShipping: checked }
            })}
            onFeeChange={(fee) => updateConfig({
              shippingFees: { ...config.shippingFees, standardFee: fee }
            })}
            currency={currency}
          />

          {/* Add other methods similarly */}
        </div>
      </div>

      {/* Shipping Zones Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Shipping Zones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ZoneToggle
            label={`Domestic (${userCountry})`}
            checked={config.shippingZones.domestic}
            deliveryTime={config.estimatedDeliveryTimes.domestic}
            onToggle={(checked) => updateConfig({
              shippingZones: { ...config.shippingZones, domestic: checked }
            })}
            onTimeChange={(time) => updateConfig({
              estimatedDeliveryTimes: { ...config.estimatedDeliveryTimes, domestic: time }
            })}
            canOfferSameDay={canOfferSameDay}
          />

          {/* Add other zones similarly */}
        </div>
      </div>

      {/* Default Package Section */}
      <DefaultPackageConfig
        config={config.defaultPackage}
        onChange={(updates) => updateConfig({
          defaultPackage: { ...config.defaultPackage, ...updates }
        })}
      />

      {/* Payment Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={config.paymentOptions.cashOnDelivery}
            onChange={(e) => updateConfig({
              paymentOptions: { cashOnDelivery: e.target.checked }
            })}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium">Accept Cash on Delivery</span>
        </label>
      </div>

      {/* Free Shipping Threshold */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Free Shipping</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Value ({currency})
            </label>
            <input
              type="number"
              value={config.freeShippingThreshold || ''}
              onChange={(e) => updateConfig({
                freeShippingThreshold: e.target.value ? Number(e.target.value) : undefined
              })}
              className="w-full p-2 border rounded"
              min="0"
              placeholder="No free shipping"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MethodToggle: React.FC<MethodToggleProps> = ({ 
  label, 
  checked, 
  fee, 
  onToggle, 
  onFeeChange, 
  currency 
}) => (
  <div className="flex items-center justify-between p-4 border rounded-lg">
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="font-medium">{label}</span>
    </label>
    {checked && (
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Fee:</span>
        <input
          type="number"
          value={fee}
          onChange={(e) => onFeeChange(Number(e.target.value))}
          className="w-24 p-2 border rounded"
          min="0"
        />
        <span>{currency}</span>
      </div>
    )}
  </div>
);

const ZoneToggle: React.FC<ZoneToggleProps> = ({ 
  label, 
  checked, 
  deliveryTime, 
  onToggle, 
  onTimeChange, 
  canOfferSameDay 
}) => (
  <div className="border p-4 rounded-lg">
    <label className="flex items-center space-x-3 mb-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="font-medium">{label}</span>
    </label>
    {checked && (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
        <select
          value={deliveryTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {canOfferSameDay && label.includes('Domestic') && (
            <option value="same day">Same Day</option>
          )}
          <option value="1-2 days">1-2 Business Days</option>
          <option value="3-5 days">3-5 Business Days</option>
          <option value="7-14 days">7-14 Business Days</option>
        </select>
      </div>
    )}
  </div>
);

const DefaultPackageConfig: React.FC<DefaultPackageConfigProps> = ({ config, onChange }) => (
	<div className="bg-white p-6 rounded-lg shadow">
	  <h3 className="text-lg font-semibold mb-4">Default Package Details</h3>
	  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div>
		  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
		  <input
			type="number"
			value={config.weight}
			onChange={(e) => onChange({ weight: Number(e.target.value) })}
			className="w-full p-2 border rounded"
			min="0.1"
			step="0.1"
		  />
		</div>
		{(['length', 'width', 'height'] as const).map((dim) => (
		  <div key={dim}>
			<label className="block text-sm font-medium text-gray-700 mb-1">
			  {dim.charAt(0).toUpperCase() + dim.slice(1)} (cm)
			</label>
			<input
			  type="number"
			  value={config.dimensions[dim]}
			  onChange={(e) => onChange({
				dimensions: { 
				  ...config.dimensions, 
				  [dim]: Number(e.target.value) 
				}
			  })}
			  className="w-full p-2 border rounded"
			  min="1"
			/>
		  </div>
		))}
	  </div>
	</div>
  );

export default ShippingConfiguration;