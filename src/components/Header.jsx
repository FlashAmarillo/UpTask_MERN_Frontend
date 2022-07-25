import { Link } from "react-router-dom";
import useProyectos from "../hooks/useProyectos";
import Busqueda from "./Busqueda";
import useAuth from "../hooks/useAuth";

const Header = () => {

    const { handleBuscador, cerrarSesionProyectos } = useProyectos();
    const { cerrarSesionAuth } = useAuth();

    const handleCerrarSesion = () => {
        cerrarSesionAuth();
        cerrarSesionProyectos();

        // Reiniciar el local storage y limpiar el token
        localStorage.removeItem('token');
    }

  return (
    <header className="px-4 py-5 bg-white border-b">
        <div className="md:flex md:justify-between">
            <h2 className="text-4xl text-sky-600 font-black text-center mb-5 md:mb-0">
                UpTask
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-4 mt-5 md:mt-0">

                <button
                    className="font-bold uppercase"
                    type="button"
                    onClick={handleBuscador}
                >
                    Buscar Proyecto
                </button>

                <Link 
                    to='/proyectos'
                    className="font-bold text-sm uppercase border p-3 rounded-md"
                >Proyectos</Link>

                <button
                    type="button"
                    className="text-white text-sm bg-sky-600 p-3 rounded-md uppercase font-bold"
                    onClick={() => handleCerrarSesion()}
                >
                    Cerra Sesión
                </button>

                <Busqueda />
            </div>
        </div>

    </header>
    )
}

export default Header