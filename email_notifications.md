# Sistema de Notificaciones por Correo - Sistema de Notificación de Altas y Bajas

## Visión General

El sistema de notificaciones por correo es un componente fundamental del sistema de notificación de altas y bajas de fisioterapeutas. Este componente se encarga de enviar correos electrónicos automáticos a los destinatarios correspondientes cuando se producen altas o bajas de fisioterapeutas.

## Arquitectura del Sistema de Notificaciones

El sistema de notificaciones por correo se implementará utilizando Nodemailer, una biblioteca de Node.js para el envío de correos electrónicos. La arquitectura del sistema de notificaciones se compone de los siguientes elementos:

```
+----------------------------------+
|      Servicio de Notificación    |
|                                  |
|  +----------------------------+  |
|  |    Gestor de Plantillas    |  |
|  +----------------------------+  |
|                |                 |
|  +----------------------------+  |
|  |    Procesador de Datos     |  |
|  +----------------------------+  |
|                |                 |
|  +----------------------------+  |
|  |     Cliente de Correo      |  |
|  |       (Nodemailer)         |  |
|  +----------------------------+  |
+----------------------------------+
               |
               v
+----------------------------------+
|      Servidor SMTP Externo       |
+----------------------------------+
               |
               v
+----------------------------------+
|         Destinatarios            |
|  - Colegio de Fisioterapeutas    |
|  - Seguridad Social              |
|  - Profesional                   |
+----------------------------------+
```

## Componentes Principales

### 1. Gestor de Plantillas

Este componente se encarga de cargar y gestionar las plantillas de correo electrónico definidas en la base de datos. Utiliza un sistema de plantillas basado en Handlebars para permitir la sustitución de variables en las plantillas.

```javascript
// Ejemplo de implementación del Gestor de Plantillas
const Handlebars = require('handlebars');

class PlantillaManager {
  constructor(db) {
    this.db = db;
    this.templates = {};
  }

  async loadTemplates() {
    const plantillas = await this.db.all('SELECT * FROM plantilla WHERE activo = 1');
    for (const plantilla of plantillas) {
      this.templates[plantilla.nombre] = {
        subject: Handlebars.compile(plantilla.asunto),
        body: Handlebars.compile(plantilla.cuerpo)
      };
    }
  }

  getTemplate(nombre) {
    if (!this.templates[nombre]) {
      throw new Error(`Plantilla no encontrada: ${nombre}`);
    }
    return this.templates[nombre];
  }

  renderTemplate(nombre, data) {
    const template = this.getTemplate(nombre);
    return {
      subject: template.subject(data),
      body: template.body(data)
    };
  }
}
```

### 2. Procesador de Datos

Este componente se encarga de preparar los datos necesarios para las plantillas de correo electrónico, como la información del fisioterapeuta, la fecha de alta o baja, y los adjuntos.

