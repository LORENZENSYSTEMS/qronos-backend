import { uploadToS3 } from '../../../utils/s3Config.js';

const ALLOWED_FIELDS = [
  'nombreCompleto', 'correo', 'contrasena', 'pushToken',
  'fotoPerfil', 'fotoDescripcion1', 'fotoDescripcion2', 'fotoDescripcion3',
  'ubicacionMaps', 'whatsapp', 'descuento', 'descripcion', 'pais', 'ciudad',
  'categoria', 'horarioApertura', 'horarioCierre',
  'mostrar_reservas', 'tipo_reservas', 'instagram', 'sitioWeb',
];

export class EmpresaUpdateService {
  async parseAndUpload(request) {
    const dataToUpdate = {};
    const parts = request.parts();

    for await (const part of parts) {
      if (part.file) {
        const url = await this._uploadFile(part);
        if (url !== null) {
          dataToUpdate[part.fieldname] = url;
        }
      } else {
        this._collectText(part, dataToUpdate);
      }
    }

    return dataToUpdate;
  }

  async _uploadFile(part) {
    if (!ALLOWED_FIELDS.includes(part.fieldname)) {
      console.warn(`Campo de archivo no permitido: ${part.fieldname}`);
      return null;
    }

    try {
      const buffer = await part.toBuffer();

      if (!buffer || buffer.length === 0) {
        return null;
      }

      const url = await uploadToS3(buffer, part.filename, part.mimetype);
      console.log(`Imagen subida: ${part.fieldname} -> ${url}`);
      return url;
    } catch (err) {
      console.error(`Error subiendo imagen ${part.fieldname}:`, err);
      return null;
    }
  }

  _collectText(part, dataToUpdate) {
    if (!ALLOWED_FIELDS.includes(part.fieldname)) {
      console.warn(`Campo de texto ignorado (no en whitelist): ${part.fieldname}`);
      return;
    }

    if (part.value === 'undefined' || part.value === 'null') {
      return;
    }

    if (part.fieldname === 'mostrar_reservas') {
      dataToUpdate[part.fieldname] = part.value === 'true';
    } else {
      dataToUpdate[part.fieldname] = part.value;
    }
  }
}
