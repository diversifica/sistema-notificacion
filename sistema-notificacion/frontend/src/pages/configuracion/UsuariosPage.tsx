import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usuarioService } from '../../../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Componentes
import Layout from '../../../components/Layout';

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  activo: boolean;
}

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuarioService.getAll(true);
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    formik.setValues({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      rol: usuario.rol,
      password: '',
      confirmPassword: '',
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingUsuario(null);
    formik.resetForm();
    setShowForm(true);
  };

  const handleToggleActive = async (id: number, activo: boolean) => {
    try {
      await usuarioService.toggleActive(id, !activo);
      toast.success(`Usuario ${activo ? 'desactivado' : 'activado'} correctamente`);
      fetchUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado de usuario:', error);
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es obligatorio'),
    apellidos: Yup.string().required('Los apellidos son obligatorios'),
    email: Yup.string().email('Email inválido').required('El email es obligatorio'),
    rol: Yup.string().required('El rol es obligatorio'),
    password: Yup.string()
      .when('_', {
        is: () => !editingUsuario,
        then: Yup.string().required('La contraseña es obligatoria').min(6, 'La contraseña debe tener al menos 6 caracteres'),
        otherwise: Yup.string(),
      }),
    confirmPassword: Yup.string()
      .when('password', {
        is: (val: string) => val && val.length > 0,
        then: Yup.string()
          .required('Debe confirmar la contraseña')
          .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
        otherwise: Yup.string(),
      }),
  });

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellidos: '',
      email: '',
      rol: 'USER',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setProcesando(true);
        const userData = {
          nombre: values.nombre,
          apellidos: values.apellidos,
          email: values.email,
          rol: values.rol,
          ...(values.password && { password: values.password }),
        };

        if (editingUsuario) {
          await usuarioService.update(editingUsuario.id, userData);
          toast.success('Usuario actualizado correctamente');
        } else {
          await usuarioService.create(userData);
          toast.success('Usuario creado correctamente');
        }
        setShowForm(false);
        fetchUsuarios();
      } catch (error) {
        console.error('Error al guardar usuario:', error);
        toast.error('Error al guardar el usuario');
      } finally {
        setProcesando(false);
      }
    },
  });

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Administrador
          </span>
        );
      case 'USER':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Usuario
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {rol}
          </span>
        );
    }
  };

  return (
    <Layout title="Gestión de Usuarios">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Usuarios del Sistema</h2>
            <button
              onClick={handleNew}
              className="btn-primary"
            >
              Nuevo Usuario
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando usuarios...</div>
          ) : (
            <>
              {!showForm && (
                <>
                  {usuarios.length === 0 ? (
                    <div className="text-center py-4">No hay usuarios configurados</div>
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
                              Rol
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
                          {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {usuario.nombre} {usuario.apellidos}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{usuario.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getRolLabel(usuario.rol)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {usuario.activo ? (
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
                                  onClick={() => handleEdit(usuario)}
                                  className="text-primary-600 hover:text-primary-900 mr-3"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleToggleActive(usuario.id, usuario.activo)}
                                  className={`${
                                    usuario.activo
                                      ? 'text-red-600 hover:text-red-900'
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                >
                                  {usuario.activo ? 'Desactivar' : 'Activar'}
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
                      {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                          <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                            Apellidos *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="apellidos"
                              name="apellidos"
                              value={formik.values.apellidos}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                formik.touched.apellidos && formik.errors.apellidos ? 'border-red-300' : ''
                              }`}
                            />
                            {formik.touched.apellidos && formik.errors.apellidos && (
                              <p className="mt-2 text-sm text-red-600">{formik.errors.apellidos}</p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-4">
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

                        <div className="sm:col-span-2">
                          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                            Rol *
                          </label>
                          <div className="mt-1">
                            <select
                              id="rol"
                              name="rol"
                              value={formik.values.rol}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="USER">Usuario</option>
                              <option value="ADMIN">Administrador</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña {!editingUsuario && '*'}
                          </label>
                          <div className="mt-1">
                            <input
                              type="password"
                              id="password"
                              name="password"
                              value={formik.values.password}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                formik.touched.password && formik.errors.password ? 'border-red-300' : ''
                              }`}
                            />
                            {formik.touched.password && formik.errors.password && (
                              <p className="mt-2 text-sm text-red-600">{formik.errors.password}</p>
                            )}
                            {editingUsuario && (
                              <p className="mt-2 text-sm text-gray-500">
                                Dejar en blanco para mantener la contraseña actual
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirmar Contraseña {!editingUsuario && '*'}
                          </label>
                          <div className="mt-1">
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formik.values.confirmPassword}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-300' : ''
                              }`}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                              <p className="mt-2 text-sm text-red-600">{formik.errors.confirmPassword}</p>
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

export default UsuariosPage;
