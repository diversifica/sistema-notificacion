import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { configuracionService } from '../../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Componentes
import Layout from '../../../components/Layout';

interface Configuracion {
  clave: string;
  valor: string;
  descripcion: string;
}

interface EmailConfig {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

const ConfiguracionPage: React.FC = () => {
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: '',
    port: '',
    secure: false,
    user: '',
    password: '',
    from: '',
  });
  const [procesando, setProcesando] = useState<boolean>(false);

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  const fetchConfiguraciones = async () => {
    try {
      setLoading(true);
      const data = await configuracionService.getAll();
      setConfiguraciones(data);
      
      const email = await configuracionService.getEmailConfig();
      setEmailConfig({
        host: email.host || '',
        port: email.port || '',
        secure: email.secure || false,
        user: email.user || '',
        password: email.password || '',
        from: email.from || '',
      });
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const emailFormik = useFormik({
    initialValues: emailConfig,
    enableReinitialize: true,
    validationSchema: Yup.object({
      host: Yup.string().required('El host es obligatorio'),
      port: Yup.string().required('El puerto es obligatorio'),
      secure: Yup.boolean(),
      user: Yup.string().required('El usuario es obligatorio'),
      password: Yup.string().required('La contraseña es obligatoria'),
      from: Yup.string().email('Email inválido').required('El remitente es obligatorio'),
    }),
    onSubmit: async (values) => {
      try {
        setProcesando(true);
        
        // Guardar cada configuración de email
        await configuracionService.set('EMAIL_HOST', values.host, 'Host del servidor SMTP');
        await configuracionService.set('EMAIL_PORT', values.port, 'Puerto del servidor SMTP');
        await configuracionService.set('EMAIL_SECURE', values.secure.toString(), 'Conexión segura SMTP');
        await configuracionService.set('EMAIL_USER', values.user, 'Usuario SMTP');
        await configuracionService.set('EMAIL_PASSWORD', values.password, 'Contraseña SMTP');
        await configuracionService.set('EMAIL_FROM', values.from, 'Dirección de correo remitente');
        
        toast.success('Configuración de correo guardada correctamente');
        fetchConfiguraciones();
      } catch (error) {
        console.error('Error al guardar configuración de correo:', error);
        toast.error('Error al guardar la configuración de correo');
      } finally {
        setProcesando(false);
      }
    },
  });

  const configFormik = useFormik({
    initialValues: {
      clave: '',
      valor: '',
      descripcion: '',
    },
    validationSchema: Yup.object({
      clave: Yup.string().required('La clave es obligatoria'),
      valor: Yup.string().required('El valor es obligatorio'),
      descripcion: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setProcesando(true);
        await configuracionService.set(values.clave, values.valor, values.descripcion);
        toast.success('Configuración guardada correctamente');
        fetchConfiguraciones();
        configFormik.resetForm();
      } catch (error) {
        console.error('Error al guardar configuración:', error);
        toast.error('Error al guardar la configuración');
      } finally {
        setProcesando(false);
      }
    },
  });

  const handleDeleteConfig = async (clave: string) => {
    try {
      await configuracionService.delete(clave);
      toast.success('Configuración eliminada correctamente');
      fetchConfiguraciones();
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      toast.error('Error al eliminar la configuración');
    }
  };

  return (
    <Layout title="Configuración del Sistema">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración de Correo Electrónico</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Servidor SMTP
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configuración para el envío de notificaciones por correo
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={emailFormik.handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="host" className="block text-sm font-medium text-gray-700">
                        Host SMTP *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="host"
                          name="host"
                          value={emailFormik.values.host}
                          onChange={emailFormik.handleChange}
                          onBlur={emailFormik.handleBlur}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            emailFormik.touched.host && emailFormik.errors.host ? 'border-red-300' : ''
                          }`}
                        />
                        {emailFormik.touched.host && emailFormik.errors.host && (
                          <p className="mt-2 text-sm text-red-600">{emailFormik.errors.host}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                        Puerto *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="port"
                          name="port"
                          value={emailFormik.values.port}
                          onChange={emailFormik.handleChange}
                          onBlur={emailFormik.handleBlur}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            emailFormik.touched.port && emailFormik.errors.port ? 'border-red-300' : ''
                          }`}
                        />
                        {emailFormik.touched.port && emailFormik.errors.port && (
                          <p className="mt-2 text-sm text-red-600">{emailFormik.errors.port}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-1">
                      <label htmlFor="secure" className="block text-sm font-medium text-gray-700">
                        Seguro
                      </label>
                      <div className="mt-4">
                        <input
                          type="checkbox"
                          id="secure"
                          name="secure"
                          checked={emailFormik.values.secure}
                          onChange={emailFormik.handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                        Usuario SMTP *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="user"
                          name="user"
                          value={emailFormik.values.user}
                          onChange={emailFormik.handleChange}
                          onBlur={emailFormik.handleBlur}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            emailFormik.touched.user && emailFormik.errors.user ? 'border-red-300' : ''
                          }`}
                        />
                        {emailFormik.touched.user && emailFormik.errors.user && (
                          <p className="mt-2 text-sm text-red-600">{emailFormik.errors.user}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Contraseña SMTP *
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={emailFormik.values.password}
                          onChange={emailFormik.handleChange}
                          onBlur={emailFormik.handleBlur}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            emailFormik.touched.password && emailFormik.errors.password ? 'border-red-300' : ''
                          }`}
                        />
                        {emailFormik.touched.password && emailFormik.errors.password && (
                          <p className="mt-2 text-sm text-red-600">{emailFormik.errors.password}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="from" className="block text-sm font-medium text-gray-700">
                        Dirección de Correo Remitente *
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          id="from"
                          name="from"
                          value={emailFormik.values.from}
                          onChange={emailFormik.handleChange}
                          onBlur={emailFormik.handleBlur}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            emailFormik.touched.from && emailFormik.errors.from ? 'border-red-300' : ''
                          }`}
                        />
                        {emailFormik.touched.from && emailFormik.errors.from && (
                          <p className="mt-2 text-sm text-red-600">{emailFormik.errors.from}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={procesando || !emailFormik.isValid}
                        className="btn-primary"
                      >
                        {procesando ? 'Guardando...' : 'Guardar Configuración de Correo'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuraciones Generales</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Agregar Nueva Configuración
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <form onSubmit={configFormik.handleSubmit}>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="clave" className="block text-sm font-medium text-gray-700">
                        Clave *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="clave"
                          name="clave"
                          value={configFormik.values.clave}
                          onChange={configFormik.handleChange}
                          onBlur={configFormik.handleBlur}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            configFormik.touched.clave && configFormik.errors.clave ? 'border-red-300' : ''
                          }`}
                        />
                        {configFormik.touched.clave && configFormik.errors.clave && (
                          <p className="mt-2 text-sm text-red-600">{configFormik.errors.clave}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                        Valor *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="valor"
                          name="valor"
                          value={configFormik.values.valor}
                          onChange={configFormik.handleChange}
                          onBlur={configFormik.handleBlur}
                          className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            configFormik.touched.valor && configFormik.errors.valor ? 'border-red-300' : ''
                          }`}
                        />
                        {configFormik.touched.valor && configFormik.errors.valor && (
                          <p className="mt-2 text-sm text-red-600">{configFormik.errors.valor}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="descripcion"
                          name="descripcion"
                          value={configFormik.values.descripcion}
                          onChange={configFormik.handleChange}
                          onBlur={configFormik.handleBlur}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={procesando || !configFormik.isValid}
                        className="btn-primary"
                      >
                        {procesando ? 'Guardando...' : 'Agregar Configuración'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Listado de Configuraciones</h2>
            {loading ? (
              <div className="text-center py-4">Cargando configuraciones...</div>
            ) : (
              <>
                {configuraciones.length === 0 ? (
                  <div className="text-center py-4">No hay configuraciones adicionales</div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clave
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {configuraciones
                          .filter(config => !config.clave.startsWith('EMAIL_'))
                          .map((config) => (
                          <tr key={config.clave}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {config.clave}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{config.valor}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{config.descripcion}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteConfig(config.clave)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfiguracionPage;