```javascript
// Ejemplo de implementación del Procesador de Datos
class DataProcessor {
  constructor(db) {
    this.db = db;
  }

  async prepareDataForAlta(fisioterapeutaId) {
    // Obtener datos del fisioterapeuta
    const fisioterapeuta = await this.db.get('SELECT * FROM fisioterapeuta WHERE id = ?', [fisioterapeutaId]);
    if (!fisioterapeuta) {
      throw new Error(`Fisioterapeuta no encontrado: ${fisioterapeutaId}`);
    }

    // Obtener datos del contrato
    const contrato = await this.db.get('SELECT * FROM contrato WHERE fisioterapeuta_id = ?', [fisioterapeutaId]);
    
    // Obtener lista de fisioterapeutas activos
    const activos = await this.db.all('SELECT * FROM fisioterapeuta WHERE estado = "ACTIVO"');
    
    // Preparar datos para la plantilla
    return {
      fisioterapeuta: {
        nombre: `${fisioterapeuta.nombre} ${fisioterapeuta.apellidos}`,
        fecha_alta: this.formatDate(fisioterapeuta.fecha_alta),
        email: fisioterapeuta.email
      },
      contrato: contrato ? contrato.ruta_archivo : null,
      activos: activos,
      fecha_actual: this.formatDate(new Date())
    };
  }

  async prepareDataForBaja(fisioterapeutaId) {
    // Obtener datos del fisioterapeuta
    const fisioterapeuta = await this.db.get('SELECT * FROM fisioterapeuta WHERE id = ?', [fisioterapeutaId]);
    if (!fisioterapeuta) {
      throw new Error(`Fisioterapeuta no encontrado: ${fisioterapeutaId}`);
    }
    
    // Obtener lista de fisioterapeutas activos
    const activos = await this.db.all('SELECT * FROM fisioterapeuta WHERE estado = "ACTIVO"');
    
    // Preparar datos para la plantilla
    return {
      fisioterapeuta: {
        nombre: `${fisioterapeuta.nombre} ${fisioterapeuta.apellidos}`,
        fecha_baja: this.formatDate(fisioterapeuta.fecha_baja),
        email: fisioterapeuta.email
      },
      activos: activos,
      fecha_actual: this.formatDate(new Date())
    };
  }

  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }
}
```

### 3. Cliente de Correo (Nodemailer)

Este componente se encarga de enviar los correos electrónicos utilizando Nodemailer. Configura la conexión con el servidor SMTP y envía los correos con los datos proporcionados.

```javascript
// Ejemplo de implementación del Cliente de Correo
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailClient {
  constructor(config) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password
      }
    });
  }

  async sendEmail(to, subject, body, attachments = []) {
    const mailOptions = {
      from: this.config.email_remitente,
      to: to,
      subject: subject,
      html: body,
      attachments: attachments.map(attachment => {
        return {
          filename: path.basename(attachment),
          path: attachment
        };
      })
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

## Servicio de Notificación

El servicio de notificación integra los componentes anteriores para proporcionar una interfaz unificada para el envío de notificaciones.

```javascript
// Ejemplo de implementación del Servicio de Notificación
class NotificationService {
  constructor(db, config) {
    this.db = db;
    this.config = config;
    this.plantillaManager = new PlantillaManager(db);
    this.dataProcessor = new DataProcessor(db);
    this.emailClient = new EmailClient(config);
  }

  async initialize() {
    await this.plantillaManager.loadTemplates();
  }

  async sendAltaNotifications(fisioterapeutaId) {
    // Preparar datos
    const data = await this.dataProcessor.prepareDataForAlta(fisioterapeutaId);
    
    // Obtener destinatarios
    const destinatarios = await this.db.all('SELECT * FROM destinatario WHERE activo = 1');
    
    // Resultados
    const results = [];
    
    // Enviar notificación al Colegio de Fisioterapeutas
    const colegio = destinatarios.find(d => d.nombre === 'Colegio de Fisioterapeutas');
    if (colegio) {
      const template = this.plantillaManager.renderTemplate('ALTA_COLEGIO', data);
      const attachments = [
        // Adjuntar contrato
        data.contrato,
        // Adjuntar listado de fisioterapeutas activos
        await this.generateActivosList()
      ];
      const result = await this.emailClient.sendEmail(colegio.email, template.subject, template.body, attachments);
      results.push({
        destinatario: colegio.nombre,
        resultado: result
      });
      
      // Registrar notificación en la base de datos
      await this.registerNotification(fisioterapeutaId, 'ALTA', colegio.id, result.success ? 'ENVIADO' : 'FALLIDO');
    }
    
    // Enviar notificación a la Seguridad Social
    const seguridad = destinatarios.find(d => d.nombre === 'Seguridad Social');
    if (seguridad) {
      const template = this.plantillaManager.renderTemplate('ALTA_SEGURIDAD_SOCIAL', data);
      const attachments = [
        // Adjuntar contrato
        data.contrato,
        // Adjuntar listado de fisioterapeutas activos
        await this.generateActivosList()
      ];
      const result = await this.emailClient.sendEmail(seguridad.email, template.subject, template.body, attachments);
      results.push({
        destinatario: seguridad.nombre,
        resultado: result
      });
      
      // Registrar notificación en la base de datos
      await this.registerNotification(fisioterapeutaId, 'ALTA', seguridad.id, result.success ? 'ENVIADO' : 'FALLIDO');
    }
    
    // Enviar notificación al Profesional
    const template = this.plantillaManager.renderTemplate('ALTA_PROFESIONAL', data);
    const attachments = [
      // Adjuntar contrato
      data.contrato,
      // Adjuntar listado de fisioterapeutas activos
      await this.generateActivosList()
    ];
    const result = await this.emailClient.sendEmail(data.fisioterapeuta.email, template.subject, template.body, attachments);
    results.push({
      destinatario: 'Profesional',
      resultado: result
    });
    
    // Registrar notificación en la base de datos
    const profesional = destinatarios.find(d => d.nombre === 'Profesional');
    if (profesional) {
      await this.registerNotification(fisioterapeutaId, 'ALTA', profesional.id, result.success ? 'ENVIADO' : 'FALLIDO');
    }
    
    // Actualizar fecha de notificación de alta
    await this.db.run('UPDATE fisioterapeuta SET fecha_notificacion_alta = ? WHERE id = ?', [new Date().toISOString(), fisioterapeutaId]);
    
    return results;
  }

