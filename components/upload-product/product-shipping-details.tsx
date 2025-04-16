import { brandCountries } from "@/lib/countries";
import { ShippingDeliveryType } from "@/lib/types"
import { useState } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Select } from "../ui/select";

const ProductShippingDetails = () => {
    const [data, setData] = useState<ShippingDeliveryType>({
        shippingMethods: [],
        shippingZones: [],
        estimatedDelivery: {},
        shippingFees: {},
        handlingTime: "1-3 days",
        weight: 0,
        dimensions: { 
            length: 0, 
            width: 0, 
            height: 0 
        },
        customsDuties: "buyer-paid",
        cashOnDelivery: true
    });
    return (
        <div>
            
        </div>
    );
    // return (
    //     <div className="space-y-6 py-4">
             
    //         {/* Physical Attributes */}
    //         <div className="border-2 p-4 rounded-lg">
    //             <h3 className="font-bold text-lg mb-3">Package Physical Attributes</h3>
    //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    //                 <div>
    //                     <label className="block text-sm font-medium mb-1">
    //                         Weight (kg)
    //                     </label>
    //                     <Input
    //                         type="number"
    //                         value={data.weight}
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             weight: parseFloat(e.target.value)
    //                         })}
    //                         className="w-full p-2 border-2 rounded"
    //                     />
    //                 </div>
    //             </div>
    //             {/* Dimensions inputs... */}
    //             <div className="flex flex-col md:flex-row lg:flex-row w-full my-5 justify-between md:space-x-4">
    //                 <div className="my-2">
    //                     <label htmlFor="length" className="block text-sm font-medium">
    //                         Length (cm)
    //                     </label>
    //                     <Input 
    //                         type="number"
    //                         name="length"
    //                         value={data.dimensions.length}
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             dimensions: {
    //                                 ...data.dimensions,
    //                                 length: parseFloat(e.target.value)
    //                             }
    //                         })}
    //                         className="border-2"
    //                     />
    //                 </div>
    //                 <div className="my-2">
    //                     <label htmlFor="width" className="block text-sm font-medium">
    //                         Width (cm)
    //                     </label>
    //                     <Input 
    //                         type="number"
    //                         name="width"
    //                         value={data.dimensions.width}
    //                         className="border-2"
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             dimensions: {
    //                                 ...data.dimensions,
    //                                 width: parseFloat(e.target.value)
    //                             }
    //                         })}
    //                     />
    //                 </div>
    //                 <div className="my-2">
    //                     <label htmlFor="height" className="block text-sm font-medium">
    //                         Height (cm)
    //                     </label>
    //                     <Input 
    //                         type="number"
    //                         name="height"
    //                         value={data.dimensions.height}
    //                         onChange={(e) => setData({
    //                             ...data,
    //                             dimensions: {
    //                                 ...data.dimensions,
    //                                 height: parseFloat(e.target.value)
    //                             }
    //                         })}
    //                         className="border-2"
    //                     />
    //                 </div>
    //             </div>
    //         </div>


    //         {/* Zone Selection */}
    //         <div className="border-2 p-4 rounded-lg">
    //             <h3 className="font-bold text-lg mb-3">Shipping Zones</h3>
    //             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    //                 {brandCountries.map(country => (
    //                     <div key={country.code} className="flex items-center">
    //                         <Input
    //                             type="checkbox"
    //                             checked={data.shippingZones.includes(country.code)}
    //                             onChange={() => {
    //                                 const updated = data.shippingZones.includes(country.code)
    //                                     ? data.shippingZones.filter(z => z !== country.code)
    //                                     : [...data.shippingZones, country.code];
    //                                 setData({...data, shippingZones: updated});
    //                             }}
    //                             className={cn(
    //                                 "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
    //                                 "peer appearance-none",
    //                                 "checked:bg-black checked:border-transparent",
    //                                 "hover:border-gray-500 cursor-pointer"
    //                             )}
    //                         />
    //                         <span className="ml-2 text-sm">
    //                             {country.name} ({country.code})
    //                         </span>
    //                     </div>
    //                 ))}
    //                 <div className="flex items-center">
    //                     <Input
    //                         type="checkbox"
    //                         checked={data.shippingZones.includes("Continental")}
    //                         onChange={() => {
    //                             const updated = data.shippingZones.includes("Continental")
    //                             ? data.shippingZones.filter(z => z !== "Continental")
    //                             : [...data.shippingZones, "Continental"];
    //                             setData({...data, shippingZones: updated});
    //                         }}
    //                         className={cn(
    //                             "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
    //                             "peer appearance-none",
    //                             "checked:bg-black checked:border-transparent",
    //                             "hover:border-gray-500 cursor-pointer"
    //                         )}
    //                     />
    //                     <span className="ml-2 text-sm">Other African Countries</span>
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Zone-specific Settings */}
    //         {data.shippingZones.map(zone => (
    //             <div key={zone} className="border-2 p-4 rounded-lg">
    //                 <h4 className="font-bold text-lg mb-3">
    //                     {zone === "Continental" ? "Pan-African" : brandCountries.find(c => c.code === zone)?.name} Settings
    //                 </h4>
                
    //                 <div className="grid md:grid-cols-2 gap-4">
    //                     <div>
    //                         <label className="block text-sm font-medium mb-1">
    //                             Delivery Time
    //                         </label>
    //                         <Select
    //                             value={data.estimatedDelivery[zone] || ""}
    //                             onChange={(e) => setData({
    //                             ...data,
    //                             estimatedDelivery: {
    //                                 ...data.estimatedDelivery,
    //                                 [zone]: e.target.value
    //                             }
    //                             })}
    //                             className="w-full p-2 border-2 rounded"
    //                         >
    //                             <option value="">Select duration</option>
    //                             {zone === "Continental" ? (
    //                             <>
    //                                 <option value="7-14 days">7-14 business days</option>
    //                                 <option value="14-21 days">14-21 business days</option>
    //                             </>
    //                             ) : (
    //                             <>
    //                                 <option value="1-3 days">1-3 business days</option>
    //                                 <option value="3-5 days">3-5 business days</option>
    //                                 <option value="5-7 days">5-7 business days</option>
    //                             </>
    //                             )}
    //                         </Select>
    //                     </div>

    //                     <div>
    //                         <label className="block text-sm font-medium mb-1">
    //                             Shipping Fee ({zone === "Continental" ? "USD" : "Local Currency"})
    //                         </label>
    //                         <div className="flex ">
    //                             <span className="inline-flex items-center px-3 border-2 rounded-l">
    //                                 {zone === "Continental" ? "$" : "₦"}
    //                             </span>
    //                             <Input
    //                                 type="number"
    //                                 value={data.shippingFees[zone] || ""}
    //                                 onChange={(e) => setData({
    //                                     ...data,
    //                                     shippingFees: {
    //                                     ...data.shippingFees,
    //                                     [zone]: parseFloat(e.target.value)
    //                                     }
    //                                 })}
    //                                 className="w-full p-2 border-2 rounded-r"
    //                             />
    //                         </div>
    //                     </div>
    //                 </div>

    //                 {!["Continental", "NG"].includes(zone) && (
    //                     <div className="mt-3">
    //                         <label className="block text-sm font-medium mb-1">
    //                             Customs Duties
    //                         </label>
    //                         <Select
    //                             value={data.customsDuties}
    //                             onChange={(e) => setData({
    //                                 ...data,
    //                                 customsDuties: e.target.value as any
    //                             })}
    //                             className="w-full p-2 border-2 rounded"
    //                         >
    //                             <option value="buyer-paid">Buyer pays duties</option>
    //                             <option value="seller-paid">I'll pay duties</option>
    //                             <option value="duty-free">Duty-free product</option>
    //                         </Select>
    //                     </div>
    //                 )}
    //             </div>
    //         ))}

    //         {/* Payment Options */}
    //         <div className="border-2 p-4 rounded-lg">
    //             <div className="flex items-center">
    //                 <Input
    //                     type="checkbox"
    //                     checked={data.cashOnDelivery || false}
    //                     onChange={(e) => setData({
    //                         ...data,
    //                         cashOnDelivery: e.target.checked
    //                     })}
    //                     className={cn(
    //                         "h-4 w-4 border-2 p-2 text-black focus:ring-0 focus:ring-offset-0",
    //                         "peer appearance-none",
    //                         "checked:bg-black checked:border-transparent",
    //                         "hover:border-gray-500 cursor-pointer"
    //                     )}
    //                 />
    //                 <span className="ml-2 text-sm font-medium">
    //                     Accept Cash on Delivery (Recommended for African buyers)
    //                 </span>
    //             </div>
    //         </div>
    //     </div>
    // );
}
export default ProductShippingDetails;