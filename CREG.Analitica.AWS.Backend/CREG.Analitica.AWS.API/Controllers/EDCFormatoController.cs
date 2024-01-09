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
    public class EDCFormatoController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<edc_formato> Get()
        {

            using (CREG_Analitica_AWSEntities edc_formatoEntities = new CREG_Analitica_AWSEntities())
            {
                //edc_formatoEntities.Configuration.LazyLoadingEnabled = false;
                return edc_formatoEntities.edc_formato.ToList();
            }
        }

        [HttpGet]
        public edc_formato Get(int id)
        {
            using (CREG_Analitica_AWSEntities edc_formatoEntities = new CREG_Analitica_AWSEntities())
            {
                //edc_formatoEntities.Configuration.LazyLoadingEnabled = false;
                return edc_formatoEntities.edc_formato.FirstOrDefault(e => e.id_edc_formato == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarEDCFormato([FromBody] edc_formato edc_formato)
        {
            CREG_Analitica_AWSEntities edcEntities = new CREG_Analitica_AWSEntities();
            try
            {
                if (ModelState.IsValid)
                {
                    dbContext.edc_formato.Add(edc_formato);
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
                var form = edcEntities.edc_formato.FirstOrDefault(em => em.id_edc_formato == edc_formato.id_edc_formato);
                if (form != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "EDC_Formato";
                        log.id_registro_tabla = (long)edc_formato.id_edc_formato;
                        log.columna_afectada = "id_edc_formato";
                        log.valor_antiguo = "";
                        log.valor_nuevo = edc_formato.id_edc_formato + "";
                        log.fecha = edc_formato.fecha_creacion;
                        log.usuario = edc_formato.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {

                    }
                    return Ok(edc_formato);

                }
                else
                {
                    return BadRequest();
                }

            }
            return Ok(edc_formato);
        }

        [HttpPut]
        public IHttpActionResult actualizarEDCFormato(int id, [FromBody] edc_formato edc_formato)
        {
            if (ModelState.IsValid)
            {
                var edc_formatoExiste = dbContext.edc_formato.Count(c => c.id_edc_formato == id) > 0;
                if (edc_formatoExiste)
                {
                    dbContext.Entry(edc_formato).State = EntityState.Modified;
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
        public IHttpActionResult eliminarEDCFormato(int id)
        {

            var edcf = dbContext.edc_formato.Find(id);
            if (edcf != null)
            {
                dbContext.edc_formato.Remove(edcf);
                dbContext.SaveChanges();
                return Ok(edcf);
            }
            else
            {
                return NotFound();
            }

        }

    }
}