  async sendBajaNotifications(fisioterapeutaId) {
    // Preparar datos
    const data = await this.dataProcessor.prepareDataForBaja(fisioterapeutaId);
    
    // Obtener destinatarios
    const destinatarios = await this.db.all('SELECT * FROM destinatario WHERE activo = 1');
    
    // Resultados
    const results = [];
    
    // Enviar notificación al Colegio de Fisioterapeutas
    const colegio = destinatarios.find(d => d.nombre === 'Colegio de Fisioterapeutas');
    if (colegio) {
      const template = this.plantillaManager.renderTemplate('BAJA_COLEGIO', data);
      const attachments = [
        // Adjuntar listado de fisioterapeutas activos
        await this.generateActivosList()
      ];
      const result = await this.emailClient.sendEmail(colegio.email, template.subject, template.body, attachments);
      results.push({
        destinatario: colegio.nombre,
        resultado: result
      });
      
      // Registrar notificación en la base de datos
      await this.registerNotification(fisioterapeutaId, 'BAJA', colegio.id, result.success ? 'ENVIADO' : 'FALLIDO');
    }
    
    // Enviar notificación a la Seguridad Social
    const seguridad = destinatarios.find(d => d.nombre === 'Seguridad Social');
    if (seguridad) {
      const template = this.plantillaManager.renderTemplate('BAJA_SEGURIDAD_SOCIAL', data);
      const attachments = [
        // Adjuntar listado de fisioterapeutas activos
        await this.generateActivosList()
      ];
      const result = await this.emailClient.sendEmail(seguridad.email, template.subject, template.body, attachments);
      results.push({
        destinatario: seguridad.nombre,
        resultado: result
      });
      
      // Registrar notificación en la base de datos
      await this.registerNotification(fisioterapeutaId, 'BAJA', seguridad.id, result.success ? 'ENVIADO' : 'FALLIDO');
    }
    
    // Enviar notificación al Profesional
    const template = this.plantillaManager.renderTemplate('BAJA_PROFESIONAL', data);
    const attachments = [];
    const result = await this.emailClient.sendEmail(data.fisioterapeuta.email, template.subject, template.body, attachments);
    results.push({
      destinatario: 'Profesional',
      resultado: result
    });
    
    // Registrar notificación en la base de datos
    const profesional = destinatarios.find(d => d.nombre === 'Profesional');
    if (profesional) {
      await this.registerNotification(fisioterapeutaId, 'BAJA', profesional.id, result.success ? 'ENVIADO' : 'FALLIDO');
    }
    
    // Actualizar fecha de notificación de baja y estado
    await this.db.run('UPDATE fisioterapeuta SET fecha_notificacion_baja = ?, estado = "INACTIVO" WHERE id = ?', [new Date().toISOString(), fisioterapeutaId]);
    
    return results;
  }

