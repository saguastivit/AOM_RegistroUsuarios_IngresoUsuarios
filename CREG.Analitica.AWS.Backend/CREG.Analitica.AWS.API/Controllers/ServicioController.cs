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
    public class ServicioController : ApiController
    {

        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<servicio> Get()
        {

            using (CREG_Analitica_AWSEntities servicioEntities = new CREG_Analitica_AWSEntities())
            {
                //servicioEntities.Configuration.LazyLoadingEnabled = false;
                return servicioEntities.servicio.ToList();
            }
        }

        [HttpGet]
        public servicio Get(int id)
        {
            using (CREG_Analitica_AWSEntities servicioEntities = new CREG_Analitica_AWSEntities())
            {
                servicioEntities.Configuration.LazyLoadingEnabled = false;
                return servicioEntities.servicio.FirstOrDefault(e => e.id_servicio == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarServicio([FromBody] servicio servicio)
        {
            CREG_Analitica_AWSEntities servicioEntities = new CREG_Analitica_AWSEntities();
            try
            {
                if (ModelState.IsValid)
                {
                    dbContext.servicio.Add(servicio);
                    dbContext.SaveChanges();

                    //return Ok(empresa);
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception e)
            {
                var form = servicioEntities.servicio.FirstOrDefault(em => em.id_servicio == servicio.id_servicio);
                if (form != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "servicio";
                        log.id_registro_tabla = (long)servicio.id_servicio;
                        log.columna_afectada = "id_servicio";
                        log.valor_antiguo = "";
                        log.valor_nuevo = servicio.id_servicio + "";
                        log.fecha = servicio.fecha_creacion;
                        log.usuario = servicio.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {

                    }
                    return Ok(servicio);

                }
                else
                {
                    return BadRequest();
                }

            }
            return Ok(servicio);
        }

        [HttpPut]
        public IHttpActionResult actualizarServicio(int id, [FromBody] servicio servicio)
        {
            if (ModelState.IsValid)
            {
                var servicioExiste = dbContext.servicio.Count(c => c.id_servicio == id) > 0;
                if (servicioExiste)
                {
                    dbContext.Entry(servicio).State = EntityState.Modified;
                    dbContext.SaveChanges();
                    return Ok();
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
        public IHttpActionResult eliminarServicio(int id)
        {

            var ser = dbContext.servicio.Find(id);
            if (ser != null)
            {
                dbContext.servicio.Remove(ser);
                dbContext.SaveChanges();
                return Ok(ser);
            }
            else
            {
                return NotFound();
            }

        }

    }
}
