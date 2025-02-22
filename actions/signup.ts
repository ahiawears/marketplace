"use server";

import { createClient } from "@/supabase_change/server";
import { AddUser } from "./add-user"; 

type UserSignUpProps = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export async function signup({email, password, firstName, lastName}: UserSignUpProps) {
    const supabase = await createClient();

    const userData = {
      	email, password, firstName, lastName,
    };	

    const { data, error } = await supabase.auth.signUp({
		email: userData.email,
		password: userData.password,
		options: { 
			data: {
				first_name: userData.firstName,
				last_name: userData.lastName,
			},
		},
    });

	if (error) {
		throw new Error(error.message || "An unexpected error occured, please try again.")
	}

	if (!data.user) {
		throw new Error("User data is null");
	}

	try {
		const { error: addUserError } = await AddUser({
			id: data.user.id, 
			email: userData.email,
		});
	
		if (addUserError) {
			throw new Error(addUserError.message);
		}
	} catch (error) {
		//delete user if AddUser fails
		const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);

		//if theres an error, display error
        if (deleteError) {
            throw new Error (deleteError.message);
        }

		//through an unhandled error in case
        throw new Error("An unexpected error occurred, please try again.");
	}
}
