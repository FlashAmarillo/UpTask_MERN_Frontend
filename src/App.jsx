import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AuthLayout from './Layouts/AuthLayout';
import RutaProtegida from './Layouts/RutaProtegida';

import Login from './Pages/Login';
import Registrar from './Pages/Registrar';
import OlvidePassword from "./Pages/OlvidePassword";
import NuevoPassword from "./Pages/NuevoPassword";
import ConfirmarCuenta from "./Pages/ConfirmarCuenta";
import Proyectos from './Pages/Proyectos';
import NuevoProyecto from './Pages/NuevoProyecto';
import Proyecto from './Pages/Proyecto';
import EditarProyecto from './Pages/EditarProyecto';
import NuevoColaborador from './Pages/NuevoColaborador';

import {AuthProvider} from "./context/AuthProvider";
import {ProyectosProvider} from "./context/ProyectosProvider"

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <ProyectosProvider>
          <Routes>
              <Route path='/' element={<AuthLayout />}>
                <Route index element={<Login />} />
                <Route path="registrar" element={<Registrar />} />
                <Route path="olvide-password" element={<OlvidePassword />} />
                <Route path="olvide-password/:token" element={<NuevoPassword />} />
                <Route path="confirmar/:id" element={<ConfirmarCuenta />} />
                
              </Route>

              <Route path='/proyectos' element={<RutaProtegida />}>
                <Route index element={<Proyectos />} />
                <Route path='crear-proyecto' element={<NuevoProyecto />} />
                <Route path='nuevo-colaborador/:id' element={<NuevoColaborador />} />
                <Route path=':id' element={<Proyecto />} /> {/* Elemento de routing dinamico */}
                <Route path='editar/:id' element={<EditarProyecto />} />
              </Route>
          </Routes>
        </ProyectosProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
