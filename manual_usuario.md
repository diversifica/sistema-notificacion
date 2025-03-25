# Manual de Usuario - Sistema de Notificación de Altas y Bajas

## Introducción

Bienvenido al Sistema de Notificación de Altas y Bajas de fisioterapeutas. Este manual le guiará a través de las diferentes funcionalidades del sistema, diseñado para optimizar y automatizar la administración de los profesionales, permitiendo un control claro de las altas y bajas, y asegurando la comunicación con instituciones externas como el Colegio de Fisioterapeutas y la Seguridad Social.

## Acceso al Sistema

### Inicio de Sesión

1. Abra su navegador web y acceda a la dirección del sistema: `http://[dirección-ip-del-servidor]:3000`
2. En la pantalla de inicio de sesión, introduzca sus credenciales:
   - Email: Su dirección de correo electrónico
   - Contraseña: Su contraseña personal
3. Haga clic en el botón "Iniciar Sesión"

![Pantalla de inicio de sesión](imagenes/login.png)

### Recuperación de Contraseña

Si ha olvidado su contraseña:

1. En la pantalla de inicio de sesión, haga clic en "¿Olvidó su contraseña?"
2. Introduzca su dirección de correo electrónico
3. Haga clic en "Enviar"
4. Recibirá un correo electrónico con instrucciones para restablecer su contraseña

## Panel Principal

Tras iniciar sesión, accederá al panel principal del sistema, que muestra un resumen de la actividad:

- Número de fisioterapeutas activos
- Número de fisioterapeutas inactivos
- Últimas altas y bajas
- Notificaciones pendientes

![Panel principal](imagenes/dashboard.png)

## Gestión de Altas

### Subida de Contratos

Para subir el contrato de un nuevo fisioterapeuta:

1. Acceda a la sección "Gestión de Altas" desde el menú principal
2. En el área de subida de contratos, haga clic en "Seleccionar archivo" o arrastre y suelte el archivo
3. El contrato debe seguir la nomenclatura: "Fecha alta + espacio + NOMBRE + espacio + APELLIDO(S)"
   - El formato de fecha debe ser DD-MM-AAAA (separado con guiones)
   - El nombre debe estar en mayúsculas
   - Ejemplo: "20-11-2024 CESAR NAVARRO ALBARRACIN"
4. Una vez subido el contrato, aparecerá en la lista de contratos subidos

![Subida de contratos](imagenes/subida_contratos.png)

### Registro de Nuevas Altas

Para registrar un nuevo fisioterapeuta:

1. Acceda a la sección "Gestión de Altas" desde el menú principal
2. En la tabla "ALTAS NUEVAS", haga clic en "Añadir nuevo"
3. Rellene los campos del formulario:
   - NOMBRE: Nombre del fisioterapeuta (en mayúsculas)
   - APELLIDOS: Apellidos del fisioterapeuta (en mayúsculas)
   - FECHA ALTA: Fecha de alta del fisioterapeuta (formato DD-MM-AAAA)
   - MAIL: Dirección de correo electrónico del fisioterapeuta
   - FINESS: Número FINESS del fisioterapeuta
4. Marque la casilla "ENVIAR" si desea enviar las notificaciones inmediatamente
5. Haga clic en "Guardar"

![Registro de altas](imagenes/registro_altas.png)

### Envío de Notificaciones de Alta

Para enviar las notificaciones de alta:

1. Asegúrese de que los fisioterapeutas que desea notificar tienen marcada la casilla "ENVIAR"
2. En el menú superior, haga clic en "Gestión Altas y Bajas"
3. Seleccione "Comunicar Altas por mail"
4. El sistema enviará automáticamente los correos electrónicos a:
   - Colegio de Fisioterapeutas
   - Seguridad Social
   - Profesional (fisioterapeuta)
5. Una vez enviados los correos, los fisioterapeutas pasarán automáticamente a la tabla "T_ALTAS"
6. En la columna "NOTIFICADO EL" figurará la fecha de envío de los correos