  async registerNotification(fisioterapeutaId, tipo, destinatarioId, estado) {
    // Insertar notificación
    const notificacionResult = await this.db.run(
      'INSERT INTO notificacion (fisioterapeuta_id, tipo, fecha_envio, estado) VALUES (?, ?, ?, ?)',
      [fisioterapeutaId, tipo, new Date().toISOString(), estado]
    );
    
    // Insertar relación notificación-destinatario
    await this.db.run(
      'INSERT INTO notificacion_destinatario (notificacion_id, destinatario_id, estado) VALUES (?, ?, ?)',
      [notificacionResult.lastID, destinatarioId, estado]
    );
  }

  async generateActivosList() {
    // Generar archivo CSV con la lista de fisioterapeutas activos
    const activos = await this.db.all('SELECT * FROM fisioterapeuta WHERE estado = "ACTIVO"');
    const csvContent = [
      'NOMBRE,APELLIDOS,FECHA ALTA,EMAIL,FINESS',
      ...activos.map(f => `${f.nombre},${f.apellidos},${this.dataProcessor.formatDate(f.fecha_alta)},${f.email},${f.finess}`)
    ].join('\n');
    
    const filePath = path.join(this.config.temp_dir, 'fisioterapeutas_activos.csv');
    fs.writeFileSync(filePath, csvContent);
    
    return filePath;
  }
}
```

## Flujo de Trabajo

### Notificación de Alta

1. El usuario marca la casilla "ENVIAR" para uno o varios fisioterapeutas en la tabla "ALTAS NUEVAS".
2. El usuario hace clic en "Comunicar Altas por mail" en el menú.
3. El sistema invoca al servicio de notificación para cada fisioterapeuta seleccionado.
4. El servicio de notificación:
   - Prepara los datos necesarios para las plantillas.
   - Genera el listado de fisioterapeutas activos.
   - Envía correos electrónicos al Colegio de Fisioterapeutas, la Seguridad Social y el Profesional.
   - Registra las notificaciones en la base de datos.
   - Actualiza el estado del fisioterapeuta y lo mueve a la tabla "T_ALTAS".
5. El sistema muestra un resumen de las notificaciones enviadas.

### Notificación de Baja

1. El usuario introduce la fecha de baja y marca la casilla "ENVIAR BAJA" para uno o varios fisioterapeutas en la tabla "T_ALTAS".
2. El usuario hace clic en "Comunicar Bajas por mail" en el menú.
3. El sistema invoca al servicio de notificación para cada fisioterapeuta seleccionado.
4. El servicio de notificación:
   - Prepara los datos necesarios para las plantillas.
   - Genera el listado de fisioterapeutas activos.
   - Envía correos electrónicos al Colegio de Fisioterapeutas, la Seguridad Social y el Profesional.
   - Registra las notificaciones en la base de datos.
   - Actualiza el estado del fisioterapeuta a "INACTIVO" y lo mueve a la tabla "T_BAJAS".
5. El sistema muestra un resumen de las notificaciones enviadas.

## Plantillas de Correo

Las plantillas de correo se almacenan en la base de datos y utilizan la sintaxis de Handlebars para la sustitución de variables. A continuación se muestran ejemplos de las plantillas para las notificaciones de alta y baja:

### Alta - Colegio de Fisioterapeutas

**Asunto:**
```
Notification de l'arrivée d'un nouveau kinésithérapeute et mise à jour du personnel au cabinet
```

**Cuerpo:**
```html
<p>Bonjour,</p>

<p>Je me permets de vous écrire pour vous informer de l'arrivée d'un nouveau kinésithérapeute dans notre cabinet.</p>

