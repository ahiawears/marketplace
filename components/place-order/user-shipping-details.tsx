"use client";

import { UserAddressType } from "@/lib/types";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const UserInfo = () => {
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [addressData, setAddressData] = useState<UserAddressType[]>([]);


    const getUserInfo = async () => {
        try {
            const response = await fetch("/api/getUserDetails");
            const data = await response.json();

            if (response.ok && data.data) {
                setFirstName(data.data.first_name || '');
				setLastName(data.data.last_name || '');
				setEmail(data.data.email || '');
            } else {
                console.error("Failed to fetch user details:", data.error);
                //take user to login page
            }
        } catch (error) {
            console.error("Some error occured:", error);
            //take user to login page
        } finally {
            setLoading(false)
        }
    };

    const fetchUserAddresses = async () => {
        try {
            const response = await fetch('/api/getUserAddresses');
            const { data: uAddress} = await response.json();

            if(!response.ok) throw new Error("Failed to fetch user addresses");

            const addressItems = uAddress.map((address: UserAddressType) => ({
                ...address,
            }));
            setAddressData(addressItems)
        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getUserInfo();
    }, []);

    useEffect(() => {
        //make so that it selects only the selected billing address
        fetchUserAddresses();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <p>{firstName + " " + lastName}</p>
            {addressData.map((uAddress) => (
                <div key={uAddress.id}>
                    <div>
                        <p >{uAddress.address}</p>
                        <p >{uAddress.city + ", " + uAddress.county}</p>
                        <p>{uAddress.post_code}</p>
                        <p>{uAddress.country}</p>
                        <p>{uAddress.country_code + " " + uAddress.mobile}</p>
                    </div>
                </div>
            ))}

            <p>{email}</p>
        </div>
    )
}

export default UserInfo