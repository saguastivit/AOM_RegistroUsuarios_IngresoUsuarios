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
    public class ConceptoController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<concepto> Get()
        {

            using (CREG_Analitica_AWSEntities conceptoEntities = new CREG_Analitica_AWSEntities())
            {
                //conceptoEntities.Configuration.LazyLoadingEnabled = false;
                return conceptoEntities.concepto.Include(f => f.concepto_formato).ToList();
            }
        }

        [HttpGet]
        public concepto Get(int id)
        {
            using (CREG_Analitica_AWSEntities conceptoEntities = new CREG_Analitica_AWSEntities())
            {
                //conceptoEntities.Configuration.LazyLoadingEnabled = false;
                return conceptoEntities.concepto.FirstOrDefault(e => e.id_concepto == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarConcepto([FromBody] concepto concepto)
        {
            CREG_Analitica_AWSEntities conceptoEntities = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            concepto.fecha_creacion = fecha;
            var conceptorender = renderConcepto(concepto);
            try
            {
                if (ModelState.IsValid)
                {
                    dbContext.concepto.Add(conceptorender);
                    dbContext.SaveChanges();
                    Ok(conceptorender.id_concepto);
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception e)
            {
                var form = dbContext.concepto.FirstOrDefault(em => em.id_concepto == conceptorender.id_concepto);
                if (form != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "concepto";
                        log.id_registro_tabla = (long)conceptorender.id_concepto;
                        log.columna_afectada = "id_concepto";
                        log.valor_antiguo = "";
                        log.valor_nuevo = conceptorender.id_concepto + "";
                        log.fecha = conceptorender.fecha_creacion;
                        log.usuario = conceptorender.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {
                        NotFound();
                    }
                }
                else
                {
                    return BadRequest();
                }

            }
            return Ok(conceptorender.id_concepto);
        }

        public concepto renderConcepto(concepto pre)
        {
            CREG_Analitica_AWSEntities conceptoEntities = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;

            var cod_padre = "";

            if (pre.id_concepto_padre != null)
            {
                cod_padre = conceptoEntities.concepto.FirstOrDefault(c => c.id_concepto == pre.id_concepto_padre).cod_concepto;
            }

            var render = new concepto()
            {
                cod_concepto = "",
                id_concepto_padre = pre.id_concepto_padre,
                descripcion_concepto = pre.descripcion_concepto,
                nivel_concepto = pre.nivel_concepto,
                flag_ref_normativa = pre.flag_ref_normativa,
                concepto_cargado = pre.concepto_cargado,
                usuario_creacion = pre.usuario_creacion,
                fecha_creacion = fecha,
                activo = pre.activo
            };
            var codeBuild = "";

            // construllendo codigo
            if (pre.nivel_concepto == 1)
            {
                codeBuild = pre.cod_concepto + "000000";
            }
            else if (pre.nivel_concepto == 2)
            {
                codeBuild = cod_padre.Substring(0, 2) + pre.cod_concepto + "0000";
            }
            else if (pre.nivel_concepto == 3)
            {
                codeBuild = cod_padre.Substring(0, 4) + pre.cod_concepto + "00";
            }
            else if (pre.nivel_concepto == 4)
            {
                codeBuild = cod_padre.Substring(0, 6) + pre.cod_concepto;
            }

            render.cod_concepto = codeBuild;


            // flags
            if (pre.id_tipo_concepto != null && pre.id_tipo_concepto != 0)
            {
                render.id_tipo_concepto = pre.id_tipo_concepto;
            }

            if (pre.id_naturaleza_concepto != null && pre.id_naturaleza_concepto != 0)
            {
                render.id_naturaleza_concepto = pre.id_naturaleza_concepto;
            }

            return render;
        }

        [HttpPost]
        public IHttpActionResult actualizarEstado(concepto concepto)
        {
            if (ModelState.IsValid)
            {
                var conceptoExiste = dbContext.concepto.Count(c => c.id_concepto == concepto.id_concepto) > 0;                
                if (conceptoExiste)
                {                    
                    dbContext.Entry(concepto).State = EntityState.Modified;
                    dbContext.SaveChangesAsync();
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
        public IHttpActionResult actualizarConcepto(concepto concepto)
        {
            if (ModelState.IsValid)
            {
                var conceptoAnt = dbContext.concepto.FirstOrDefault(h => h.id_concepto == concepto.id_concepto);
                var conceptoExiste = dbContext.concepto.Count(c => c.id_concepto == concepto.id_concepto) > 0;
                if (conceptoExiste)
                {
                    DateTime fecha = DateTime.Now;
                    concepto.fecha_actualizacion = fecha;
                    if (conceptoAnt != null)
                        dbContext.Entry(conceptoAnt).State = EntityState.Detached;
                    dbContext.Entry(concepto).State = EntityState.Modified;
                    dbContext.SaveChangesAsync();
                    insertarLog(conceptoAnt, concepto);
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
            List<concepto_formato> conceptoFormatos = formatos.concepto_formato.Where(c => c.id_concepto == formatoA.concepto).ToList();
            DateTime fecha = DateTime.Now;
            var respuesta = "";

            foreach (var formato in formatoA.formatos)
            {
                if (!formatos.concepto_formato.Any(cf => cf.id_formato == formato.id_formato && cf.id_concepto == formatoA.concepto))
                {
                    try
                    {
                        var nuevoFormato = new concepto_formato()
                        {
                            id_formato = formato.id_formato,
                            id_concepto = formatoA.concepto,
                            flag_concepto_remunerado = 0,
                            fecha_creacion = fecha,
                            usuario_creacion = formatoA.usuario,
                            activo = true
                        };

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


            // alistar los campos que vamos a quitar
            foreach (var formato in conceptoFormatos)
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


        [HttpPost]
        public IHttpActionResult añadirformatos(FormatoActualizacion formatoA)
        {
            CREG_Analitica_AWSEntities formatos = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            var respuesta = "";

            foreach (var formato in formatoA.formatos)
            {
                if (formatos.concepto.Any(f => f.id_concepto == formatoA.concepto))
                {
                    try
                    {
                        var nuevoFormato = new concepto_formato()
                        {
                            id_formato = formato.id_formato,
                            id_concepto = formatoA.concepto,
                            flag_concepto_remunerado = 0,
                            fecha_creacion = fecha,
                            usuario_creacion = formatoA.usuario,
                            activo = true
                        };

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


        private bool asignarFormato(concepto_formato conceptoFormato)
        {
            try
            {
                using (CREG_Analitica_AWSEntities fEntities = new CREG_Analitica_AWSEntities())
                {
                    fEntities.concepto_formato.Add(conceptoFormato);
                    fEntities.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                var his = dbContext.concepto_formato.FirstOrDefault(h => h.id_concepto_formato == conceptoFormato.id_concepto_formato);
                if (his != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "concepto_formato";
                        log.id_registro_tabla = (long) conceptoFormato.id_concepto_formato;
                        log.columna_afectada = "id_concepto_formato";
                        log.valor_antiguo = "";
                        log.valor_nuevo = conceptoFormato.id_concepto_formato + "";
                        log.fecha = conceptoFormato.fecha_creacion;
                        log.usuario = conceptoFormato.usuario_creacion;
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

        private bool removerFormato(concepto_formato coneptoFormato)
        {
            try
            {
                using (CREG_Analitica_AWSEntities cfEntities = new CREG_Analitica_AWSEntities())
                {
                    cfEntities.concepto_formato.Attach(coneptoFormato);
                    cfEntities.Entry(coneptoFormato).State = EntityState.Deleted;
                    cfEntities.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                var his = dbContext.concepto_formato.FirstOrDefault(h => h.id_concepto_formato == coneptoFormato.id_concepto_formato);
                if (his == null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "concepto_formato";
                        log.id_registro_tabla = (long) coneptoFormato.id_concepto_formato;
                        log.columna_afectada = "id_concepto_formato";
                        log.valor_antiguo = coneptoFormato.id_concepto_formato + ""; ;
                        log.valor_nuevo = "";
                        log.fecha = coneptoFormato.fecha_creacion;
                        log.usuario = coneptoFormato.usuario_creacion;
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
        public IHttpActionResult eliminarConcepto(int id)
        {

            var con = dbContext.concepto_formato.Find(id);
            if (con != null)
            {
                dbContext.concepto_formato.Remove(con);
                dbContext.SaveChanges();
                return Ok(con);
            }
            else
            {
                return NotFound();
            }

        }

        private bool insertarLog(concepto conceptoAntigua, concepto conceptoNueva)
        {
            //comparar cod concepto
            if (!conceptoAntigua.cod_concepto.Equals(conceptoNueva.cod_concepto))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "cod_concepto";
                    log.valor_antiguo = conceptoAntigua.cod_concepto + "";
                    log.valor_nuevo = conceptoNueva.cod_concepto + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar id concepto padre
            if (!conceptoAntigua.id_concepto_padre.Equals(conceptoNueva.id_concepto_padre))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "id_concepto_padre";
                    log.valor_antiguo = conceptoAntigua.id_concepto_padre + "";
                    log.valor_nuevo = conceptoNueva.id_concepto_padre + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar descripcion concepto
            if (!conceptoAntigua.descripcion_concepto.Equals(conceptoNueva.descripcion_concepto))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long) conceptoAntigua.id_concepto;
                    log.columna_afectada = "descripcion_concepto";
                    log.valor_antiguo = conceptoAntigua.descripcion_concepto + "";
                    log.valor_nuevo = conceptoNueva.descripcion_concepto + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar nivel concepto
            if (conceptoAntigua.nivel_concepto != conceptoNueva.nivel_concepto)
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "nivel_concepto";
                    log.valor_antiguo = conceptoAntigua.nivel_concepto + "";
                    log.valor_nuevo = conceptoNueva.nivel_concepto + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar tipo concepto
            if (conceptoAntigua.id_tipo_concepto != conceptoNueva.id_tipo_concepto)
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "id_tipo_concepto";
                    log.valor_antiguo = conceptoAntigua.id_tipo_concepto + "";
                    log.valor_nuevo = conceptoNueva.id_tipo_concepto + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar naturaleza concepto
            if (conceptoAntigua.id_naturaleza_concepto != conceptoNueva.id_naturaleza_concepto)
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "id_naturaleza_concepto";
                    log.valor_antiguo = conceptoAntigua.id_naturaleza_concepto + "";
                    log.valor_nuevo = conceptoNueva.id_naturaleza_concepto + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }


            // comparar flag_ref_normativa
            if (!conceptoAntigua.flag_ref_normativa.Equals(conceptoNueva.flag_ref_normativa))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "flag_ref_normativa";
                    log.valor_antiguo = conceptoAntigua.flag_ref_normativa + "";
                    log.valor_nuevo = conceptoNueva.flag_ref_normativa + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar concepto_cargado padre
            if (!conceptoAntigua.concepto_cargado.Equals(conceptoNueva.concepto_cargado))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "concepto_cargado";
                    log.valor_antiguo = conceptoAntigua.concepto_cargado + "";
                    log.valor_nuevo = conceptoNueva.concepto_cargado + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar activo
            if (!conceptoAntigua.activo.Equals(conceptoNueva.activo))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "concepto";
                    log.id_registro_tabla = (long)conceptoAntigua.id_concepto;
                    log.columna_afectada = "activo";
                    log.valor_antiguo = conceptoAntigua.activo + "";
                    log.valor_nuevo = conceptoNueva.activo + "";
                    log.fecha = (DateTime)conceptoNueva.fecha_actualizacion;
                    log.usuario = conceptoNueva.usuario_creacion;
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