<p>Nouveau kinésithérapeute:</p>
<ul>
  <li>Nom: {{fisioterapeuta.nombre}}</li>
  <li>Date de début: {{fisioterapeuta.fecha_alta}}</li>
</ul>

<p>De plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet, ainsi que le contrat du nouveau kinésithérapeute. Ce dernier a également été informé de l'importance de procéder au changement de statut auprès du conseil départemental de l'ordre des masseurs-kinésithérapeutes de l'Haute-Garonne.</p>

<p>Nous vous remercions de votre attention et restons à votre disposition pour toute question supplémentaire que vous pourriez avoir.</p>

<p>Cordialement,</p>

<p>{{config.firma_email}}</p>
```

### Baja - Profesional

**Asunto:**
```
Confirmation de votre départ du cabinet de kinésithérapie
```

**Cuerpo:**
```html
<p>Cher/Chère {{fisioterapeuta.nombre}},</p>

<p>Nous vous confirmons que votre départ de notre cabinet de kinésithérapie a été enregistré à compter du {{fisioterapeuta.fecha_baja}}.</p>

<p>Nous avons informé le Conseil Départemental de l'Ordre des Masseurs-Kinésithérapeutes ainsi que la Sécurité Sociale de votre départ.</p>

<p>Nous vous remercions pour votre collaboration et vous souhaitons beaucoup de succès dans vos projets futurs.</p>

<p>Cordialement,</p>

<p>{{config.firma_email}}</p>
```

## Configuración

El sistema de notificaciones por correo se configura a través de la tabla `configuracion` en la base de datos. Las siguientes claves de configuración son relevantes para el sistema de notificaciones:

- `EMAIL_REMITENTE`: Dirección de correo electrónico desde la que se envían las notificaciones.
- `SMTP_HOST`: Servidor SMTP para el envío de correos.
- `SMTP_PORT`: Puerto del servidor SMTP.
- `SMTP_SECURE`: Indica si se debe utilizar una conexión segura (SSL/TLS).
- `SMTP_USER`: Usuario para la autenticación en el servidor SMTP.
- `SMTP_PASSWORD`: Contraseña para la autenticación en el servidor SMTP.
- `FIRMA_EMAIL`: Firma que se incluye en los correos electrónicos.
- `TEMP_DIR`: Directorio temporal para la generación de archivos adjuntos.

## Manejo de Errores

El sistema de notificaciones incluye un manejo robusto de errores para garantizar que los fallos en el envío de correos no afecten al funcionamiento general del sistema:

1. **Errores de conexión**: Si no se puede establecer conexión con el servidor SMTP, se registra el error y se marca la notificación como "FALLIDA".
2. **Errores de plantilla**: Si hay un error en la plantilla o en los datos proporcionados, se registra el error y se utiliza una plantilla de respaldo.
3. **Errores de adjuntos**: Si no se puede generar o adjuntar un archivo, se registra el error y se envía el correo sin el adjunto, incluyendo una nota explicativa.

## Consideraciones de Seguridad

1. **Credenciales SMTP**: Las credenciales del servidor SMTP se almacenan de forma segura en la base de datos.
2. **Validación de direcciones**: Se validan las direcciones de correo electrónico antes de enviar las notificaciones.
3. **Limitación de tasa**: Se implementa una limitación de tasa para evitar el envío masivo de correos en un corto período de tiempo.
4. **Registro de actividad**: Se registra toda la actividad de envío de correos para auditoría y seguimiento.

## Pruebas

El sistema de notificaciones incluye pruebas automatizadas para verificar su correcto funcionamiento:

1. **Pruebas unitarias**: Pruebas de cada componente por separado (gestor de plantillas, procesador de datos, cliente de correo).
2. **Pruebas de integración**: Pruebas del servicio de notificación completo con una base de datos de prueba.
3. **Pruebas de envío**: Pruebas de envío real de correos a direcciones de prueba.