![Envío de notificaciones de alta](imagenes/envio_notificaciones_alta.png)

## Gestión de Bajas

### Registro de Bajas

Para registrar la baja de un fisioterapeuta:

1. Acceda a la sección "Gestión de Bajas" desde el menú principal
2. En la tabla "T_ALTAS", localice al fisioterapeuta que desea dar de baja
3. Haga clic en el campo "FECHA BAJA" e introduzca la fecha de baja (formato DD-MM-AAAA)
4. Marque la casilla "ENVIAR BAJA"
5. Haga clic en "Guardar"

![Registro de bajas](imagenes/registro_bajas.png)

### Envío de Notificaciones de Baja

Para enviar las notificaciones de baja:

1. Asegúrese de que los fisioterapeutas que desea notificar tienen marcada la casilla "ENVIAR BAJA"
2. En el menú superior, haga clic en "Gestión Altas y Bajas"
3. Seleccione "Comunicar Bajas por mail"
4. El sistema enviará automáticamente los correos electrónicos a:
   - Colegio de Fisioterapeutas
   - Seguridad Social
   - Profesional (fisioterapeuta)
5. Una vez enviados los correos, los fisioterapeutas pasarán automáticamente a la tabla "T_BAJAS"
6. En la columna "NOTIFICADO EL" figurará la fecha de envío de los correos

![Envío de notificaciones de baja](imagenes/envio_notificaciones_baja.png)

## Listados

### Listado de Fisioterapeutas Activos

Para ver el listado de fisioterapeutas activos:

1. Acceda a la sección "Fisioterapeutas Activos" desde el menú principal
2. Se mostrará la tabla "T_ALTAS" con todos los fisioterapeutas activos
3. Puede utilizar los filtros para buscar fisioterapeutas específicos
4. Puede exportar el listado a Excel o PDF haciendo clic en los botones correspondientes

![Listado de fisioterapeutas activos](imagenes/listado_activos.png)

### Listado de Fisioterapeutas Inactivos

Para ver el listado de fisioterapeutas inactivos:

1. Acceda a la sección "Fisioterapeutas Inactivos" desde el menú principal
2. Se mostrará la tabla "T_BAJAS" con todos los fisioterapeutas inactivos
3. Puede utilizar los filtros para buscar fisioterapeutas específicos
4. Puede exportar el listado a Excel o PDF haciendo clic en los botones correspondientes

![Listado de fisioterapeutas inactivos](imagenes/listado_inactivos.png)

## Configuración

### Configuración de Correo Electrónico

Para configurar el servidor de correo electrónico:

1. Acceda a la sección "Configuración" desde el menú principal
2. Seleccione la pestaña "Correo Electrónico"
3. Configure los siguientes parámetros:
   - Servidor SMTP: Dirección del servidor SMTP
   - Puerto: Puerto del servidor SMTP
   - Seguridad: Tipo de seguridad (SSL/TLS, STARTTLS, Ninguna)
   - Usuario: Nombre de usuario para la autenticación
   - Contraseña: Contraseña para la autenticación
   - Email remitente: Dirección de correo electrónico desde la que se enviarán las notificaciones
4. Haga clic en "Guardar"

![Configuración de correo electrónico](imagenes/configuracion_correo.png)

### Configuración de Plantillas de Correo

Para configurar las plantillas de correo electrónico:

1. Acceda a la sección "Configuración" desde el menú principal
2. Seleccione la pestaña "Plantillas de Correo"
3. Seleccione la plantilla que desea editar:
   - Alta - Colegio de Fisioterapeutas
   - Alta - Seguridad Social
   - Alta - Profesional
   - Baja - Colegio de Fisioterapeutas
   - Baja - Seguridad Social
   - Baja - Profesional
4. Edite el asunto y el cuerpo del correo
5. Puede utilizar las siguientes variables en las plantillas:
   - `[Nom du nouveau kinésithérapeute]`: Nombre y apellidos del fisioterapeuta
   - `[Date de début]`: Fecha de alta del fisioterapeuta
   - `[Date de départ]`: Fecha de baja del fisioterapeuta
   - `[pied-de-signature]`: Firma configurada en el sistema
