import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken")
    );

    const [refreshToken, setRefreshToken] = useState(
        localStorage.getItem("refreshToken")
    );

    const [authLoading, setAuthLoading] = useState(true);

    const isAuthenticated = Boolean(accessToken);

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
    };

    const fetchCurrentUser = async (token) => {
        try {
            const response = await fetch(
                `${API_BASE}/adopta_tu_canino/usuarios/me/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "No se pudo obtener el usuario autenticado."
                );
            }

            setUser(data);
        } catch (error) {
            console.error(
                "Error al obtener el usuario autenticado:",
                error
            );

            logout();
        }
    };

    const login = async (access, refresh) => {
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);

        setAccessToken(access);
        setRefreshToken(refresh);

        await fetchCurrentUser(access);
    };

    useEffect(() => {
        const restoreSession = async () => {
            const storedAccessToken =
                localStorage.getItem("accessToken");

            if (storedAccessToken) {
                await fetchCurrentUser(storedAccessToken);
            }

            setAuthLoading(false);
        };

        restoreSession();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                isAuthenticated,
                user,
                authLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
    
    // Access token y refresh token se almacenan en el estado del contexto
    // y en el localStorage para persistencia entre recargas de página.
    // Función para iniciar sesión, que actualizan tanto el estado del contexto como el localStorage.
    // Función para cerrar sesión, que actualizan tanto el estado del contexto como el localStorage.
