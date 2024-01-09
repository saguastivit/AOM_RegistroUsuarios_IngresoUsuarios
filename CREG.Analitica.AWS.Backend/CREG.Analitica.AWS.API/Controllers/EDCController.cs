using CREG.Analitica.AWS.API.Models;
using CREG.Analitica.AWS.Core;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CREG.Analitica.AWS.API.Controllers
{
    public class EDCController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [Route("api/edc")]
        [HttpGet]
        public IEnumerable<edc> Get()
        {

            using (CREG_Analitica_AWSEntities edcEntities = new CREG_Analitica_AWSEntities())
            {
                //edcEntities.Configuration.LazyLoadingEnabled = false;
                return edcEntities.edc.Include(ed => ed.edc_formato).ToList();
            }
        }

        [HttpGet]
        public edc Get(int id)
        {
            using (CREG_Analitica_AWSEntities edcEntities = new CREG_Analitica_AWSEntities())
            {
                //edcEntities.Configuration.LazyLoadingEnabled = false;
                return edcEntities.edc.FirstOrDefault(e => e.id_edc == id);
            }
        }

        [Route("api/edc/edcFormatos")]
        [HttpGet]
        public IEnumerable<object> edcFormatos()
        {
            var formatos = new List<formato>();
            var edcs = new List<edc>();

            var outFormatosEdc = new List<object>();

            using (CREG_Analitica_AWSEntities edcEntities = new CREG_Analitica_AWSEntities())
            {
                edcs = edcEntities.edc.ToList();
                formatos = edcEntities.formato.Include(e => e.edc_formato).ToList();
            }

            foreach (var _formato in formatos)
            {

                if (!_formato.cod_formato.Equals("400") && !_formato.cod_formato.Equals("500") && !_formato.cod_formato.Equals("700") && !_formato.cod_formato.Equals("800") && !_formato.cod_formato.Equals("OPM"))
                {
                    var formatoBase = _formato.cod_formato.Substring(0, 1);
                    var codPadre = "";
                    var idPadre = 0;

                    switch (formatoBase)
                    {

                        case "4":
                            idPadre = 1;
                            codPadre = "400";
                            break;
                        case "5":
                            idPadre = 7;
                            codPadre = "500";
                            break;
                        case "7":
                            idPadre = 12;
                            codPadre = "700";
                            break;
                        case "8":
                            idPadre = 23;
                            codPadre = "800";
                            break;
                        case "O":
                            idPadre = 6;
                            codPadre = "OPM";
                            break;
                        default:
                            break;
                    }

                    var formato = new
                    {
                        id_formato = _formato.id_formato,
                        cod_formato = _formato.cod_formato,
                        nombre_formato = _formato.nombre_formato,
                        cod_padre = codPadre,
                        edcPadreFormato = new List<object>()
                    };

                    if (idPadre != 0)
                    {
                        formato.edcPadreFormato.AddRange(
                                dbContext.edc_formato.Include(e => e.edc)
                                                     .Where(f => f.id_formato == idPadre)
                                                     .Select(x => new { id_edc = x.edc.id_edc, cod_edc = x.edc.cod_edc })
                                                     .ToList());
                    };

                    outFormatosEdc.Add(formato);
                }
                else
                {
                    var formato = new
                    {
                        id_formato = _formato.id_formato,
                        cod_formato = _formato.cod_formato,
                        nombre_formato = _formato.nombre_formato,
                        cod_padre = "",
                        edcPadreFormato = new List<object>()
                    };

                    outFormatosEdc.Add(formato);
                }


                

            }

            return outFormatosEdc;
        }


        [HttpPost]
        public IHttpActionResult agregarEdc([FromBody] edc edc)
        {
            CREG_Analitica_AWSEntities edcEntities = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            edc.fecha_creacion = fecha;
            try
            {
                if (ModelState.IsValid)
                {
                    dbContext.edc.Add(edc);
                    dbContext.SaveChanges();
                    Ok(edc.id_edc);
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception e)
            {
                var form = edcEntities.edc.FirstOrDefault(em => em.id_edc == edc.id_edc);
                if (form != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "edc";
                        log.id_registro_tabla = (long)edc.id_edc;
                        log.columna_afectada = "id_edc";
                        log.valor_antiguo = "";
                        log.valor_nuevo = edc.id_edc + "";
                        log.fecha = edc.fecha_creacion;
                        log.usuario = edc.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {

                    }
                }
                else
                {
                    return BadRequest();
                }

            }
            return Ok(edc.id_edc);
        }

        [HttpPost]
        public IHttpActionResult añadirformatos(FormatoActualizacion formatoA)
        {
            CREG_Analitica_AWSEntities formatos = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            var respuesta = "";

            foreach (var formato in formatoA.formatos)
            {
                if (formatos.edc.Any(f => f.id_edc == formatoA.concepto))
                {
                    try
                    {
                        var nuevoFormato = new edc_formato()
                        {
                            id_formato = formato.id_formato,
                            id_edc = formatoA.concepto,
                            fecha_creacion = fecha,
                            usuario_creacion = formatoA.usuario,
                            activo = true
                        };

                        if (formato.id_edc_padre != 0)
                        {
                            nuevoFormato.id_edc_padre = formato.id_edc_padre;
                        }

                        var respuestaFormato = asignarFormato(nuevoFormato);

                        if (respuestaFormato)
                        {
                            respuesta = "ok";
                        }
                        else
                        {
                            NotFound();
                        }
                    }
                    catch (Exception ex)
                    {
                        BadRequest(ex.Message);
                    }
                }
            }

            return Ok(respuesta);
        }

        private bool asignarFormato(edc_formato edcFormato)
        {
            try
            {
                using (CREG_Analitica_AWSEntities fEntities = new CREG_Analitica_AWSEntities())
                {
                    fEntities.edc_formato.Add(edcFormato);
                    fEntities.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                var his = dbContext.edc_formato.FirstOrDefault(h => h.id_edc_formato == edcFormato.id_edc_formato);
                if (his != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "edc_formato";
                        log.id_registro_tabla = (long) edcFormato.id_edc_formato;
                        log.columna_afectada = "id_edc_formato";
                        log.valor_antiguo = "";
                        log.valor_nuevo = edcFormato.id_edc_formato + "";
                        log.fecha = edcFormato.fecha_creacion;
                        log.usuario = edcFormato.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                        return true;
                    }
                    catch
                    {
                        return true;
                        NotFound();
                    }
                }
                else
                {
                    throw new Exception(ex.InnerException.Message);
                    return false;
                }
            }
        }


        [HttpPost]
        public IHttpActionResult actualizarEdc([FromBody] edc edc)
        {
            if (ModelState.IsValid)
            {
                var edcAnt = dbContext.edc.FirstOrDefault(h => h.id_edc == edc.id_edc);
                var edcExiste = dbContext.edc.Count(c => c.id_edc == edc.id_edc) > 0;
                if (edcExiste)
                {
                    DateTime fecha = DateTime.Now;
                    edc.fecha_actualizacion = fecha;
                    if (edcAnt != null)
                        dbContext.Entry(edcAnt).State = EntityState.Detached;
                    dbContext.Entry(edc).State = EntityState.Modified;
                    dbContext.SaveChangesAsync();
                    insertarLog(edcAnt, edc);
                    return Ok("ok");
                }
                else
                {
                    return NotFound();
                }

            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost]
        public IHttpActionResult actualizarFormatos(FormatoActualizacion formatoA)
        {
            CREG_Analitica_AWSEntities formatos = new CREG_Analitica_AWSEntities();
            List<edc_formato> conceptoEdcs = formatos.edc_formato.Where(c => c.id_edc == formatoA.concepto).ToList();
            DateTime fecha = DateTime.Now;
            var respuesta = "";

            foreach (var formato in formatoA.formatos)
            {
                edc_formato formatoUC = new edc_formato();
                formatoUC = formatos.edc_formato.FirstOrDefault(cf => cf.id_formato == formato.id_formato && cf.id_edc == formatoA.concepto);

                if (formatoUC == null)
                {
                    try
                    {
                        formatoUC = new edc_formato();
                        formatoUC.id_formato = formato.id_formato;
                        formatoUC.id_edc = formatoA.concepto;
                        formatoUC.fecha_creacion = fecha;
                        formatoUC.usuario_creacion = formatoA.usuario;
                        formatoUC.activo = true;

                        if (formato.id_edc_padre != 0)
                        {
                            formatoUC.id_edc_padre = formato.id_edc_padre;
                        }

                        var respuestaFormato = asignarFormato(formatoUC);

                        if (respuestaFormato)
                        {
                            respuesta = "ok";
                        }
                        else
                        {
                            NotFound();
                        }
                    }
                    catch (Exception ex)
                    {
                        BadRequest(ex.Message);
                    }
                }
                else
                {
                    try
                    {
                        formatoUC.fecha_actualizacion = fecha;
                        formatoUC.usuario_actualizacion = formatoA.usuario;

                        if (formato.id_edc_padre != 0)
                        {
                            formatoUC.id_edc_padre = formato.id_edc_padre;
                        }

                        dbContext.Entry(formatoUC).State = EntityState.Modified;
                        dbContext.SaveChangesAsync();

                        respuesta = "ok";
                    }
                    catch (Exception ex)
                    {
                        BadRequest(ex.Message);
                    }
                }
            }


            // alistar los campos que vamos a quitar
            foreach (var formato in conceptoEdcs)
            {
                if (!formatoA.formatos.Any(cf => cf.id_formato == formato.id_formato))
                {
                    var respuestaFormato = removerFormato(formato);

                    if (respuestaFormato)
                    {
                        respuesta = "ok";
                    }
                    else
                    {
                        NotFound();
                    }
                }
            }

            return Ok(respuesta);
        }

        private bool removerFormato(edc_formato edcFormato)
        {
            try
            {
                using (CREG_Analitica_AWSEntities cfEntities = new CREG_Analitica_AWSEntities())
                {
                    cfEntities.edc_formato.Attach(edcFormato);
                    cfEntities.Entry(edcFormato).State = EntityState.Deleted;
                    cfEntities.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                var his = dbContext.edc_formato.FirstOrDefault(h => h.id_edc_formato == edcFormato.id_edc_formato);
                if (his == null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "edc_formato";
                        log.id_registro_tabla = (long)edcFormato.id_edc_formato;
                        log.columna_afectada = "id_edc_formato";
                        log.valor_antiguo = edcFormato.id_edc_formato + ""; ;
                        log.valor_nuevo = "";
                        log.fecha = edcFormato.fecha_creacion;
                        log.usuario = edcFormato.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                        return true;
                    }
                    catch
                    {
                        return true;
                        NotFound();
                    }
                }
                else
                {
                    throw new Exception(ex.InnerException.Message);
                    return false;
                }
            }
        }


        [HttpDelete]
        public IHttpActionResult eliminarEdc(int id)
        {

            var edc = dbContext.edc.Find(id);
            if (edc != null)
            {
                dbContext.edc.Remove(edc);
                dbContext.SaveChanges();
                return Ok(edc);
            }
            else
            {
                return NotFound();
            }

        }

        private bool insertarLog(edc edcAntigua, edc edcNueva)
        {
            //comparar cod edc
            if (!edcAntigua.cod_edc.Equals(edcNueva.cod_edc))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "edc";
                    log.id_registro_tabla = (long)edcAntigua.id_edc;
                    log.columna_afectada = "cod_edc";
                    log.valor_antiguo = edcAntigua.cod_edc + "";
                    log.valor_nuevo = edcNueva.cod_edc + "";
                    log.fecha = (DateTime)edcNueva.fecha_actualizacion;
                    log.usuario = edcNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar nombre edc
            if (!edcAntigua.nombre_edc.Equals(edcNueva.nombre_edc))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "edc";
                    log.id_registro_tabla = (long) edcAntigua.id_edc;
                    log.columna_afectada = "nombre_edc";
                    log.valor_antiguo = edcAntigua.nombre_edc + "";
                    log.valor_nuevo = edcNueva.nombre_edc + "";
                    log.fecha = (DateTime)edcNueva.fecha_actualizacion;
                    log.usuario = edcNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar descripcion edc
            if (!edcAntigua.descripcion_edc.Equals(edcNueva.descripcion_edc))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "edc";
                    log.id_registro_tabla = (long) edcAntigua.id_edc;
                    log.columna_afectada = "descripcion_edc";
                    log.valor_antiguo = edcAntigua.descripcion_edc + "";
                    log.valor_nuevo = edcNueva.descripcion_edc + "";
                    log.fecha = (DateTime)edcNueva.fecha_actualizacion;
                    log.usuario = edcNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }


            // comparar activo
            if (!edcAntigua.activo.Equals(edcNueva.activo))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "edc";
                    log.id_registro_tabla = (long) edcAntigua.id_edc;
                    log.columna_afectada = "activo";
                    log.valor_antiguo = edcAntigua.activo + "";
                    log.valor_nuevo = edcNueva.activo + "";
                    log.fecha = (DateTime)edcNueva.fecha_actualizacion;
                    log.usuario = edcNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            return true;
        }


    }


    

}
