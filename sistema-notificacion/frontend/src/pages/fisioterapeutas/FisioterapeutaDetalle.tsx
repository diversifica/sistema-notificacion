import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fisioterapeutaService, contratoService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Componentes
import Layout from '../../components/Layout';

interface Fisioterapeuta {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  finess: string;
  fecha_alta: string;
  fecha_baja: string | null;
  fecha_notificacion_alta: string | null;
  fecha_notificacion_baja: string | null;
  estado: string;
  ruta_contrato: string | null;
}

interface Contrato {
  id: number;
  fisioterapeuta_id: number;
  nombre_archivo: string;
  ruta_archivo: string;
  fecha_subida: string;
}

const FisioterapeutaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const [fisioterapeuta, setFisioterapeuta] = useState<Fisioterapeuta | null>(null);
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fechaBaja, setFechaBaja] = useState<string>('');
  const [showBajaForm, setShowBajaForm] = useState<boolean>(false);
  const [procesandoBaja, setProcesandoBaja] = useState<boolean>(false);

  useEffect(() => {
    const fetchFisioterapeuta = async () => {
      try {
        setLoading(true);
        const data = await fisioterapeutaService.getById(Number(id));
        setFisioterapeuta(data);
        setContrato(data.contrato || null);
      } catch (error) {
        console.error('Error al obtener fisioterapeuta:', error);
        toast.error('Error al cargar datos del fisioterapeuta');
        navigate('/fisioterapeutas/activos');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFisioterapeuta();
    }
  }, [id, navigate]);

  const handleDarDeBaja = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fechaBaja) {
      toast.warning('Debe seleccionar una fecha de baja');
      return;
    }

    try {
      setProcesandoBaja(true);
      await fisioterapeutaService.darDeBaja(Number(id), fechaBaja);
      toast.success('Fisioterapeuta dado de baja correctamente');
      
      // Actualizar datos
      const data = await fisioterapeutaService.getById(Number(id));
      setFisioterapeuta(data);
      setShowBajaForm(false);
    } catch (error) {
      console.error('Error al dar de baja:', error);
      toast.error('Error al dar de baja al fisioterapeuta');
    } finally {
      setProcesandoBaja(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <Layout title="Detalle de Fisioterapeuta">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-4">Cargando datos...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!fisioterapeuta) {
    return (
      <Layout title="Detalle de Fisioterapeuta">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-4">Fisioterapeuta no encontrado</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Fisioterapeuta: ${fisioterapeuta.nombre} ${fisioterapeuta.apellidos}`}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Información del Fisioterapeuta
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Detalles personales y estado
                </p>
              </div>
              <div className="flex space-x-2">
                {isAdmin && fisioterapeuta.estado === 'ACTIVO' && (
                  <>
                    <Link
                      to={`/fisioterapeutas/editar/${fisioterapeuta.id}`}
                      className="btn-primary"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setShowBajaForm(!showBajaForm)}
                      className="btn-danger"
                    >
                      Dar de Baja
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fisioterapeuta.nombre} {fisioterapeuta.apellidos}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fisioterapeuta.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">FINESS</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fisioterapeuta.finess}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    {fisioterapeuta.estado === 'ACTIVO' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Alta</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(fisioterapeuta.fecha_alta)}
                  </dd>
                </div>
                {fisioterapeuta.fecha_notificacion_alta && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notificación de Alta</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(fisioterapeuta.fecha_notificacion_alta)}
                    </dd>
                  </div>
                )}
                {fisioterapeuta.fecha_baja && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha de Baja</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(fisioterapeuta.fecha_baja)}
                    </dd>
                  </div>
                )}
                {fisioterapeuta.fecha_notificacion_baja && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notificación de Baja</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(fisioterapeuta.fecha_notificacion_baja)}
                    </dd>
                  </div>
                )}
                {contrato && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Contrato</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex items-center">
                        <span className="mr-2">{contrato.nombre_archivo}</span>
                        <a
                          href={`/api/contratos/download/${contrato.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Descargar
                        </a>
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {showBajaForm && (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Dar de Baja al Fisioterapeuta
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Seleccione la fecha de baja
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={handleDarDeBaja}>
                  <div className="mb-4">
                    <label htmlFor="fecha_baja" className="block text-sm font-medium text-gray-700">
                      Fecha de Baja
                    </label>
                    <input
                      type="date"
                      id="fecha_baja"
                      name="fecha_baja"
                      value={fechaBaja}
                      onChange={(e) => setFechaBaja(e.target.value)}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowBajaForm(false)}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={procesandoBaja}
                      className="btn-danger"
                    >
                      {procesandoBaja ? 'Procesando...' : 'Confirmar Baja'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FisioterapeutaDetalle;
