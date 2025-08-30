import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

const getGoals = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  return data;
};

const useGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
  });
};

export default useGoals;
