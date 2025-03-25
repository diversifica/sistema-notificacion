import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { plantillaService } from '../../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Componentes
import Layout from '../../../components/Layout';

interface Plantilla {
  id: number;
  nombre: string;
  asunto: string;
  contenido: string;
  tipo: string;
  activo: boolean;
}

const PlantillasPage: React.FC = () => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  useEffect(() => {
    fetchPlantillas();
  }, []);

  const fetchPlantillas = async () => {
    try {
      setLoading(true);
      const data = await plantillaService.getAll(true);
      setPlantillas(data);
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      toast.error('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plantilla: Plantilla) => {
    setEditingPlantilla(plantilla);
    formik.setValues({
      nombre: plantilla.nombre,
      asunto: plantilla.asunto,
      contenido: plantilla.contenido,
      tipo: plantilla.tipo,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingPlantilla(null);
    formik.resetForm();
    setShowForm(true);
  };

  const handleToggleActive = async (id: number, activo: boolean) => {
    try {
      await plantillaService.toggleActive(id, !activo);
      toast.success(`Plantilla ${activo ? 'desactivada' : 'activada'} correctamente`);
      fetchPlantillas();
    } catch (error) {
      console.error('Error al cambiar estado de plantilla:', error);
      toast.error('Error al cambiar estado de la plantilla');
    }
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es obligatorio'),
    asunto: Yup.string().required('El asunto es obligatorio'),
    contenido: Yup.string().required('El contenido es obligatorio'),
    tipo: Yup.string().required('El tipo es obligatorio'),
  });

  const formik = useFormik({
    initialValues: {
      nombre: '',
      asunto: '',
      contenido: '',
      tipo: 'ALTA',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setProcesando(true);
        if (editingPlantilla) {
          await plantillaService.update(editingPlantilla.id, values);
          toast.success('Plantilla actualizada correctamente');
        } else {
          await plantillaService.create(values);
          toast.success('Plantilla creada correctamente');
        }
        setShowForm(false);
        fetchPlantillas();
      } catch (error) {
        console.error('Error al guardar plantilla:', error);
        toast.error('Error al guardar la plantilla');
      } finally {
        setProcesando(false);
      }
    },
  });

  return (
    <Layout title="Plantillas de Correo">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Plantillas</h2>
            <button
              onClick={handleNew}
              className="btn-primary"
            >
              Nueva Plantilla
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando plantillas...</div>
          ) : (
            <>
              {!showForm && (
                <>
                  {plantillas.length === 0 ? (
                    <div className="text-center py-4">No hay plantillas configuradas</div>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Asunto
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
                          {plantillas.map((plantilla) => (
                            <tr key={plantilla.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {plantilla.nombre}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{plantilla.asunto}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {plantilla.tipo === 'ALTA' ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Alta
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Baja
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {plantilla.activo ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Activa
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    Inactiva
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(plantilla)}
                                  className="text-primary-600 hover:text-primary-900 mr-3"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleToggleActive(plantilla.id, plantilla.activo)}
                                  className={`${
                                    plantilla.activo
                                      ? 'text-red-600 hover:text-red-900'
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                >
                                  {plantilla.activo ? 'Desactivar' : 'Activar'}
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
                      {editingPlantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}
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
                              <option value="ALTA">Alta</option>
                              <option value="BAJA">Baja</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="asunto" className="block text-sm font-medium text-gray-700">
                            Asunto *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="asunto"
                              name="asunto"
                              value={formik.values.asunto}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                formik.touched.asunto && formik.errors.asunto ? 'border-red-300' : ''
                              }`}
                            />
                            {formik.touched.asunto && formik.errors.asunto && (
                              <p className="mt-2 text-sm text-red-600">{formik.errors.asunto}</p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="contenido" className="block text-sm font-medium text-gray-700">
                            Contenido *
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="contenido"
                              name="contenido"
                              rows={10}
                              value={formik.values.contenido}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                formik.touched.contenido && formik.errors.contenido ? 'border-red-300' : ''
                              }`}
                            />
                            {formik.touched.contenido && formik.errors.contenido && (
                              <p className="mt-2 text-sm text-red-600">{formik.errors.contenido}</p>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Puede usar las siguientes variables: {'{nombre}'}, {'{apellidos}'}, {'{email}'}, {'{finess}'}, {'{fecha_alta}'}, {'{fecha_baja}'}
                          </p>
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

export default PlantillasPage;
