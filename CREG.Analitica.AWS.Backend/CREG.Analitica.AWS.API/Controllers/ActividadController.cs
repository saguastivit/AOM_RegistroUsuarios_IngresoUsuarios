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
    public class ActividadController : ApiController
    {

        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<actividad> Get()
        {

            using (CREG_Analitica_AWSEntities actividadEntities = new CREG_Analitica_AWSEntities())
            {
                //actividadEntities.Configuration.LazyLoadingEnabled = false;                
                return actividadEntities.actividad.Where(act => !act.cod_actividad.Equals("00")).ToList();
            }
        }

        [HttpGet]
        public IEnumerable<actividad> GetAll()
        {

            using (CREG_Analitica_AWSEntities actividadEntities = new CREG_Analitica_AWSEntities())
            {
                //actividadEntities.Configuration.LazyLoadingEnabled = false;                
                return actividadEntities.actividad.ToList();
            }
        }

        [HttpGet]
        public actividad Get(int id)
        {
            using (CREG_Analitica_AWSEntities actividadEntities = new CREG_Analitica_AWSEntities())
            {
                //actividadEntities.Configuration.LazyLoadingEnabled = false;
                return actividadEntities.actividad.FirstOrDefault(e => e.id_actividad == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarActividad([FromBody] actividad actividad)
        {
            CREG_Analitica_AWSEntities actividadEntities = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            actividad.fecha_creacion = fecha;
            try
            {
                if (ModelState.IsValid)
                {
                    dbContext.actividad.Add(actividad);
                    dbContext.SaveChanges();
                    Ok(actividad.id_actividad);
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception e)
            {
                var form = actividadEntities.actividad.FirstOrDefault(em => em.id_actividad == actividad.id_actividad);
                if (form != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "actividad";
                        log.id_registro_tabla = (long)actividad.id_actividad;
                        log.columna_afectada = "id_actividad";
                        log.valor_antiguo = "";
                        log.valor_nuevo = actividad.id_actividad + "";
                        log.fecha = actividad.fecha_creacion;
                        log.usuario = actividad.usuario_creacion;
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
            return Ok(actividad.id_actividad);
        }

        [HttpPost]
        public IHttpActionResult actualizarEstado(actividad actividad)
        {
            if (ModelState.IsValid)
            {
                var actividadExiste = dbContext.actividad.Count(a => a.id_actividad == actividad.id_actividad) > 0;
                if (actividadExiste)
                {
                    dbContext.Entry(actividad).State = EntityState.Modified;
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
        public IHttpActionResult actualizarActividad(actividad actividad)
        {
            if (ModelState.IsValid)
            {
                var actividadExiste = dbContext.actividad.Count(c => c.id_actividad == actividad.id_actividad) > 0;
                if (actividadExiste)
                {
                    DateTime fecha = DateTime.Now;
                    actividad.fecha_actualizacion = fecha;

                    dbContext.Entry(actividad).State = EntityState.Modified;
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

        [HttpDelete]
        public IHttpActionResult eliminarActividad(int id)
        {

            var act = dbContext.actividad.Find(id);
            if (act != null)
            {
                dbContext.actividad.Remove(act);
                dbContext.SaveChanges();
                return Ok(act);
            }
            else
            {
                return NotFound();
            }

        }

    }
}
