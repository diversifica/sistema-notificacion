import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fisioterapeutaService } from '../../services/api';

// Componentes
import Layout from '../../components/Layout';

interface Fisioterapeuta {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  finess: string;
  fecha_alta: string;
  fecha_notificacion_alta: string | null;
}

const FisioterapeutasActivos: React.FC = () => {
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFisioterapeutas, setSelectedFisioterapeutas] = useState<number[]>([]);
  const [enviandoNotificaciones, setEnviandoNotificaciones] = useState<boolean>(false);

  useEffect(() => {
    const fetchFisioterapeutas = async () => {
      try {
        setLoading(true);
        const data = await fisioterapeutaService.getActivos();
        setFisioterapeutas(data);
      } catch (error) {
        console.error('Error al obtener fisioterapeutas activos:', error);
        toast.error('Error al cargar fisioterapeutas activos');
      } finally {
        setLoading(false);
      }
    };

    fetchFisioterapeutas();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Seleccionar solo los que no tienen notificación de alta
      const pendientesIds = fisioterapeutas
        .filter(f => !f.fecha_notificacion_alta)
        .map(f => f.id);
      setSelectedFisioterapeutas(pendientesIds);
    } else {
      setSelectedFisioterapeutas([]);
    }
  };

  const handleSelectFisioterapeuta = (id: number) => {
    if (selectedFisioterapeutas.includes(id)) {
      setSelectedFisioterapeutas(selectedFisioterapeutas.filter(fId => fId !== id));
    } else {
      setSelectedFisioterapeutas([...selectedFisioterapeutas, id]);
    }
  };

  const handleEnviarNotificaciones = async () => {
    if (selectedFisioterapeutas.length === 0) {
      toast.warning('Seleccione al menos un fisioterapeuta');
      return;
    }

    try {
      setEnviandoNotificaciones(true);
      await fisioterapeutaService.registrarNotificacionAlta(selectedFisioterapeutas[0]);
      toast.success('Notificaciones enviadas correctamente');
      
      // Actualizar la lista
      const data = await fisioterapeutaService.getActivos();
      setFisioterapeutas(data);
      setSelectedFisioterapeutas([]);
    } catch (error) {
      console.error('Error al enviar notificaciones:', error);
      toast.error('Error al enviar notificaciones');
    } finally {
      setEnviandoNotificaciones(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <Layout title="Fisioterapeutas Activos">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Listado de Fisioterapeutas Activos</h2>
            <div className="flex space-x-2">
              <Link
                to="/fisioterapeutas/nuevo"
                className="btn-primary"
              >
                Nuevo Fisioterapeuta
              </Link>
              <button
                onClick={handleEnviarNotificaciones}
                disabled={selectedFisioterapeutas.length === 0 || enviandoNotificaciones}
                className="btn-secondary disabled:opacity-50"
              >
                {enviandoNotificaciones ? 'Enviando...' : 'Enviar Notificaciones'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando fisioterapeutas...</div>
          ) : (
            <>
              {fisioterapeutas.length === 0 ? (
                <div className="text-center py-4">No hay fisioterapeutas activos</div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={selectedFisioterapeutas.length > 0 && 
                              selectedFisioterapeutas.length === fisioterapeutas.filter(f => !f.fecha_notificacion_alta).length}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          FINESS
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Alta
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notificación
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fisioterapeutas.map((fisioterapeuta) => (
                        <tr key={fisioterapeuta.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              disabled={!!fisioterapeuta.fecha_notificacion_alta}
                              checked={selectedFisioterapeutas.includes(fisioterapeuta.id)}
                              onChange={() => handleSelectFisioterapeuta(fisioterapeuta.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {fisioterapeuta.nombre} {fisioterapeuta.apellidos}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{fisioterapeuta.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{fisioterapeuta.finess}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(fisioterapeuta.fecha_alta)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {fisioterapeuta.fecha_notificacion_alta ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Notificado: {formatDate(fisioterapeuta.fecha_notificacion_alta)}
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/fisioterapeutas/${fisioterapeuta.id}`}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                            >
                              Ver
                            </Link>
                            <Link
                              to={`/fisioterapeutas/editar/${fisioterapeuta.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Editar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FisioterapeutasActivos;
