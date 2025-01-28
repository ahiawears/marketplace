"use client";

import AddressBook from "@/components/my-account/address-book";
import ChangePassword from "@/components/my-account/change-password";
import MyOrders from "@/components/my-account/my-orders";
import Userdetails from "@/components/my-account/userdetails";
import { useState } from "react";

type MenuItem = "details" | "changePassword" | "myOrders" | "addressBook";

const MyAccount = () => {
	const [activeComponent, setActiveComponent] = useState<MenuItem | null>(null);

	// Component mapping with the correct types  
	const componentMap: Record<MenuItem, JSX.Element> = {
		details: <Userdetails />,
		changePassword: <ChangePassword />,
		myOrders: <MyOrders />,
		addressBook: <AddressBook />,
	};

	const renderComponent = activeComponent ? componentMap[activeComponent] : null;

	return (
		<div>
			<div className="container flex h-[calc(100%-7.5rem)] space-x-4">
				<aside className={`cursor-pointer bg-gray-100 p-4 space-y-4 w-full h-fit lg:w-64 mx-auto ${activeComponent && "hidden md:block"}`}>
					<ul className="space-y-4 text-lg">
						<li onClick={() => setActiveComponent("details")}>My Details</li>
						<li onClick={() => setActiveComponent("changePassword")}>Change Password</li>
						<li onClick={() => setActiveComponent("myOrders")}>My Orders</li>
						<li onClick={() => setActiveComponent("addressBook")}>Address Book</li>
					</ul>
				</aside>
				{/* Main Content */}
				<main className="flex-1 bg-gray-100 ">
					{/* Show selected component or fallback */}
					{activeComponent ? (
						<div className="">
							<button
								onClick={() => setActiveComponent(null)}
								className="mb-4 text-blue-500 md:hidden"
							>
								← Back
							</button>
							<div>{renderComponent}</div>
						</div>
					) : (
						<div className="hidden md:block lg:block bg-[url('/images/ahiaproto3.jpg')] h-[600px] bg-cover text-center text-gray-500 "></div>
					)}
				</main>
			</div>
		</div>
	)
};

export default MyAccount;