6. Haga clic en "Guardar"

![Configuración de plantillas de correo](imagenes/configuracion_plantillas.png)

### Configuración de Destinatarios

Para configurar los destinatarios de las notificaciones:

1. Acceda a la sección "Configuración" desde el menú principal
2. Seleccione la pestaña "Destinatarios"
3. Configure las direcciones de correo electrónico de:
   - Colegio de Fisioterapeutas
   - Seguridad Social
4. Haga clic en "Guardar"

![Configuración de destinatarios](imagenes/configuracion_destinatarios.png)

### Gestión de Usuarios

Para gestionar los usuarios del sistema (solo administradores):

1. Acceda a la sección "Configuración" desde el menú principal
2. Seleccione la pestaña "Usuarios"
3. Para añadir un nuevo usuario, haga clic en "Añadir usuario" y rellene el formulario
4. Para editar un usuario existente, haga clic en el icono de edición junto al usuario
5. Para desactivar un usuario, haga clic en el icono de desactivación junto al usuario
6. Haga clic en "Guardar" para confirmar los cambios

![Gestión de usuarios](imagenes/gestion_usuarios.png)

## Perfil de Usuario

### Cambio de Contraseña

Para cambiar su contraseña:

1. Haga clic en su nombre de usuario en la esquina superior derecha
2. Seleccione "Perfil"
3. En la sección "Cambiar contraseña", introduzca:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña
4. Haga clic en "Cambiar contraseña"

![Cambio de contraseña](imagenes/cambio_contrasena.png)

### Cierre de Sesión

Para cerrar sesión:

1. Haga clic en su nombre de usuario en la esquina superior derecha
2. Seleccione "Cerrar sesión"

## Buenas Prácticas

Para un uso óptimo del sistema, se recomienda seguir estas buenas prácticas:

1. **Nomenclatura de contratos**: Asegúrese de que los contratos siguen la nomenclatura especificada (Fecha alta + espacio + NOMBRE + espacio + APELLIDO(S))
2. **Verificación de datos**: Compruebe que los datos introducidos son correctos antes de enviar las notificaciones
3. **Flujo de trabajo**: Siga siempre el flujo de trabajo establecido:
   - Para altas: Subir contrato → Registrar datos → Enviar notificaciones
   - Para bajas: Registrar fecha de baja → Marcar "ENVIAR BAJA" → Enviar notificaciones
4. **Respaldo de datos**: Realice respaldos periódicos de la base de datos y los contratos
5. **Seguridad**: Cambie su contraseña regularmente y no la comparta con otros usuarios

## Solución de Problemas Comunes

### No se pueden enviar notificaciones

Posibles soluciones:
- Verifique la configuración del servidor SMTP
- Asegúrese de que las direcciones de correo electrónico de los destinatarios son correctas
- Compruebe que el fisioterapeuta tiene todos los datos necesarios

### No se puede subir un contrato

Posibles soluciones:
- Verifique que el nombre del archivo sigue la nomenclatura correcta
- Asegúrese de que el archivo es un PDF válido
- Compruebe que el tamaño del archivo no supera el límite establecido

### No se puede acceder al sistema

Posibles soluciones:
- Verifique sus credenciales de inicio de sesión
- Compruebe su conexión a Internet
- Asegúrese de que el servidor está en funcionamiento

## Soporte Técnico

Si encuentra algún problema que no puede resolver, contacte con el soporte técnico:

- Email: diversifica.ia@outlook.es
- Teléfono: [Número de teléfono]

## Conclusión

Este manual le ha proporcionado una guía completa para utilizar el Sistema de Notificación de Altas y Bajas de fisioterapeutas. Siguiendo estas instrucciones, podrá gestionar eficientemente las altas y bajas de fisioterapeutas y automatizar las comunicaciones con las instituciones externas.
