export interface InfoBasica {
  numeroNit: string;
  dv: number;
  nombreEmpresa: string;
  telefonoEmpresa: string;
  email: string;
  nameArchivoPDF: string;
  archivoPDF: string | null;
}
export interface DatosContacto {
  tipoDocIdentidad: string;
  numeroDocIdentidad: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  numeroTelefono: string;
  ext?: string;
  numeroCelular: string;
  correoElectronico: string;
  esRepresentanteLegal?: boolean;
  archivoIdentidad?: string | null;
  documentoIdentidad?: string | null;
  solicitudId:number | undefined
}
