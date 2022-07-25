import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth";

const PreviewProyecto = ({proyecto}) => {
    
    const { auth } = useAuth();
    const { nombre, _id, cliente, creador} = proyecto;

    return (
        <div className="border-b p-5 flex flex-col md:flex-row justify-between">
            
            <div className="flex items-center gap-2">
                <p className="flex-1 text-xl">
                    {nombre}
                    <span className="text-sm ml-2 text-gray-500 uppercase ">{' '} {cliente}</span>
                </p>

                {auth._id !== creador && (
                    <p className="p-1 text-xs rounded-lg text-white bg-green-500 font-bold uppercase">Colaborador</p>
                )}
            </div>

            <Link 
                to={`${_id}`}
                className='mt-3 md:mt-0 text-sky-600 hover:text-sky-900 uppercase text-sm font-bold transition-colors'
            >
                Ver Proyecto
            </Link>
        </div>
  )
}

export default PreviewProyecto