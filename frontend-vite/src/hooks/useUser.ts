import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });
};

export default useUser;
