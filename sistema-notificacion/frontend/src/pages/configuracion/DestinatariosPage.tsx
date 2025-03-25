import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { destinatarioService } from '../../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Componentes
import Layout from '../../../components/Layout';

interface Destinatario {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
  activo: boolean;
}

const DestinatariosPage: React.FC = () => {
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingDestinatario, setEditingDestinatario] = useState<Destinatario | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  useEffect(() => {
    fetchDestinatarios();
  }, []);

  const fetchDestinatarios = async () => {
    try {
      setLoading(true);
      const data = await destinatarioService.getAll(true);
      setDestinatarios(data);
    } catch (error) {
      console.error('Error al obtener destinatarios:', error);
      toast.error('Error al cargar destinatarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (destinatario: Destinatario) => {
    setEditingDestinatario(destinatario);
    formik.setValues({
      nombre: destinatario.nombre,
      email: destinatario.email,
      tipo: destinatario.tipo,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingDestinatario(null);
    formik.resetForm();
    setShowForm(true);
  };

  const handleToggleActive = async (id: number, activo: boolean) => {
    try {
      await destinatarioService.toggleActive(id, !activo);
      toast.success(`Destinatario ${activo ? 'desactivado' : 'activado'} correctamente`);
      fetchDestinatarios();
    } catch (error) {
      console.error('Error al cambiar estado de destinatario:', error);
      toast.error('Error al cambiar estado del destinatario');
    }
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es obligatorio'),
    email: Yup.string().email('Email inválido').required('El email es obligatorio'),
    tipo: Yup.string().required('El tipo es obligatorio'),
  });

  const formik = useFormik({
    initialValues: {
      nombre: '',
      email: '',
      tipo: 'SEGURIDAD_SOCIAL',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setProcesando(true);
        if (editingDestinatario) {
          await destinatarioService.update(editingDestinatario.id, values);
          toast.success('Destinatario actualizado correctamente');
        } else {
          await destinatarioService.create(values);
          toast.success('Destinatario creado correctamente');
        }
        setShowForm(false);
        fetchDestinatarios();
      } catch (error) {
        console.error('Error al guardar destinatario:', error);
        toast.error('Error al guardar el destinatario');
      } finally {
        setProcesando(false);
      }
    },
  });

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'SEGURIDAD_SOCIAL':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Seguridad Social
          </span>
        );
      case 'COLEGIO_FISIOTERAPEUTAS':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Colegio de Fisioterapeutas
          </span>
        );
      case 'FISIOTERAPEUTA':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Fisioterapeuta
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {tipo}
          </span>
        );
    }
  };

  return (
    <Layout title="Destinatarios de Notificaciones">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Destinatarios</h2>
            <button
              onClick={handleNew}
              className="btn-primary"
            >
              Nuevo Destinatario
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando destinatarios...</div>
          ) : (
            <>
              {!showForm && (
                <>
                  {destinatarios.length === 0 ? (
                    <div className="text-center py-4">No hay destinatarios configurados</div>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {destinatarios.map((destinatario) => (
                            <tr key={destinatario.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {destinatario.nombre}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{destinatario.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getTipoLabel(destinatario.tipo)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {destinatario.activo ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Activo
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    Inactivo
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(destinatario)}
                                  className="text-primary-600 hover:text-primary-900 mr-3"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleToggleActive(destinatario.id, destinatario.activo)}
                                  className={`${
                                    destinatario.activo
                                      ? 'text-red-600 hover:text-red-900'
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                >
                                  {destinatario.activo ? 'Desactivar' : 'Activar'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {showForm && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingDestinatario ? 'Editar Destinatario' : 'Nuevo Destinatario'}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Complete todos los campos obligatorios
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <form onSubmit={formik.handleSubmit}>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                            Nombre *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="nombre"
                              name="nombre"
                              value={formik.values.nombre}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                formik.touched.nombre && formik.errors.nombre ? 'border-red-300' : ''
                              }`}
                            />
                            {formik.touched.nombre && formik.errors.nombre && (
                              <p className="mt-2 text-sm text-red-600">{formik.errors.nombre}</p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                            Tipo *
                          </label>
                          <div className="mt-1">
                            <select
                              id="tipo"
                              name="tipo"
                              value={formik.values.tipo}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="SEGURIDAD_SOCIAL">Seguridad Social</option>
                              <option value="COLEGIO_FISIOTERAPEUTAS">Colegio de Fisioterapeutas</option>
                              <option value="FISIOTERAPEUTA">Fisioterapeuta</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email *
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formik.values.email}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                formik.touched.email && formik.errors.email ? 'border-red-300' : ''
                              }`}
                            />
                            {formik.touched.email && formik.errors.email && (
                              <p className="mt-2 text-sm text-red-600">{formik.errors.email}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="btn-secondary mr-3"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={procesando || !formik.isValid}
                            className="btn-primary"
                          >
                            {procesando ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DestinatariosPage;
