# Análisis de Requisitos - Sistema de Notificación de Altas y Bajas

## Descripción General
El sistema debe implementar una solución web para la gestión de fisioterapeutas, optimizando y automatizando la administración de los profesionales. Permitirá un control claro de las altas y bajas, minimizando errores en la coordinación de la información laboral, asegurando la comunicación con instituciones externas (Seguridad Social y Colegio de Fisioterapeutas) mediante correos electrónicos y la notificación a los empleados de los cambios de situación.

## Requisitos Funcionales

### Gestión de Altas
1. El sistema debe permitir subir contratos de nuevos fisioterapeutas a una carpeta específica.
2. Los contratos deben seguir una nomenclatura específica: "Fecha alta + espacio + NOMBRE + espacio + APELLIDO(S)".
   - El formato de fecha debe ser DD-MM-AAAA (separado con guiones).
   - El nombre debe estar en mayúsculas.
   - Ejemplo: "20-11-2024 CESAR NAVARRO ALBARRACIN".
3. El sistema debe permitir registrar nuevos fisioterapeutas en una tabla "ALTAS NUEVAS" con los siguientes campos:
   - NOMBRE
   - APELLIDOS
   - FECHA ALTA
   - MAIL
   - FINESS (identificador)
4. El sistema debe incluir una casilla de verificación "ENVIAR" para cada registro.
5. El sistema debe proporcionar una opción en el menú "Gestión Altas y Bajas" para "Comunicar Altas por mail".
6. Al hacer clic en "Comunicar Altas por mail", el sistema debe enviar automáticamente tres correos:
   - Al Colegio de Fisioterapeutas (según plantilla definida)
   - A la Seguridad Social (según plantilla definida)
   - Al Profesional (según plantilla definida)
7. Una vez enviados los correos, el sistema debe mover automáticamente al empleado a la tabla "T_ALTAS" (profesionales activos).
8. El sistema debe registrar la fecha de envío de los correos en la columna "NOTIFICADO EL".

### Gestión de Bajas
1. El sistema debe permitir acceder a la tabla "T_ALTAS" para gestionar las bajas.
2. Para dar de baja a un empleado, el sistema debe permitir rellenar el campo "FECHA BAJA" y marcar la casilla "ENVIAR BAJA".
3. El sistema debe proporcionar una opción en el menú "Gestión Altas y Bajas" para "Comunicar Bajas por mail".
4. Al hacer clic en "Comunicar Bajas por mail", el sistema debe enviar automáticamente tres correos:
   - Al Colegio de Fisioterapeutas (según plantilla definida)
   - A la Seguridad Social (según plantilla definida)
   - Al Profesional (según plantilla definida)
5. Una vez enviados los correos, el sistema debe mover automáticamente al empleado a la tabla "T_BAJAS" (profesionales inactivos).
6. El sistema debe registrar la fecha de envío de los correos en la columna "NOTIFICADO EL".

### Listados
1. El sistema debe mantener actualizada la tabla "T_ALTAS" con todos los profesionales activos.
2. El sistema debe mantener actualizada la tabla "T_BAJAS" con todos los profesionales inactivos (histórico).
3. El sistema debe impedir la adición directa de registros en las tablas "T_ALTAS" y "T_BAJAS", forzando a seguir el flujo de trabajo definido.

### Notificaciones por Correo
1. El sistema debe enviar correos electrónicos según las plantillas definidas en los anexos:
   - Para altas:
     - Colegio de Fisioterapeutas (Anexo B, Apéndice 1)
     - Seguridad Social (Anexo C, Apéndice 1)
     - Profesional (Anexo D, Apéndice 1)
   - Para bajas:
     - Colegio de Fisioterapeutas (Anexo B, Apéndice 2)
     - Seguridad Social (Anexo C, Apéndice 2)
     - Profesional (Anexo D, Apéndice 2)
2. Los correos deben incluir los datos del fisioterapeuta y, en el caso de altas, adjuntar el contrato y el listado de fisioterapeutas activos.
3. En el caso de bajas, se debe adjuntar el listado de fisioterapeutas activos.

## Requisitos No Funcionales
1. El sistema debe ser una aplicación web.
2. El sistema debe poder alojarse en un contenedor Docker.
3. El sistema debe ser fácil de usar para el personal administrativo.
4. El sistema debe garantizar la seguridad de los datos personales de los fisioterapeutas.
5. El sistema debe ser mantenible y escalable.
6. El sistema debe proporcionar una interfaz intuitiva similar a la mostrada en las capturas de pantalla del documento.

## Flujo de Trabajo
### Proceso de Alta
1. Subir contrato a la carpeta "01 DOCUMENTACIÓN A ADJUNTAR PARA ALTAS".
2. Acceder al archivo "REGISTRO FISIOTERAPEUTAS".
3. Acceder a la hoja "T_ALTAS NUEVAS".
4. Rellenar los campos de la tabla "ALTAS NUEVAS".
5. Marcar la casilla "ENVIAR".
6. Acceder al menú "Gestión Altas y Bajas" y hacer clic en "Comunicar Altas por mail".
7. El sistema envía automáticamente los tres correos.
8. El empleado pasa automáticamente a la tabla "T_ALTAS".

### Proceso de Baja
1. Acceder al archivo "REGISTRO FISIOTERAPEUTAS".
2. Acceder a la hoja "T_ALTAS".
3. Rellenar la "FECHA BAJA" del empleado a dar de baja.
4. Marcar la casilla "ENVIAR BAJA".
5. Acceder al menú "Gestión Altas y Bajas" y hacer clic en "Comunicar Bajas por mail".
6. El sistema envía automáticamente los tres correos.
7. El empleado pasa automáticamente a la tabla "T_BAJAS".
