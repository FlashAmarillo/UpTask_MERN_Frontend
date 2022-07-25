import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";
import Alerta from "../components/Alerta";

const ConfirmarCuenta = () => {

  const [alerta, setAlerta] = useState({});
  const [cuentaConfirmada, setCuentaConfirmada] = useState(false);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const confirmarCuenta = async() => {
      try {
        //definimos la url para hacer la peticion para confirmar el usuario
        const url = `/usuarios/confirmar/${id}`
        // enviamos la peticion para confirmar el usuario con la url
        const { data } = await clienteAxios(url);

        // definimos un mensaje de exito
        setAlerta({
          msg: data.msg,
          error: false
        })

        setCuentaConfirmada(true);

      } catch (error) {
        setAlerta({
          msg: error.response.data.msg,
          error: true
        })
      }
    }

    confirmarCuenta()
  }, [])
  
  const { msg } = alerta;

  return (
    <>
      <h1 className="text-sky-600 font-black text-3xl md:text-6xl capitalize">Confirma tu cuenta y comienza a crear {' '}<span className="text-slate-700">proyectos</span></h1>
    
      <div className="mt-20 md:mt-10 shadow-lg px-5 py-10 rounded-xl bg-white">
        {msg && <Alerta alerta={alerta} />}

        {cuentaConfirmada && (
          <Link
            className="block text-center my-3 text-slate-500 uppercase text-sm"
            to="/"
          >Inicia sesión aquí</Link>
        )}
      </div>
    </>
  )
}

export default ConfirmarCuenta