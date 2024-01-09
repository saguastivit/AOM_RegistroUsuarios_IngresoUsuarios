using Amazon;
using Amazon.S3;
using Amazon.S3.Transfer;
using CREG.Analitica.AWS.API.Models;
using CREG.Analitica.AWS.Core;
using ExcelDataReader;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Web.Http;

namespace CREG.Analitica.AWS.API.Controllers
{
    public class UploadController : ApiController
    {
        private string id_tramo = "";

        [Route("api/Upload/PostFormData")]
        [HttpPost]
        public Task<IEnumerable<FileDesc>> PostFormData()
        {
            string folderName = "uploads";
            string PATH = System.Web.HttpContext.Current.Server.MapPath("~/" + folderName);
            string rootUrl = Request.RequestUri.AbsoluteUri.Replace(Request.RequestUri.AbsolutePath, String.Empty);

            if (Request.Content.IsMimeMultipartContent())
            {
                var streamProvider = new CustomMultipartFormDataStreamProvider(PATH);
                var task = Request.Content.ReadAsMultipartAsync(streamProvider).ContinueWith<IEnumerable<FileDesc>>(t =>
                {

                    if (t.IsFaulted || t.IsCanceled)
                    {
                        throw new HttpResponseException(HttpStatusCode.InternalServerError);
                    }

                    id_tramo = "";
                    var empresa = streamProvider.FormData.GetValues("empresa")[0];
                    var user = streamProvider.FormData.GetValues("user")[0];
                    var fileInfo = streamProvider.FileData.Select(i =>
                    {
                        var info = new FileInfo(i.LocalFileName);
                        List<String> error = new List<string>();

                        //insertar datos de historial
                        historial_aom historial = new historial_aom();
                        //historial.id_historial_aom = 5;
                        var idEmp = 0;
                        int.TryParse(empresa, out idEmp);
                        historial.id_empresa = idEmp;
                        //historial.id_formato = default(decimal);
                        historial.id_tramo = null;
                        historial.nombre_original_archivo_aom = info.Name;
                        historial.nombre_archivo_aom = "";
                        //historial.anio_aom = 0;
                        historial.extension_aom = info.Extension;
                        historial.tamanio_aom = info.Length.ToString();
                        historial.usuario_carga = user;
                        DateTime fecha = DateTime.Now;
                        historial.fecha_carga = fecha;
                        historial.ruta_aom = "";
                        historial.error = "";
                        historial.estado = "temporal";
                        historial.empresa = null;
                        historial.formato = null;
                        historial.tramo = null;



                        if (!insertarHistorial(historial))
                        {
                            return null;
                        }

                        var id_historial = historial.id_historial_aom;

                        if (i.LocalFileName.EndsWith(".xlsx") || i.LocalFileName.EndsWith(".xlsm") || i.LocalFileName.EndsWith(".xls"))
                        {
                            //var info = new FileInfo(i.LocalFileName);
                            char[] delimiterChars = { '-','.'};
                            string text = info.Name;

                            string[] words = text.Split(delimiterChars);
                            var cont = 0;
                            var aom = "";
                            var formato = "";
                            var anio = "";
                            var tramo = "";

                            foreach (var word in words)
                            {
                                cont++;
                                if(cont == 1)
                                {
                                    aom = word; 
                                }
                                else if (cont == 2)
                                {
                                    formato = word;
                                }
                                else if (cont == 3)
                                {
                                    anio = word;
                                }
                            
                            }

                            if (validarNombreArchivo(info.Name,aom,formato,anio,""))
                            {
                                var mensajes = validarExcel(i.LocalFileName, info.Name, formato, anio);

                                CREG_Analitica_AWSEntities empresaEntities = new CREG_Analitica_AWSEntities();

                                if (mensajes == null || mensajes.Count == 0)
                                {
                                   
                                    var id_empresa = int.Parse(empresa);
                                    var emp = empresaEntities.empresa.FirstOrDefault(e => e.id_empresa == id_empresa);
                                    var form = empresaEntities.formato.FirstOrDefault(e => e.cod_formato == formato);
                                    var act = empresaEntities.actividad.FirstOrDefault(e => e.id_actividad == form.id_actividad);
                                    var serv = empresaEntities.servicio.FirstOrDefault(e => e.id_servicio == act.id_servicio);
                                    var nombre_archivo = "AOM-C"+emp.cod_empresa+"-S"+emp.cod_sui_empresa+"-"+serv.id_servicio+"-"+act.id_actividad+"-"+anio+"-" + id_tramo + "-" + id_historial;

                                    //validar duplicado

                                    if (uploadS3AWS(i.LocalFileName, nombre_archivo))
                                    {
                                        historial.estado = "cargado";
                                        historial.id_formato = form.id_formato;
                                        //historial.id_tramo =
                                        historial.nombre_archivo_aom = nombre_archivo;
                                        historial.anio_aom = int.Parse(anio);
                                        historial.ruta_aom = "s3://bext-creg/Nuevos/"+nombre_archivo; 
                                        if(formato.Equals("502") || formato.Equals("802") || formato.Equals("805") || formato.Equals("806"))
                                        {
                                            historial.id_tramo = id_tramo;
                                        }
                                        actualizarHistorial(id_historial, historial);
                                        error.Add($"Archivo cargado correctamente, con numero de registro {historial.id_historial_aom}.");
                                        //return new FileDesc(true, info.Name, rootUrl + "/" + folderName + "/" + info.Name, info.Length / 1024, error);
                                        FileDesc output = new FileDesc(false, info.Name, rootUrl + "/" + folderName + "/" + info.Name, info.Length / 1024, error);
                                        File.Delete(i.LocalFileName);
                                        return output;
                                    }
                                    else
                                    {
                                        historial.estado = "error al cargar al S3 AWS";
                                        actualizarHistorial(id_historial, historial);
                                        error.Add("El archivo no pudo cargarse, intentelo nuevamente");
                                        //return new FileDesc(false, info.Name, rootUrl + "/" + folderName + "/" + info.Name, info.Length / 1024, error);
                                        FileDesc output = new FileDesc(false, info.Name, rootUrl + "/" + folderName + "/" + info.Name, info.Length / 1024, error);
                                        File.Delete(i.LocalFileName);
                                        return output;
                                    }
                                    
                                }
                                else
                                {
                                    historial.estado = "rechazado";
                                    var form = empresaEntities.formato.FirstOrDefault(e => e.cod_formato == formato);
                                    historial.id_formato = form.id_formato;
                                    historial.anio_aom = int.Parse(anio);
                                    error.AddRange(mensajes);
                                    historial.error = string.Join(";", error);
                                    if (formato.Equals("502") || formato.Equals("802") || formato.Equals("805") || formato.Equals("806"))
                                    {
                                        historial.id_tramo = id_tramo;
                                    }
                                    actualizarHistorial(id_historial, historial);
                                    //error.AddRange(mensajes);
                                    FileDesc output = new FileDesc(false, info.Name, rootUrl + "/" + folderName + "/" + info.Name, info.Length / 1024, error);
                                    File.Delete(i.LocalFileName);
                                    return output;
                                }                                
                            }
                            else
                            {
                                historial.estado = "rechazado";
                                error.Add("El tipo de archivo no cumple con el nombre admitido");
                                historial.error = string.Join(";", error);
                                actualizarHistorial(id_historial, historial);
                                FileDesc output = new FileDesc(false, info.Name, rootUrl + "/" + folderName + "/" + info.Name, info.Length / 1024, error);
                                File.Delete(i.LocalFileName);
                                return output;
                            }


                        }
                        else
                        {
                            //var info = new FileInfo(i.LocalFileName);
                            //List<String> error = new List<string>();
                            historial.estado = "rechazado";
                            error.Add("El tipo de archivo no cumple con el formato admitido");
                            historial.error = string.Join(";", error);
                            actualizarHistorial(id_historial, historial);
                            FileDesc output = new FileDesc(false, info.Name, rootUrl + "/" + folderName + "/" + info.Name, info.Length / 1024, error);
                            File.Delete(i.LocalFileName);
                            return output;
                        }

                    });
                    return fileInfo;
                });

                return task;
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotAcceptable, "This request is not properly formatted"));
            }
        }

        /// <summary>
        /// valida que el nombre del archivo coresponda
        /// a los permitidos para la empresa seleccionada
        /// </summary>
        /// <param name="archivo"></param>
        /// <returns></returns>
        private Boolean validarNombreArchivo(string fileName, String aom,String formato, String anio, String empresa)
        {
            bool respuesta = false;

            if (aom.Equals("AOM") || aom.Equals("aom"))
            {
                try
                {
                    using (CREG_Analitica_AWSEntities formatoentities = new CREG_Analitica_AWSEntities())
                    {
                        //formatoentities.Configuration.LazyLoadingEnabled = false;
                        respuesta = formatoentities.formato.Any(f => f.cod_formato.Equals(formato));
                    };
                
                    if ( Int64.Parse(anio) < 2000)
                    {
                        respuesta = false;
                    }
                }
                catch
                {
                    respuesta = false;
                }
                
            }

            return respuesta;
        }

        /// <summary>
        /// trae los datos del formato que se esta trabajando 
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public formato traerFormato(string codFormato)
        {
            formato formato = new formato();

            using (CREG_Analitica_AWSEntities formatoentities = new CREG_Analitica_AWSEntities())
            {
                //formatoentities.Configuration.LazyLoadingEnabled = false;
                formato = formatoentities.formato.Where(f => f.cod_formato.Equals(codFormato)).FirstOrDefault();
            };

            return formato;
        }

        /// <summary>
        /// trae los centros de costos correspondientes al formato cargado
        /// </summary>
        /// <param name="id_formato"></param>
        /// <returns></returns>
        public List<edc> traeredc(decimal id_formato)
        {
            using (CREG_Analitica_AWSEntities edcentities = new CREG_Analitica_AWSEntities())
            {
                //edcentities.Configuration.LazyLoadingEnabled = false;
                // centros de costos habilitados
                var edcByFormat = (from _edc in edcentities.edc
                                   join _edcFormato in edcentities.edc_formato
                                   on new { _edc.id_edc, id_formato }
                                   equals new { _edcFormato.id_edc, _edcFormato.id_formato }
                                   where _edcFormato.activo == true
                                   select _edc).ToList();

                return edcByFormat;
            };
        }

        /// <summary>
        /// trae los cconceptos correspondientes al formato cargado
        /// </summary>
        /// <param name="id_formato"></param>
        /// <returns></returns>
        public List<concepto> traerconceptos(decimal id_formato)
        {
            using (CREG_Analitica_AWSEntities conceptosentities = new CREG_Analitica_AWSEntities())
            {
                //conceptosentities.Configuration.LazyLoadingEnabled = false;
                // conceptoss habilitados
                var conceptoByFormat = (from _concepto in conceptosentities.concepto
                                        join _conceptoFormato in conceptosentities.concepto_formato
                                        on new { _concepto.id_concepto, id_formato }
                                        equals new { _conceptoFormato.id_concepto, _conceptoFormato.id_formato}
                                        where _conceptoFormato.activo == true && _concepto.concepto_cargado == false
                                        select _concepto).ToList();

                return conceptoByFormat;
            };
        }

        /// <summary>
        /// valida que los titulos del documento correspondan a los de 
        /// el formato cargado
        /// </summary>
        /// <param name="localFile"></param>
        private List<string> validarExcel(string localFile, string filename, string codformato, string anio) // este metodo se debe desgregar
        {
            #region parametros

            // tener presente el formato para consultas
            formato formato = traerFormato(codformato);

            // lista de mensajes error
            List<string> mensajesExcel = new List<string>();

            #endregion

            #region edc DB

            // estructura de costos habilitados
            var edcByFormat = new List<edc>();

            // consulta y validacion para obtener los edc correspondientes al formato
            edcByFormat = traeredc(formato.id_formato);

            if (edcByFormat == null || edcByFormat.Count == 0)
            {
                mensajesExcel.Add("El formato no cuenta con estructura de costos asociados en base de datos");
                return mensajesExcel;
            }

            #endregion

            #region conceptos DB

            // conceptos habilitados
            var conceptosByFormat = new List<concepto>();

            // consulta y validacion para obtener los conceptos correspondientes al formato
            conceptosByFormat = traerconceptos(formato.id_formato);

            if (conceptosByFormat == null || conceptosByFormat.Count == 0)
            {
                mensajesExcel.Add("El formato no cuenta con conceptos asociados en base de datos");
                return mensajesExcel;
            }

            #endregion

            #region edc & conceptos del Excel

            // para almacenar los edc del excel
            List<string> edcExcel = new List<string>();

            // para almacenar los conceptos del excel
            List<string> conceptosExcel = new List<string>();


            try
            {
                using (var stream = File.Open(localFile, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        var result = reader.AsDataSet();
                        DataTable table = null;
                        foreach (DataTable row in result.Tables)
                        {
                            if (row.TableName.Equals("Plantilla") || row.TableName.Contains("Plantilla"))
                            {
                                table = row;
                            }

                        }
                        //DataTable table = result.Tables[1];

                        if (table != null)
                        {
                            //lee la hoja de excel indicada
                            if (table.TableName.Equals("Plantilla") || table.TableName.Contains("Plantilla"))
                            {
                                // la posicion 2 es en todo excel donde estan ubicados las estructuras de costos                    
                                var inicioRow = 2;

                                // la pocicion 3 es la celda desde donde empiezan a ser nombrados los conceptos         
                                var inicioCol = 3;

                                DataRow roweds = table.Rows[inicioRow];

                                edcExcel = roweds.ItemArray.Where(edc => !string.IsNullOrEmpty(edc.ToString())).Select(edc => edc.ToString()).ToList();

                                for (int i = inicioCol; i < table.Rows.Count; i++)
                                {
                                    conceptosExcel.Add(table.Rows[i][0].ToString());
                                }
                            }
                            else
                            {
                                mensajesExcel.Add("El formato no cuenta con la hoja plantilla ");
                                return mensajesExcel;
                            }
                        }
                        else
                        {
                            mensajesExcel.Add("El formato no cuenta con la hoja plantilla ");
                            return mensajesExcel;
                        }


                    }
                }
            }
            catch
            {
                mensajesExcel.Add("Error de lectura del archivo");
                return mensajesExcel;
            }
            


            #endregion

            #region validando estructura de costos

            for (int i = 0; i < edcByFormat.Count; i++)
            {
                var bandera = false;
                for (int c = 0; c < edcExcel.Count; c++)
                {
                    if (edcExcel[c].Equals(edcByFormat[i].cod_edc))
                    {
                        bandera = true;
                    }
                }
                if (!bandera)
                {
                    mensajesExcel.Add($"La estructura de costos '{edcByFormat[i].cod_edc}' no se encuentra en la estructura del archivo");
                }

            }

            if (codformato.Equals("401"))
            {
                if (edcByFormat.Count != edcExcel.Count - 3)
                {
                    mensajesExcel.Add($"El Formato no cumple con la cantidad de estructuras de costos adecuada");
                }
            }
            


            #endregion


            #region validando conceptos

            for (int i = 0; i < conceptosByFormat.Count; i++)
            {
                var bandera = false;
                for (int c = 0; c < conceptosExcel.Count; c++)
                {
                    if (conceptosExcel[c].Equals(conceptosByFormat[i].cod_concepto))
                    {
                        bandera = true;
                    }
                }
                if (!bandera)
                {
                    mensajesExcel.Add($"El concepto '{conceptosByFormat[i].cod_concepto} - {conceptosByFormat[i].descripcion_concepto}' no se encuentra en la estructura del archivo");
                }

            }

            #endregion


            //validar negativos y positivos
            if (int.Parse(anio) >= 2020)
            {
                try
                {
                    using (var stream = File.Open(localFile, FileMode.Open, FileAccess.Read))
                    {
                        using (var reader = ExcelReaderFactory.CreateReader(stream))
                        {
                            var result = reader.AsDataSet();
                            DataTable table = null;
                            foreach (DataTable row in result.Tables)
                            {
                                if (row.TableName.Equals("Plantilla") || row.TableName.Contains("Plantilla"))
                                {
                                    table = row;
                                }

                            }
                            //DataTable table = result.Tables[1];

                            if (table != null)
                            {
                                // lee la hoja de excel  indicada
                                if (table.TableName.Equals("Plantilla") || table.TableName.Contains("Plantilla"))
                                {
                                    // la posicion 2 es en todo excel donde estan ubicados las estructuras de costos                    
                                    var inicioEdc = 3;

                                    // la pocicion 3 es la celda desde donde empiezan a ser nombrados los conceptos         
                                    var inicioCon = 3;
                                    var celda = "";

                                    for (int i = inicioCon; i < table.Rows.Count; i++)
                                    {
                                        for (int c = inicioEdc; c < edcByFormat.Count + inicioEdc; c++)
                                        {
                                            celda = table.Rows[i][c].ToString();
                                            try
                                            {
                                                Int64 number1 = 0;
                                                if (Int64.TryParse(celda, out number1))
                                                {
                                                    if (number1 < 0)
                                                    {
                                                        mensajesExcel.Add($"La columna {i + 1}, fila {c + 1} tiene valor negativo '{celda}'");
                                                    }
                                                }
                                                else
                                                {
                                                    if (celda != "" && celda != " ")
                                                    {
                                                        mensajesExcel.Add($"La columna {i + 1}, fila {c + 1} no tiene un valor numerico entero (decimal)'{celda}'");
                                                    }
                                                }

                                            }
                                            catch
                                            {
                                                mensajesExcel.Add($"La columna {i + 1}, fila {c + 1} no tiene un valor numerico entero (decimal) '{celda}'");
                                            }

                                        }
                                    }
                                }
                                else
                                {
                                    mensajesExcel.Add("El formato no cuenta con la hoja plantilla ");
                                    return mensajesExcel;
                                }
                            }
                            else
                            {
                                mensajesExcel.Add("El formato no cuenta con la hoja plantilla ");
                                return mensajesExcel;
                            }
                        }
                    }
                }
                catch
                {
                    mensajesExcel.Add("Error de lectura del archivo");
                    return mensajesExcel;
                }
            }
            
            

            //validar tramos
            if(codformato.Equals("502") || codformato.Equals("802") || codformato.Equals("805") || codformato.Equals("806"))
            {
                try
                {
                    using (var stream = File.Open(localFile, FileMode.Open, FileAccess.Read))
                    {
                        using (var reader = ExcelReaderFactory.CreateReader(stream))
                        {
                            var result = reader.AsDataSet();
                            DataTable table = null;
                            foreach (DataTable row in result.Tables)
                            {
                                if (row.TableName.Equals("Plantilla") || row.TableName.Contains("Plantilla"))
                                {
                                    table = row;
                                }

                            }
                            //DataTable table = result.Tables[1];

                            if (table != null)
                            {
                                if (table.TableName.Equals("Plantilla") || table.TableName.Contains("Plantilla"))
                                {
                                    // la posicion 2 es en todo excel donde estan ubicados las estructuras de costos                    
                                    var tramo = table.Rows[1][0].ToString();
                                    CREG_Analitica_AWSEntities historialentities = new CREG_Analitica_AWSEntities();
                                    var tram = historialentities.tramo.FirstOrDefault(e => e.descripcion_tramo == tramo);
                                    if (tram != null)
                                    {
                                        id_tramo = tram.id_tramo;
                                    }
                                    else
                                    {
                                        id_tramo = null;
                                        mensajesExcel.Add("tramo no seleccionado en el archivo");
                                        return mensajesExcel;
                                    }
                                }
                                else
                                {
                                    mensajesExcel.Add("El formato no cuenta con la hoja plantilla ");
                                    return mensajesExcel;
                                }
                            }
                            else
                            {
                                mensajesExcel.Add("El formato no cuenta con la hoja plantilla ");
                                return mensajesExcel;
                            }

                        }
                    }
                }
                catch
                {
                    mensajesExcel.Add("Error de lectura del archivo");
                    return mensajesExcel;
                }
                
            }


            return mensajesExcel;

        }

        private bool uploadS3AWS(string pathArchivo, string keyname)
        {
          
            RegionEndpoint bucketRegion = RegionEndpoint.USEast1;
    
            string fileToBackup = pathArchivo; // test file
            string myBucketName = "bext-creg"; //your s3 bucket name goes here
            string s3DirectoryName = "Nuevos";
            string s3FileName = keyname;

            UploadFileAPI_S3AWS myUploader = new UploadFileAPI_S3AWS();
            return myUploader.sendFileToS3(fileToBackup, myBucketName, s3DirectoryName, s3FileName);

        }

        private Boolean insertarHistorial(historial_aom historial)
        {
            CREG_Analitica_AWSEntities historialentities = new CREG_Analitica_AWSEntities();
            try
            {
                if (ModelState.IsValid)
                {
                    //var emp = historialentities.empresa.FirstOrDefault(e => e.id_empresa == 1);
                    historialentities.historial_aom.Add(historial);
                    historialentities.SaveChanges();

                }

            }
            catch (Exception e)
            {
                var his = historialentities.historial_aom.FirstOrDefault(h => h.id_historial_aom == historial.id_historial_aom);
                if (his != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "historial_aom";
                        log.id_registro_tabla = (long)historial.id_historial_aom;
                        log.columna_afectada = "id_historial_aom";
                        log.valor_antiguo = "";
                        log.valor_nuevo = historial.id_historial_aom + "";
                        log.fecha = historial.fecha_carga;
                        log.usuario = historial.usuario_carga;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {
                        return true;
                    }
                    return true;

                }
                else
                {
                    return true;
                }

            }
            return true;

        }

        private Boolean actualizarHistorial(decimal id, historial_aom historial)
        {
            CREG_Analitica_AWSEntities historialentities = new CREG_Analitica_AWSEntities();

            try
            {
                if (ModelState.IsValid)
                {
                    var historialExiste = historialentities.historial_aom.Count(c => c.id_historial_aom == id) > 0;
                    if (historialExiste)
                    {
                        if(historial.error.Length > 30000)
                        {
                            historial.error = "El mensaje de error es muy grande y no se puede almacenar";
                        }
                        historialentities.Entry(historial).State = EntityState.Modified;
                        historialentities.SaveChanges();
                        return true;
                    }
                    else
                    {
                        return false;
                    }

                }
                else
                {
                    return false;
                }
            }
            catch (Exception e)
            {
                var his = historialentities.historial_aom.FirstOrDefault(h => h.id_historial_aom == id);
                if (his != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "historial_aom";
                        log.id_registro_tabla = (long)historial.id_historial_aom;
                        log.columna_afectada = "estado";
                        log.valor_antiguo = "temporal";
                        log.valor_nuevo = historial.estado;
                        log.fecha = historial.fecha_carga;
                        log.usuario = historial.usuario_carga;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {
                        if (historial.estado.Equals("cargado"))
                        {
                            try
                            {
                                CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                                log_auditoria log = new log_auditoria();
                                log.tabla = "historial_aom";
                                log.id_registro_tabla = (long)historial.id_historial_aom;
                                log.columna_afectada = "ruta_aom";
                                log.valor_antiguo = "";
                                log.valor_nuevo = historial.ruta_aom;
                                log.fecha = historial.fecha_carga;
                                log.usuario = historial.usuario_carga;
                                logentities.log_auditoria.Add(log);
                                logentities.SaveChanges();
                            }
                            catch
                            {
                                try
                                {
                                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                                    log_auditoria log = new log_auditoria();
                                    log.tabla = "historial_aom";
                                    log.id_registro_tabla = (long)historial.id_historial_aom;
                                    log.columna_afectada = "nombre_archivo_aom";
                                    log.valor_antiguo = "";
                                    log.valor_nuevo = historial.nombre_archivo_aom;
                                    log.fecha = historial.fecha_carga;
                                    log.usuario = historial.usuario_carga;
                                    logentities.log_auditoria.Add(log);
                                    logentities.SaveChanges();
                                }
                                catch
                                {

                                }
                            }
                        }

                    }
                    return true;
                }
                else
                {
                    return false;
                }
            }

        }

        [HttpGet]
        public IEnumerable<formato> formatosEmpresa(int id)
        {
            using (CREG_Analitica_AWSEntities formatoEntities = new CREG_Analitica_AWSEntities())
            {
                var formatosList = (from _formato in formatoEntities.formato
                                    join _actividadempresa in formatoEntities.empresa_actividad
                                    on _formato.id_actividad equals _actividadempresa.id_actividad
                                    join _empresa in formatoEntities.empresa
                                    on _actividadempresa.id_empresa equals _empresa.id_empresa
                                    where _empresa.id_empresa == id
                                    select _formato).ToList();

                return formatosList;
            }
        }

        [Route("api/Upload/validarHistorial")]
        [HttpPost]
        public List<RtaFormatos> ValidarHistorial([FromBody] ListaFormatos listaFormatos)
        {
            var respuesta = new List<RtaFormatos>();
            var empresa = int.Parse(listaFormatos.empresa);

            char[] delimiterChars = { '-'};
            for (int i = 0; i < listaFormatos.formatos.Count; i++)
            {
                string form = listaFormatos.formatos[i].ToString();
                string[] words = form.Split(delimiterChars);
                var cont = 0;
                var nformato = "";
                var anio = 0;
                var tramo = "";

                foreach (var word in words)
                {
                    cont++;
                    if (cont == 1)
                    {
                        nformato = word;
                    }
                    else if (cont == 2)
                    {
                        anio = int.Parse(word);
                    }
                    else if (cont == 3)
                    {
                        tramo = word;
                    }

                }

                using (CREG_Analitica_AWSEntities historialEntities = new CREG_Analitica_AWSEntities())
                {

                    var formatosList = (from _historial in historialEntities.historial_aom
                                            join _formato in historialEntities.formato
                                            on _historial.id_formato equals _formato.id_formato
                                            where _historial.anio_aom == anio && _historial.id_empresa == empresa 
                                            && _formato.cod_formato == nformato && _historial.estado.Equals("cargado") 
                                            && _formato.cod_formato != "802"  
                                            && _formato.cod_formato != "502"
                                            && _formato.cod_formato != "805"
                                            && _formato.cod_formato != "806"
                                        //&& _historial.id_tramo.Equals(tramo)
                                        orderby _historial.fecha_carga descending
                                            select _historial).ToList();
  

                    if(formatosList.Count > 0)
                    {
                        respuesta.Add(new RtaFormatos(nformato,anio+"",empresa+"",formatosList[0],true));
                    }
                    else
                    {
                        respuesta.Add(new RtaFormatos(nformato, anio + "", empresa + "", null, false));
                    }

                }

            }

            return respuesta;
            
        }
    }

    //private Dictionary<string, List<string>>

}

