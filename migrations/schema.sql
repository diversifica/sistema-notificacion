-- Datos iniciales para el Sistema de Notificación de Altas y Bajas
-- Inserción de datos de ejemplo

-- Destinatarios
INSERT INTO destinatario (nombre, email) VALUES 
('Colegio de Fisioterapeutas', 'cdo31@ordremk.fr'),
('Seguridad Social', 'ps.cpam-haute-garonne@assurance-maladie.fr'),
('Profesional', ''); -- Se actualizará con el email del fisioterapeuta en cada caso

-- Plantillas
INSERT INTO plantilla (nombre, asunto, cuerpo) VALUES 
('ALTA_COLEGIO', 'Notification de l''arrivée d''un nouveau kinésithérapeute et mise à jour du personnel au cabinet', 'Bonjour,\n\nJe me permets de vous écrire pour vous informer de l''arrivée d''un nouveau kinésithérapeute dans notre cabinet.\n\nNouveau kinésithérapeute:\n\n• Nom: [Nom du nouveau kinésithérapeute]\n\n• Date de début: [Date de début]\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet, ainsi que le contrat du nouveau kinésithérapeute. Ce dernier a également été informé de l''importance de procéder au changement de statut auprès du conseil départemental de l''ordre des masseurs-kinésithérapeutes de l''Haute-Garonne.\n\nNous vous remercions de votre attention et restons à votre disposition pour toute question supplémentaire que vous pourriez avoir.\n\n\n\nCordialement,\n\n[pied-de-signature]'),
('ALTA_SEGURIDAD_SOCIAL', 'Notification de l''arrivée d''un nouveau kinésithérapeute et mise à jour du personnel au cabinet (Finess 3170001576)', 'Bonjour,\n\nJe me permets de vous écrire pour vous informer de l''arrivée d''un nouveau kinésithérapeute dans notre cabinet.\n\nNouveau kinésithérapeute:\n\n• Nom: [Nom du nouveau kinésithérapeute]\n\n• Date de début: [Date de début]\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet, ainsi que le contrat du nouveau kinésithérapeute. Ce dernier a également été informé de l''importance de procéder au changement de statut auprès du conseil départemental de l''ordre des masseurs-kinésithérapeutes de l''Haute-Garonne.\n\n\n\nNous vous remercions de votre attention et restons à votre disposition pour toute question supplémentaire que vous pourriez avoir.\n\nCordialement,\n\n\n\n[pied-de-signature]'),
('ALTA_PROFESIONAL', 'Bienvenue dans notre cabinet de kinésithérapie', 'Cher/Chère [Nom du kinésithérapeute],\n\nNous sommes ravis de vous accueillir dans notre cabinet de kinésithérapie. Votre arrivée est prévue pour le [Date de début].\n\nNous avons informé le Conseil Départemental de l''Ordre des Masseurs-Kinésithérapeutes ainsi que la Sécurité Sociale de votre arrivée.\n\nVeuillez trouver ci-joint une copie de votre contrat ainsi que la liste des kinésithérapeutes actuellement en activité dans notre cabinet.\n\nN''hésitez pas à nous contacter si vous avez des questions ou des préoccupations.\n\nNous nous réjouissons de travailler avec vous.\n\nCordialement,\n\n[pied-de-signature]'),
('BAJA_COLEGIO', 'Notification du départ de [Nom du kinésithérapeute] du cabinet.', 'Madame, Monsieur,\n\nPar la présente, nous vous informons que le/la kinésithérapeute [Nom du kinésithérapeute], a quitté notre cabinet de kinésithérapie à compter du [Date de départ].\n\n\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet.\n\n\n\nRestant à votre disposition pour toute information complémentaire,\n\nCordialement,\n\n\n\n[pied-de-signature]'),
('BAJA_SEGURIDAD_SOCIAL', 'Notification du départ de [Nom du kinésithérapeute] du cabinet (Finess 3170001576).', 'Madame, Monsieur,\n\nPar la présente, nous vous informons que le/la kinésithérapeute [Nom du kinésithérapeute], a quitté notre cabinet de kinésithérapie à compter du [Date de départ].\n\n\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet.\n\n\n\nRestant à votre disposition pour toute information complémentaire,\n\nCordialement,\n\n\n\n[pied-de-signature]'),
('BAJA_PROFESIONAL', 'Confirmation de votre départ du cabinet de kinésithérapie', 'Cher/Chère [Nom du kinésithérapeute],\n\nNous vous confirmons que votre départ de notre cabinet de kinésithérapie a été enregistré à compter du [Date de départ].\n\nNous avons informé le Conseil Départemental de l''Ordre des Masseurs-Kinésithérapeutes ainsi que la Sécurité Sociale de votre départ.\n\nNous vous remercions pour votre collaboration et vous souhaitons beaucoup de succès dans vos projets futurs.\n\nCordialement,\n\n[pied-de-signature]');

-- Configuración
INSERT INTO configuracion (clave, valor, descripcion) VALUES 
('EMAIL_REMITENTE', 'diversifica.ia@outlook.es', 'Email desde el que se envían las notificaciones'),
('FIRMA_EMAIL', '[Nombre del Remitente]\nCabinet de Kinésithérapie\nTel: [Teléfono]\nEmail: [Email]', 'Firma que se incluye en los correos electrónicos'),
('RUTA_CONTRATOS', '/app/storage/contratos', 'Ruta donde se almacenan los contratos de los fisioterapeutas'),
('FINESS_CABINET', '3170001576', 'Número FINESS del gabinete de fisioterapia'),
('SMTP_HOST', 'smtp.office365.com', 'Servidor SMTP para el envío de correos'),
('SMTP_PORT', '587', 'Puerto del servidor SMTP'),
('SMTP_SECURE', 'false', 'Indica si se debe utilizar una conexión segura (SSL/TLS)'),
('SMTP_USER', 'diversifica.ia@outlook.es', 'Usuario para la autenticación en el servidor SMTP'),
('SMTP_PASSWORD', 'password_placeholder', 'Contraseña para la autenticación en el servidor SMTP'),
('TEMP_DIR', '/app/storage/temp', 'Directorio temporal para la generación de archivos adjuntos');

-- Usuario Administrador (contraseña: admin123)
INSERT INTO usuario (nombre, apellidos, email, password, rol) VALUES 
('Admin', 'Sistema', 'admin@sistema.com', '$2a$10$1qAz2wSx3eDc4rFv5tGb5t8WGc5wPZXPUoY1cYXvW1cj8zR.6Alu.', 'ADMIN');

