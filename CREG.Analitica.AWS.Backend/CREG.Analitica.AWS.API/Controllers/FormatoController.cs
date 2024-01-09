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
    public class FormatoController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();
        
        [HttpGet]
        public IEnumerable<formato> Get()
        {

            using (CREG_Analitica_AWSEntities formatoEntities = new CREG_Analitica_AWSEntities())
            {
                //formatoEntities.Configuration.LazyLoadingEnabled = false;
                //return formatoEntities.formato.Where(f => f.tipo_formato != 1).ToList();
                return formatoEntities.formato.ToList();
            }
        }

        [HttpGet]
        public formato Get(int id)
        {
            using (CREG_Analitica_AWSEntities formatoEntities = new CREG_Analitica_AWSEntities())
            {
                formatoEntities.Configuration.LazyLoadingEnabled = false;
                return formatoEntities.formato.FirstOrDefault(e => e.id_formato == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarFormato([FromBody] formato formato)
        {
            CREG_Analitica_AWSEntities formatoEntities = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            formato.fecha_creacion = fecha;
            try
            {
                if (ModelState.IsValid)
                {
                    dbContext.formato.Add(formato);
                    dbContext.SaveChanges();
                    Ok(formato.id_formato);
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception e)
            {
                var form = formatoEntities.formato.FirstOrDefault(em => em.id_formato == formato.id_formato);
                if (form != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "formato";
                        log.id_registro_tabla = (long)formato.id_formato;
                        log.columna_afectada = "id_formato";
                        log.valor_antiguo = "";
                        log.valor_nuevo = formato.id_formato + "";
                        log.fecha = formato.fecha_creacion;
                        log.usuario = formato.usuario_creacion;
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
            return Ok(formato.id_formato);

        }

        [HttpPost]
        public IHttpActionResult actualizarEstado(formato formato)
        {
            if (ModelState.IsValid)
            {
                var formatoExiste = dbContext.formato.Count(f => f.id_formato == formato.id_formato) > 0;
                if (formatoExiste)
                {
                    dbContext.Entry(formato).State = EntityState.Modified;
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
        public IHttpActionResult actualizarFormato(formato formato)
        {
            if (ModelState.IsValid)
            {
                var formatoExiste = dbContext.formato.Count(c => c.id_formato == formato.id_formato) > 0;
                if (formatoExiste)
                {
                    DateTime fecha = DateTime.Now;
                    formato.fecha_actualizacion = fecha;

                    dbContext.Entry(formato).State = EntityState.Modified;
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
        public IHttpActionResult eliminarFormato(int id)
        {

            var frm = dbContext.formato.Find(id);
            if (frm != null)
            {
                dbContext.formato.Remove(frm);
                dbContext.SaveChanges();
                return Ok(frm);
            }
            else
            {
                return NotFound();
            }

        }
              
    }
}
