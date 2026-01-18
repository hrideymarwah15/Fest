"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserWithRole extends Omit<User, 'phone'> {
    role?: string;
    collegeId?: string | null;
    phone?: string | null;
    dbId?: string;
}

interface AuthContextType {
    user: UserWithRole | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserWithRole | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchUserRole = async (supabaseUser: User) => {
        try {
            const response = await fetch("/api/auth/user-role");
            if (response.ok) {
                const data = await response.json();
                return {
                    ...supabaseUser,
                    role: data.role,
                    collegeId: data.collegeId,
                    phone: data.phone,
                    dbId: data.id,
                };
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
        return supabaseUser;
    };

    const refreshUser = async () => {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
            const userWithRole = await fetchUserRole(supabaseUser);
            setUser(userWithRole);
        }
    };

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);

                if (initialSession?.user) {
                    const userWithRole = await fetchUserRole(initialSession.user);
                    setUser(userWithRole);
                }
            } catch (error) {
                console.error("Error getting initial session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession);

                if (newSession?.user) {
                    const userWithRole = await fetchUserRole(newSession.user);
                    setUser(userWithRole);
                } else {
                    setUser(null);
                }

                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
