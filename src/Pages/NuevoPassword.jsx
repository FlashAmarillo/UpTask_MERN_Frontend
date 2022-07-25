import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";
import Alerta from "../components/Alerta";

const NuevoPassword = () => {

  const [password, setPassword] = useState('');
  const [tokenValido, setTokenValido] = useState(false);
  const [alerta, setAlerta] = useState({});
  const [passwordModificado, setPasswordModificado] = useState(false);

  const params = useParams();
  const { token } = params;

  useEffect(() => {
    const comprobarToken = async() => {
      try {
        await clienteAxios(`/usuarios/olvide-password/${token}`);
        setTokenValido(true);
      } catch (error) {
        setAlerta({
          msg: error.response.data.msg,
          error: true
        })
      }
    }

    comprobarToken();
  }, [])
  
  const { msg } = alerta;

  const handleSubmit = async e => {
    e.preventDefault();

    //validacion
    if( password.length < 6) {
      setAlerta({
        msg: "El password debe ser mínimo de 6 caracteres",
        error: true
      })
      return;
    }

    //almacenar en la DB
    try {
      const url = `/usuarios/olvide-password/${token}`;
      const { data } = await clienteAxios.post(url, { password });
      setPasswordModificado(true);
      setAlerta({
        msg: data.msg,
        error: false
      })

    } catch (error) {
     setAlerta({
      msg: error.response.data.msg,
      error: true
     }) 
    }


  }

  return (
    <>
      <h1 className="text-sky-600 font-black text-3xl md:text-6xl capitalize">Reestablece tu password y no pierdas acceso a tus {' '}<span className="text-slate-700">proyectos</span></h1>
      
      { msg && <Alerta alerta={alerta} /> }

      {tokenValido && (
        <form 
          className="my-10 bg-white shadow rounded-lg p-10"
          onSubmit={handleSubmit}
        >
          
          <div className="my-5 ">
            <label 
              className="uppercase text-gray-600 block text-xl font-bold"
              htmlFor="password"
            >Nuevo Password</label>
            <input 
              id="password"
              type="password"
              placeholder="Escribe tu Nuevo Password"
              className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <input 
            type="submit"
            value="Guardar Nuevo Password"
            className="bg-sky-700 w-full mb-5 py-3 text-white uppercase font-bold rounded-xl hover:cursor-pointer hover:bg-sky-900 transition-colors"
          />
        </form>
      )}

      {passwordModificado && (
        <Link
          className="block text-center my-3 text-slate-500 uppercase text-sm"
          to="/"
        >Inicia sesión aquí</Link>
      )}

    </>
  )
}

export default NuevoPassword