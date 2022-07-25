import { useState, useEffect, createContext } from "react";
import clienteAxios from "../config/clienteAxios";
import { useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";
import { io } from "socket.io-client";

let socket;

const ProyectosContext = createContext();

const ProyectosProvider = ({children}) => {

    const [proyectos, setProyectos] = useState([]);
    const [alerta, setAlerta] = useState({});
    const [proyecto, setProyecto] = useState({});
    const [cargando, setCargando] = useState(false);
    const [modalFormularioTarea, setModalFormularioTarea] = useState(false);
    const [tarea, setTarea] = useState({});
    const [modalEliminarTarea, setModalEliminarTarea] = useState(false);
    const [colaborador, setColaborador] = useState({});
    const [modalEliminarColaborador, setModalEliminarColaborador] = useState(false);
    const [buscador, setBuscador] = useState(false);

    const navigate = useNavigate();

    // informacion de autenticacion del usuario
    const { auth } = useAuth();

    useEffect(() => {
      const obtenerProyectos = async () => {
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de configuracion para obtener los proyectos con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            // Consultamos los proyectos en la DB
            const { data } = await clienteAxios('/proyectos', config);
            
            //seteamos los proyectos
            setProyectos(data);
        } catch (error) {
            console.log(error)
        }
      }
      obtenerProyectos();
    }, [auth])

    // effect encargado de la conexcion a socket.io
    useEffect(() => {
        // Abrimos la conexion a la DB
      socket = io(import.meta.env.VITE_BACKEND_URL);
    }, [])
    
    

    const mostrarAlerta = alerta => {
        setAlerta(alerta);

        setTimeout(() => {
            setAlerta({})
        }, 2200);
    }

    const submitProyecto = async proyecto => {
        
        // Verificacion de si esta editando o esta creando un nuevo proyecto
        if(proyecto.id) {
            await editarProyecto(proyecto);
        } else {
            await nuevoProyecto(proyecto);
        }

    }

    const editarProyecto = async (proyecto) => {
        try {
            // validacion de usuario
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de configuracion para el envio del proyecto editado
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            // hace la peticion al back para actualizar la DB
            const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config);
            
            //Sincronizar el state para vizualizar los proyectos
            const proyectosActualizados = proyectos.map(proyectoState => proyectoState._id === data._id ? data : proyectoState);
            setProyectos(proyectosActualizados);

            //mostramos la alerta
            setAlerta({
                msg: "Proyecto Actualizado Correctamente 🦄✨",
                error: false
            })

            setTimeout(() => {
                setAlerta({}); // elimina la alerta
                navigate('/proyectos'); // te lleva a la pagina de proyectos
            }, 2200);
        } catch (error) {
            console.log(error);
        }
    }

    const nuevoProyecto = async (proyecto) => {
        try {
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de configuracion para el envio del proyecto
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            // insertamos el proyecto en la base de datos
            const { data } = await clienteAxios.post('/proyectos', proyecto, config);
            
            //actualizamos el state de proyectos para una visualizacion más dinamica
            setProyectos([...proyectos, data]);

            setAlerta({
                msg: 'Proyecto creado correctamente 🦄✨',
                error: false
            })

            setTimeout(() => {
                setAlerta({}); // elimina la alerta
                navigate('/proyectos'); // te lleva a la pagina de proyectos
            }, 2200);
        } catch (error) {
            console.log(error);
        }
    }

    const obtenerProyecto = async id => {
        setCargando(true)
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para traer el proyecto por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            // consultamos la DB en busqueda del proyecto por el id
            const { data } = await clienteAxios(`/proyectos/${id}`, config)
            // seteamos el proyecto
            setProyecto(data);
            setAlerta({})
        } catch (error) {
            navigate('/proyectos');
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
            setTimeout(() => {
                setAlerta({});
            }, 3000);
        } finally {
            setCargando(false)
        }
    }

    const eliminarProyecto = async id => {
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para eliminar el proyecto por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            // consultamos la DB para eliminar el proyecto por el id
            const { data } = await clienteAxios.delete(`/proyectos/${id}`, config)
            
            //sincronizamos el state
            const proyectosActualizados = proyectos.filter(proyectoState => proyectoState._id !== id);
            setProyectos(proyectosActualizados);

            // creamos una alerta para la eliminacion
            setAlerta({
                msg: data.msg,
                error: false
            })

            setTimeout(() => {
                setAlerta({}); // elimina la alerta
                navigate('/proyectos'); // te lleva a la pagina de proyectos
            }, 2200);
        } catch (error) {
            console.log(error);
        }
    }

    const handleModalTarea = () => {
        setModalFormularioTarea(!modalFormularioTarea);
        setTarea({});
    }

    const submitTarea = async tarea => {

        // analizamos si la tarea ya tiene un id para saber si esta editando o creando una
        if(tarea?.id) {
            // si tiene un id esta editando
            await editarTarea(tarea);
        } else {
            // si no tiene un id entonces esta creando una tarea
            await crearTarea(tarea);
        }

        return
    } 

    const crearTarea = async tarea => {
        // envio de la tarea a la base de datos
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para crear y almacenar una tarea por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post('/tareas', tarea, config);

            //socket io 
            socket.emit('nueva tarea', data);
            
            setAlerta({});
            setModalFormularioTarea(false);
        } catch (error) {
            console.log(error);
        }
    }

    const editarTarea = async tarea => {
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para editar la tarea por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config);
            
            // spcket.io
            socket.emit('actualizar tarea', data);

            // reiniciar el alerta y cerrar el modal 
            setAlerta({}); // vacia el state de alerta
            setModalFormularioTarea(false); //cierra el modal
        } catch (error) {
            console.log(error);
        }
    }

    const handleModalEditarTarea = tarea => {
        // Colocamos la tarea en el state
        setTarea(tarea);
        // abrimos el formulario
        setModalFormularioTarea(true);
    }

    const handleModalEliminarTarea = tarea => {
        setTarea(tarea);
        setModalEliminarTarea(!modalEliminarTarea);
    }

    const eliminarTarea = async () => {
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para eliminar el proyecto por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            // consulta para eliminar la tarea en la DB
            const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, config);
            
            setAlerta({
                msg: data.msg,
                error: false
            }); 
            
            setModalEliminarTarea(false); //cierra el modal
            
            //socket.io
            socket.emit('eliminar tarea', tarea)

            //reiniciamos el state de tarea y eliminamos la tarea
            setTarea({});
            setTimeout(() => {
                setAlerta({});
            }, 2200);

        } catch (error) {
            console.log(error);
        }
    }

    const submitColaborador = async email => {
        setCargando(true);
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para eliminar el proyecto por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post('/proyectos/colaboradores', { email }, config);

            setColaborador(data);
            setAlerta({});
        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
        } finally {
            setCargando(false);
        }
    }
    
    const agregarColaborador = async email => {
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para eliminar el proyecto por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`, email, config);

            mostrarAlerta({ msg: data.msg, error: false });

            setColaborador({});
            
        } catch (error) {
            mostrarAlerta({ msg: error.response.data.msg, error: true })
        }
    }

    const handleModalEliminarColaborador = (colaborador) => {
        setModalEliminarColaborador(!modalEliminarColaborador);
        setColaborador(colaborador)
    }

    const eliminarColaborador = async () => {
        
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para eliminar el proyecto por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post(`/proyectos/eliminar-colaborador/${proyecto._id}`, { id: colaborador._id }, config);

            // actualizacion del DOM
            const proyectoActualizado = {...proyecto};
            proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter( colaboradorState => colaboradorState._id !== colaborador._id);
            setProyecto(proyectoActualizado);

            // mostramos un alerta
            mostrarAlerta({ msg: data.msg, error: false});
            
            // Reiniciamos el obj colaborador y cerramos el modal
            setColaborador({});
            setModalEliminarColaborador(false);

        } catch (error) {
            console.log(error);
        }
    }

    const completarTarea = async id => {
        try {
            // Tomamos el token de LocalStorage
            const token = localStorage.getItem('token');
            if(!token) return

            //creacion de la configuracion para eliminar el proyecto por id con el bearer token
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, config);
            
            // socket.io
            socket.emit('cambiar estado', data);

            setTarea({});
            setAlerta({});
        } catch (error) {
            console.log(error.response);
        }
    }

    const handleBuscador = () => {
        setBuscador(!buscador);
    }

    // Socket IO
    const submitTareasProyecto = (tarea) => {
        // Agrega la tarea al state
        const proyectoActualizado = {...proyecto }
        proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea];
        setProyecto(proyectoActualizado);
    }

    const eliminarTareaProyecto = tarea => {
        //Actualizacion del state 
        const proyectoActualizado = {...proyecto};
        proyectoActualizado.tareas = proyectoActualizado.tareas.filter( tareaState => tareaState._id !== tarea._id)
        setProyecto(proyectoActualizado); //setea el proyecto con las tareas actualizadas
    }

    const actualizarTareaProyecto = tarea => {
        //Actualizacion del state
        const proyectoActualizado = {...proyecto};
        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState);
        setProyecto(proyectoActualizado); //setea el proyecto con las tareas actualizadas
    }

    const cambiarEstadoTarea = tarea => {
        //actualizamos el state en el cliente
        const proyectoActualizado = {...proyecto};
        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState);
        setProyecto(proyectoActualizado);
    }

    const cerrarSesionProyectos = () => {
        // Eliminamos todo el state que este disponible
        setProyectos([]);
        setProyecto({});
        setAlerta({});

    }

    return(
        <ProyectosContext.Provider
            value={{
                proyectos,
                mostrarAlerta,
                alerta,
                submitProyecto,
                obtenerProyecto,
                proyecto, 
                cargando,
                eliminarProyecto,
                modalFormularioTarea,
                handleModalTarea,
                submitTarea,
                handleModalEditarTarea,
                tarea,
                modalEliminarTarea,
                handleModalEliminarTarea,
                eliminarTarea,
                submitColaborador,
                colaborador,
                agregarColaborador,
                handleModalEliminarColaborador,
                modalEliminarColaborador,
                eliminarColaborador,
                completarTarea,
                buscador,
                handleBuscador,
                submitTareasProyecto,
                eliminarTareaProyecto,
                actualizarTareaProyecto,
                cambiarEstadoTarea,
                cerrarSesionProyectos
            }}
        >
            {children}
        </ProyectosContext.Provider>
    )
}

export {
    ProyectosProvider
}

export default ProyectosContext;