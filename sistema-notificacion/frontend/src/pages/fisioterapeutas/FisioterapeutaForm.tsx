import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { fisioterapeutaService } from '../../services/api';

// Componentes
import Layout from '../../components/Layout';

interface FisioterapeutaFormValues {
  nombre: string;
  apellidos: string;
  email: string;
  finess: string;
  fecha_alta: string;
}

const FisioterapeutaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditing);
  const [contrato, setContrato] = useState<File | null>(null);

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es obligatorio'),
    apellidos: Yup.string().required('Los apellidos son obligatorios'),
    email: Yup.string().email('Email inválido').required('El email es obligatorio'),
    finess: Yup.string().required('El código FINESS es obligatorio'),
    fecha_alta: Yup.date().required('La fecha de alta es obligatoria'),
  });

  const formik = useFormik<FisioterapeutaFormValues>({
    initialValues: {
      nombre: '',
      apellidos: '',
      email: '',
      finess: '',
      fecha_alta: new Date().toISOString().split('T')[0],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const formData = new FormData();
        formData.append('nombre', values.nombre);
        formData.append('apellidos', values.apellidos);
        formData.append('email', values.email);
        formData.append('finess', values.finess);
        formData.append('fecha_alta', values.fecha_alta);
        
        if (contrato) {
          formData.append('contrato', contrato);
        }
        
        if (isEditing) {
          await fisioterapeutaService.update(Number(id), formData);
          toast.success('Fisioterapeuta actualizado correctamente');
        } else {
          await fisioterapeutaService.create(formData);
          toast.success('Fisioterapeuta creado correctamente');
        }
        
        navigate('/fisioterapeutas/activos');
      } catch (error) {
        console.error('Error al guardar fisioterapeuta:', error);
        toast.error('Error al guardar los datos del fisioterapeuta');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchFisioterapeuta = async () => {
      if (!isEditing) return;
      
      try {
        setInitialLoading(true);
        const data = await fisioterapeutaService.getById(Number(id));
        
        formik.setValues({
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email,
          finess: data.finess,
          fecha_alta: data.fecha_alta.split('T')[0],
        });
      } catch (error) {
        console.error('Error al obtener fisioterapeuta:', error);
        toast.error('Error al cargar datos del fisioterapeuta');
        navigate('/fisioterapeutas/activos');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchFisioterapeuta();
  }, [id, isEditing, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContrato(e.target.files[0]);
    }
  };

  if (initialLoading) {
    return (
      <Layout title={isEditing ? 'Editar Fisioterapeuta' : 'Nuevo Fisioterapeuta'}>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-4">Cargando datos...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditing ? 'Editar Fisioterapeuta' : 'Nuevo Fisioterapeuta'}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Editar información del fisioterapeuta' : 'Registrar nuevo fisioterapeuta'}
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

                  <div className="sm:col-span-3">
                    <label htmlFor="finess" className="block text-sm font-medium text-gray-700">
                      Código FINESS *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="finess"
                        name="finess"
                        value={formik.values.finess}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formik.touched.finess && formik.errors.finess ? 'border-red-300' : ''
                        }`}
                      />
                      {formik.touched.finess && formik.errors.finess && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.finess}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="fecha_alta" className="block text-sm font-medium text-gray-700">
                      Fecha de Alta *
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="fecha_alta"
                        name="fecha_alta"
                        value={formik.values.fecha_alta}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          formik.touched.fecha_alta && formik.errors.fecha_alta ? 'border-red-300' : ''
                        }`}
                      />
                      {formik.touched.fecha_alta && formik.errors.fecha_alta && (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.fecha_alta}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="contrato" className="block text-sm font-medium text-gray-700">
                      Contrato {!isEditing && '*'}
                    </label>
                    <div className="mt-1">
                      <input
                        type="file"
                        id="contrato"
                        name="contrato"
                        onChange={handleFileChange}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required={!isEditing}
                      />
                      {contrato && (
                        <p className="mt-2 text-sm text-gray-500">
                          Archivo seleccionado: {contrato.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="btn-secondary mr-3"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formik.isValid}
                      className="btn-primary"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FisioterapeutaForm;
