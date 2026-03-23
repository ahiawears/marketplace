"use client";

import { useState } from "react";
import AddressForm from "./address-form";
import AddressList from "./address-list";

type ComponentItems = "addressList" | "addAddress";

interface UserAddressDetails {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    county: string;
    region: string;
    country: string;
    post_code: string;
    country_code: string;
    mobile: string;
    created_at: string;
    is_default: boolean;
}

interface AddressesProps {
	userAddressData: UserAddressDetails[];
}
const AddressBook: React.FC<AddressesProps> = ({ userAddressData }) => {
    const [currentComponent, setCurrentComponent] = useState<ComponentItems>("addressList");
    const [addressData, setAddressData] = useState<UserAddressDetails[]>(userAddressData);

    const addAddressToList = (address: UserAddressDetails) => {
        setAddressData((prevData) => {
            if (address.is_default) {
                return [address, ...prevData.map((item) => ({ ...item, is_default: false }))];
            }

            return [address, ...prevData];
        });
    };
	const renderComponent = () => {
		if (currentComponent === "addressList") {
			return (
				<AddressList
					addresses={addressData}
					onAddAddress={() => setCurrentComponent("addAddress")}
					onAddressDeleted={async () => {
                        window.location.reload();
                    }}
				/>
			);
		}
		if (currentComponent === "addAddress") {
			return (
				<AddressForm
					onBack={() => setCurrentComponent("addressList")}
					onAddressAdded={async (address) => {
                        addAddressToList(address);
						setCurrentComponent("addressList");
					}}
				/>
			);
		}
	};

    return (
        <div>
            <div className="p-4">
                <div className="text-center py-5 mb-5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-map-pin-house mx-auto"
                    >
                        <path d="M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z" />
                        <path d="M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2" />
                        <path d="M18 22v-3" />
                        <circle cx="10" cy="10" r="3" />
                    </svg>
                    <p className="mt-4 text-lg font-semibold">Address Book</p>
                </div>
                {renderComponent()}
            </div>
        </div>
    );
};

export default AddressBook;
