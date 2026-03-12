"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const userContext = createContext({ userId: "test", email: "test" });

export function useUserContext() {
  return useContext(userContext);
}

export default function UserIdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        setUserId("");
        setEmail("");
        return;
      }

      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      const email = data.user?.email;
      setUserId(userId ?? "");
      setEmail(email ?? "");
    };
    getUser();
  }, []);
  return (
    <userContext.Provider value={{ userId, email }}>
      {children}
    </userContext.Provider>
  );
}
