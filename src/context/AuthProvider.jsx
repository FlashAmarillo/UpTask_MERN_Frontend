import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import clienteAxios from "../config/clienteAxios";

const AuthContext = createContext();

const AuthProvider =  ( { children } ) => {

    const [auth, setAuth] = useState({}); //datos de la sesion al logear
    const [cargando, setCargando] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        // Autenticar usuario
        const autenticarUsuario = async() => {
            // Comprobar si hay un token en LS
            const token = localStorage.getItem('token');
            
            if(!token) {
                setCargando(false);
                return
            }

            // definicion de configuracion
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            try {
                //hacemos la peticion para obtener el perfil del usuario autenticado
                const { data } = await clienteAxios('/usuarios/perfil', config);
                setAuth(data);
                
                //enviamos al usuario a la pagina de proyectos
                //navigate('/proyectos');
            } catch (error) {
                setAuth({});
            } finally {
                setCargando(false);
            }
            
        }

        autenticarUsuario()

    }, [])

    const cerrarSesionAuth = () => {
        setAuth({});
    }
    

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth,
                cargando,
                cerrarSesionAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export {
    AuthProvider
}

export default AuthContext;