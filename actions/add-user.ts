import { createClient } from "@/supabase_change/server";

type Props = {
  id: string;
  email: string;
};

export async function AddUser({ id, email }: Props) {
	const supabase = await createClient();

	const { data, error } = await supabase
									.from("users").
									insert({
										id,
										email,
									});

	return {
		data,
		error,
	};
}
