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
  fecha_baja: string;
  fecha_notificacion_baja: string | null;
}

const FisioterapeutasInactivos: React.FC = () => {
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFisioterapeutas, setSelectedFisioterapeutas] = useState<number[]>([]);
  const [enviandoNotificaciones, setEnviandoNotificaciones] = useState<boolean>(false);

  useEffect(() => {
    const fetchFisioterapeutas = async () => {
      try {
        setLoading(true);
        const data = await fisioterapeutaService.getInactivos();
        setFisioterapeutas(data);
      } catch (error) {
        console.error('Error al obtener fisioterapeutas inactivos:', error);
        toast.error('Error al cargar fisioterapeutas inactivos');
      } finally {
        setLoading(false);
      }
    };

    fetchFisioterapeutas();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Seleccionar solo los que no tienen notificación de baja
      const pendientesIds = fisioterapeutas
        .filter(f => !f.fecha_notificacion_baja)
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
      await fisioterapeutaService.registrarNotificacionBaja(selectedFisioterapeutas[0]);
      toast.success('Notificaciones enviadas correctamente');
      
      // Actualizar la lista
      const data = await fisioterapeutaService.getInactivos();
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
    <Layout title="Fisioterapeutas Inactivos">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Listado de Fisioterapeutas Inactivos</h2>
            <button
              onClick={handleEnviarNotificaciones}
              disabled={selectedFisioterapeutas.length === 0 || enviandoNotificaciones}
              className="btn-secondary disabled:opacity-50"
            >
              {enviandoNotificaciones ? 'Enviando...' : 'Enviar Notificaciones de Baja'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando fisioterapeutas...</div>
          ) : (
            <>
              {fisioterapeutas.length === 0 ? (
                <div className="text-center py-4">No hay fisioterapeutas inactivos</div>
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
                              selectedFisioterapeutas.length === fisioterapeutas.filter(f => !f.fecha_notificacion_baja).length}
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
                          Fecha Baja
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
                              disabled={!!fisioterapeuta.fecha_notificacion_baja}
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
                            <div className="text-sm text-gray-500">{formatDate(fisioterapeuta.fecha_baja)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {fisioterapeuta.fecha_notificacion_baja ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Notificado: {formatDate(fisioterapeuta.fecha_notificacion_baja)}
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
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Ver
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

export default FisioterapeutasInactivos;
