using CREG.Analitica.AWS.API.Models;
using CREG.Analitica.AWS.Core;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CREG.Analitica.AWS.API.Controllers
{
    public class EmpresaController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<empresa> Get()
        {

            using (CREG_Analitica_AWSEntities empresaEntities = new CREG_Analitica_AWSEntities())
            {
                //empresaEntities.Configuration.LazyLoadingEnabled = false;
                return empresaEntities.empresa.Include(e => e.empresa_actividad).OrderBy(e => e.nombre_empresa).ToList();
            }
        }

        [HttpGet]
        public empresa Get(int id)
        {
            using (CREG_Analitica_AWSEntities empresaEntities = new CREG_Analitica_AWSEntities())
            {
                //empresaEntities.Configuration.LazyLoadingEnabled = false;
                return empresaEntities.empresa.FirstOrDefault(e => e.id_empresa == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarEmpresa([FromBody] empresa empresa)
        {
            CREG_Analitica_AWSEntities empresaEntities = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            try
            {
                if (ModelState.IsValid)
                {
                    empresa.fecha_creacion = fecha;
                    empresaEntities.empresa.Add(empresa);
                    empresaEntities.SaveChanges();
                    Ok(empresa.id_empresa);
                }
                else
                {
                    BadRequest();
                }
            }
            catch
            {
                var his = dbContext.empresa.FirstOrDefault(h => h.id_empresa == empresa.id_empresa);
                if (his != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "empresa";
                        log.id_registro_tabla = (long)empresa.id_empresa;
                        log.columna_afectada = "id_empresa";
                        log.valor_antiguo = "";
                        log.valor_nuevo = empresa.id_empresa + "";
                        log.fecha = empresa.fecha_creacion;
                        log.usuario = empresa.usuario_creacion;
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
                    BadRequest();
                }
            }

            return Ok(empresa.id_empresa);
        }

        [HttpPost]
        public IHttpActionResult actualizarEmpresa(empresa empresa)
        {
            if (ModelState.IsValid)
            {
                var empresaAnt = dbContext.empresa.FirstOrDefault(h => h.id_empresa == empresa.id_empresa);
                var empresaExiste = dbContext.empresa.Count(c => c.id_empresa == empresa.id_empresa) > 0;
                if (empresaExiste)
                {
                    DateTime fecha = DateTime.Now;
                    empresa.fecha_actualizacion = fecha;
                    if (empresaAnt != null)
                        dbContext.Entry(empresaAnt).State = EntityState.Detached;
                    dbContext.Entry(empresa).State = EntityState.Modified;
                    dbContext.SaveChangesAsync();
                    insertarLog(empresaAnt,empresa);
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
        public IHttpActionResult actualizarActividates(ActividadActualizacion actividadA)
        {
            CREG_Analitica_AWSEntities empresas = new CREG_Analitica_AWSEntities();
            List<empresa_actividad> actividadesEmpresa = empresas.empresa_actividad.Where(c => c.id_empresa == actividadA.empresa).ToList();
            DateTime fecha = DateTime.Now;
            var respuesta = "";

            foreach (var actividad in actividadA.actividades)
            {
                if (!empresas.empresa_actividad.Any(ae => ae.id_actividad == actividad.id_actividad && ae.id_empresa == actividadA.empresa))
                {
                    try
                    {
                        var nuevaActividad = new empresa_actividad()
                        {
                            id_empresa = actividadA.empresa,
                            id_actividad = actividad.id_actividad,
                            fecha_creacion = fecha,
                            usuario_creacion = actividadA.usuario,
                            activo = true
                        };

                        var respuestaActividad = asignarActividad(nuevaActividad);

                        if (respuestaActividad)
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
            foreach (var actividad in actividadesEmpresa)
            {
                if (!actividadA.actividades.Any(act => act.id_actividad == actividad.id_actividad))
                {
                    var respuestaActividad = removerActividad(actividad);

                    if (respuestaActividad)
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
        public IHttpActionResult añadirActividates(ActividadActualizacion actividadA)
        {
            CREG_Analitica_AWSEntities empresas = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            var respuesta = "";

            foreach (var actividad in actividadA.actividades)
            {
                if (empresas.empresa.Any(e => e.id_empresa == actividadA.empresa))
                {
                    try
                    {
                        var nuevaActividad = new empresa_actividad()
                        {
                            id_empresa = actividadA.empresa,
                            id_actividad = actividad.id_actividad,
                            fecha_creacion = fecha,
                            usuario_creacion = actividadA.usuario,
                            activo = true
                        };

                        var respuestaActividad = asignarActividad(nuevaActividad);

                        if (respuestaActividad)
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


        private bool asignarActividad(empresa_actividad empresaActividad)
        {
            try
            {
                using (CREG_Analitica_AWSEntities aeEntities = new CREG_Analitica_AWSEntities())
                {
                    aeEntities.empresa_actividad.Add(empresaActividad);
                    aeEntities.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                var his = dbContext.empresa_actividad.FirstOrDefault(h => h.id_empresa_actividad == empresaActividad.id_empresa_actividad);
                if (his != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "empresa_actividad";
                        log.id_registro_tabla = (long) empresaActividad.id_empresa_actividad;
                        log.columna_afectada = "id_empresa_actividad";
                        log.valor_antiguo = "";
                        log.valor_nuevo = empresaActividad.id_empresa_actividad + "";
                        log.fecha = empresaActividad.fecha_creacion;
                        log.usuario = empresaActividad.usuario_creacion;
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

        private bool removerActividad(empresa_actividad empresaActividad)
        {
            try
            {
                using (CREG_Analitica_AWSEntities aeEntities = new CREG_Analitica_AWSEntities())
                {
                    aeEntities.empresa_actividad.Attach(empresaActividad);
                    aeEntities.Entry(empresaActividad).State = EntityState.Deleted;                   
                    aeEntities.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                var his = dbContext.empresa_actividad.FirstOrDefault(h => h.id_empresa_actividad == empresaActividad.id_empresa_actividad);
                if (his == null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "empresa_actividad";
                        log.id_registro_tabla = (long)empresaActividad.id_empresa_actividad;
                        log.columna_afectada = "id_empresa_actividad";
                        log.valor_antiguo = empresaActividad.id_empresa_actividad + ""; ;
                        log.valor_nuevo = "";
                        log.fecha = empresaActividad.fecha_creacion;
                        log.usuario = empresaActividad.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                        return true;
                    }
                    catch
                    {
                        return true;
                        NotFound();
                    }
                    //return true;
                }
                else
                {
                    throw new Exception(ex.InnerException.Message);
                    return false;
                }
            }
        }



        [HttpDelete]
        public IHttpActionResult eliminarEmpresa(int id)
        {

            var emp = dbContext.empresa.Find(id);
            if (emp != null)
            {
                dbContext.empresa.Remove(emp);
                dbContext.SaveChangesAsync();
                return Ok(emp);
            }
            else
            {
                return NotFound();
            }

        }


        private bool insertarLog(empresa empresaAntigua, empresa empresaNueva)
        {
            //comparar cod empresa
            if (!empresaAntigua.cod_empresa.Equals(empresaNueva.cod_empresa))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "empresa";
                    log.id_registro_tabla = (long) empresaAntigua.id_empresa;
                    log.columna_afectada = "cod_empresa";
                    log.valor_antiguo = empresaAntigua.cod_empresa + "";
                    log.valor_nuevo = empresaNueva.cod_empresa + "";
                    log.fecha = (DateTime) empresaNueva.fecha_actualizacion;
                    log.usuario = empresaNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar nit empresa
            if (!empresaAntigua.nit_empresa.Equals(empresaNueva.nit_empresa))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "empresa";
                    log.id_registro_tabla = (long)empresaAntigua.id_empresa;
                    log.columna_afectada = "nit_empresa";
                    log.valor_antiguo = empresaAntigua.nit_empresa + "";
                    log.valor_nuevo = empresaNueva.nit_empresa + "";
                    log.fecha = (DateTime)empresaNueva.fecha_actualizacion;
                    log.usuario = empresaNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar nombre empresa
            if (!empresaAntigua.nombre_empresa.Equals(empresaNueva.nombre_empresa))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "empresa";
                    log.id_registro_tabla = (long)empresaAntigua.id_empresa;
                    log.columna_afectada = "nombre_empresa";
                    log.valor_antiguo = empresaAntigua.nombre_empresa + "";
                    log.valor_nuevo = empresaNueva.nombre_empresa + "";
                    log.fecha = (DateTime)empresaNueva.fecha_actualizacion;
                    log.usuario = empresaNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar dv nit empresa
            if (!empresaAntigua.dv_nit_empresa.Equals(empresaNueva.dv_nit_empresa))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "empresa";
                    log.id_registro_tabla = (long)empresaAntigua.id_empresa;
                    log.columna_afectada = "dv_nit_empresa";
                    log.valor_antiguo = empresaAntigua.dv_nit_empresa + "";
                    log.valor_nuevo = empresaNueva.dv_nit_empresa + "";
                    log.fecha = (DateTime)empresaNueva.fecha_actualizacion;
                    log.usuario = empresaNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar cod_sui empresa
            if (!empresaAntigua.cod_sui_empresa.Equals(empresaNueva.cod_sui_empresa))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "empresa";
                    log.id_registro_tabla = (long)empresaAntigua.id_empresa;
                    log.columna_afectada = "cod_sui_empresa";
                    log.valor_antiguo = empresaAntigua.cod_sui_empresa + "";
                    log.valor_nuevo = empresaNueva.cod_sui_empresa + "";
                    log.fecha = (DateTime)empresaNueva.fecha_actualizacion;
                    log.usuario = empresaNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }

            // comparar sigla empresa
            if (!empresaAntigua.sigla_empresa.Equals(empresaNueva.sigla_empresa))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "empresa";
                    log.id_registro_tabla = (long)empresaAntigua.id_empresa;
                    log.columna_afectada = "sigla_empresa";
                    log.valor_antiguo = empresaAntigua.sigla_empresa + "";
                    log.valor_nuevo = empresaNueva.sigla_empresa + "";
                    log.fecha = (DateTime)empresaNueva.fecha_actualizacion;
                    log.usuario = empresaNueva.usuario_creacion;
                    logentities.log_auditoria.Add(log);
                    logentities.SaveChanges();
                }
                catch
                {
                    NotFound();
                }
            }


            // comparar activo empresa
            if (!empresaAntigua.activo.Equals(empresaNueva.activo))
            {
                try
                {
                    CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                    log_auditoria log = new log_auditoria();
                    log.tabla = "empresa";
                    log.id_registro_tabla = (long)empresaAntigua.id_empresa;
                    log.columna_afectada = "activo";
                    log.valor_antiguo = empresaAntigua.activo + "";
                    log.valor_nuevo = empresaNueva.activo + "";
                    log.fecha = (DateTime)empresaNueva.fecha_actualizacion;
                    log.usuario = empresaNueva.usuario_creacion;
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
