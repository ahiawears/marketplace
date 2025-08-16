"use client";

import AddressBook from "@/components/customer-facing-components/user-account-settings/my-account-comps/address-book";
import ChangePassword from "@/components/customer-facing-components/user-account-settings/my-account-comps/change-password";
import MyOrders from "@/components/customer-facing-components/user-account-settings/my-account-comps/my-orders";
import Userdetails from "@/components/customer-facing-components/user-account-settings/my-account-comps/userdetails";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import PaymentMethods from "./payment-methods";

type MenuItem = "details" | "changePassword" | "myOrders" | "addressBook" | "paymentMethods";

interface MyAccountClientProps {
    userDetailsData: UserDetailsProps;
    userAddressData: UserAddressDetails[];
    dbPaymentMethods: DbPaymentDetails[];
}

interface UserDetailsProps {
    firstName: string;
    lastName: string;
    email: string;
    email_verified: boolean;
}
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

interface DbPaymentDetails {
	id: string;
	expiry_month: number;
	expiry_year: number;
	card_brand: string;
	last_four: string;
	flutterwave_id: string;
	is_default: boolean;
    card_holder: string;
}

const MyAccountClient: React.FC<MyAccountClientProps> = ({ userDetailsData, userAddressData, dbPaymentMethods }) => {
    const [activeComponent, setActiveComponent] = useState<MenuItem | null>(null);

    const componentMap: Record<MenuItem, JSX.Element> = useMemo(() => {
        return {
            details: <Userdetails 
                        userDetails={userDetailsData} 
                    />,
            changePassword: <ChangePassword />,
            myOrders: <MyOrders />,
            addressBook: <AddressBook 
                        userAddressData={userAddressData}
                    />,
            paymentMethods: <PaymentMethods 
                        dbPaymentMethod={dbPaymentMethods}
                    />
        };
    }, [userDetailsData]);

    const renderComponent = activeComponent ? componentMap[activeComponent] : null;

    return (
        <div>
            <div className="container flex h-[calc(100%-7.5rem)] space-x-4 justify-center">
                <aside
                    className={`cursor-pointer bg-gray-100 p-4 space-y-4 w-full h-fit lg:w-64 mx-auto ${
                        activeComponent && "hidden md:block"
                    } border-2`}
                >
                    <ul className="space-y-4 text-lg">
                        <li onClick={() => setActiveComponent("details")} className={`border-2 hover:bg-gray-100 hover:shadow-xl`}>
                            My Details
                        </li>
                        <li onClick={() => setActiveComponent("changePassword")} className={`border-2 hover:bg-gray-100 hover:shadow-xl`}>
                            Change Password
                        </li>
                        <li onClick={() => setActiveComponent("myOrders")} className={`border-2 hover:bg-gray-100 hover:shadow-xl`}>
                            My Orders
                        </li>
                        <li onClick={() => setActiveComponent("addressBook")} className={`border-2 hover:bg-gray-100 hover:shadow-xl`}>
                            Address Book
                        </li>
                        <li onClick={() => setActiveComponent("paymentMethods")} className={`border-2 hover:bg-gray-100 hover:shadow-xl`}>
                            Payment Methods
                        </li>
                    </ul>
                </aside>
                {/* Main Content */}
                <main className="flex-1 border-2 bg-gray-100">
                    {/* Show selected component or fallback */}
                    {activeComponent ? (
                        <div className="my-5">
                        <Button
                            onClick={() => setActiveComponent(null)}
                            className="mb-4 text-black md:hidden bg-transparent focus:bg-transparent"
                        >
                            ← Back
                        </Button>
                        <div>{renderComponent}</div>
                        </div>
                    ) : (
                        <div className="hidden md:block lg:block bg-[url('/images/ahiaproto3.jpg')] h-[600px] bg-cover text-center text-gray-500 "></div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyAccountClient;
