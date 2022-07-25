import { useEffect } from "react";
import { useParams, Link } from "react-router-dom"
import useProyectos from "../hooks/useProyectos";
import useAdmin from "../hooks/useAdmin";
import ModalFormularioTarea from "../components/ModalFormularioTarea";
import ModalEliminarTarea from "../components/ModalEliminarTarea";
import ModalEliminarColaborador from "../components/ModalEliminarColaborador";
import Tarea from "../components/Tarea";
import Alerta from "../components/Alerta";
import Colaborador from "../components/Colaborador";
import { io } from "socket.io-client";

let socket;

const Proyecto = () => {
  
  const params = useParams();
  const { obtenerProyecto, proyecto, cargando, handleModalTarea, alerta, submitTareasProyecto, eliminarTareaProyecto, actualizarTareaProyecto, cambiarEstadoTarea } = useProyectos();
  const admin = useAdmin();

  useEffect(() => {
    obtenerProyecto(params.id)
  }, [])
  
  useEffect(() => {
    // Abrir conexion
    socket = io(import.meta.env.VITE_BACKEND_URL);
    
    // le digo en que proyecto estoy
    socket.emit('abrir proyecto', params.id)
  }, [])
  
  useEffect(() => {
    socket.on('tarea agregada', tareaNueva => {
      if(tareaNueva.proyecto === proyecto._id) {
        submitTareasProyecto(tareaNueva)
      }
    })

    socket.on('tarea eliminada', tareaEliminada => {
      if(tareaEliminada.proyecto === proyecto._id) {
        eliminarTareaProyecto(tareaEliminada);
      }
    })

    socket.on('tarea actualizada', (tareaActualizada) => {
      if(tareaActualizada.proyecto._id === proyecto._id) {
        actualizarTareaProyecto(tareaActualizada);
      }
    })

    socket.on('nuevo estado', nuevoEstadoTarea => {
      if(nuevoEstadoTarea.proyecto._id === proyecto._id) {
        cambiarEstadoTarea(nuevoEstadoTarea);
      }
    })
  })
  
  const {nombre} = proyecto;

  const { msg } = alerta;

  if(cargando) return 'Cargando...';
  
  return (
      <>
        <div className="flex justify-between items-center">
          <h1 className="font-black text-4xl">{nombre}</h1>

          {admin && (  /* Valida si es admin o colaborador para mostrar la opcion de editar */
            <div className="flex items-center">
              <Link
                to={`/proyectos/editar/${params.id}`}
                className='uppercase font-bold flex gap-2 text-gray-400 hover:text-gray-600 transition-colors'
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>

                Editar</Link>
            </div>
          )}
        </div>  
        
        {admin && (
          <button 
            onClick={handleModalTarea}
            type="button"
            className="flex items-center justify-center gap-2 text-md mt-5 px-5 py-3 w-full md:w-auto rounded-lg uppercase font-bold bg-sky-400 text-white text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nueva Tarea
          </button>
        )}

        <p className="font-bold text-xl mt-10">Tareas del Proyecto</p>

        <div className="bg-white shadow mt-10 rounded-lg p-3">
          {proyecto.tareas?.length ? 
            proyecto.tareas?.map(tarea => (
              <Tarea 
                key={tarea._id}
                tarea={tarea}
              />
            ))
          : 
            <p className="text-center my-5 p-10">No hay tareas en este proyecto</p>
          }
        </div>
        
        {admin && (
          <>
            <div className="flex items-center justify-between mt-10">
              <p className="font-bold text-xl">Colaboradores</p>
              <Link
                to={`/proyectos/nuevo-colaborador/${proyecto._id}`}
                className="text-gray-400 hover:text-gray-600 transition-colors uppercase font-bold"
              >Añadir</Link>
            </div>
            
            <div className="bg-white shadow mt-10 rounded-lg p-3">
              {proyecto.colaboradores?.length ? 
                proyecto.colaboradores?.map( colaborador => (
                  <Colaborador 
                    key={colaborador._id}
                    colaborador={colaborador}
                  />
                ))
              : 
                <p className="text-center my-5 p-10">No hay colaboradores en este proyecto</p>
              }
            </div>
          </>
        )}

        <ModalFormularioTarea />
        <ModalEliminarTarea />
        <ModalEliminarColaborador />
      </>
  )

}

export default Proyecto