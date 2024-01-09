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
    public class ConceptoFormatoController : ApiController
    {

        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<concepto_formato> Get()
        {

            using (CREG_Analitica_AWSEntities conceptoFormatoEntities = new CREG_Analitica_AWSEntities())
            {
                //conceptoFormatoEntities.Configuration.LazyLoadingEnabled = false;
                return conceptoFormatoEntities.concepto_formato.ToList();
            }
        }

        [HttpGet]
        public concepto_formato Get(int id)
        {
            using (CREG_Analitica_AWSEntities conceptoFormatoEntities = new CREG_Analitica_AWSEntities())
            {
                //conceptoFormatoEntities.Configuration.LazyLoadingEnabled = false;
                return conceptoFormatoEntities.concepto_formato.FirstOrDefault(e => e.id_concepto_formato == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarConceptoFormato([FromBody] concepto_formato concepto_formato)
        {
            CREG_Analitica_AWSEntities formatoEntities = new CREG_Analitica_AWSEntities();
            try
            {
                if (ModelState.IsValid)
                {
                    dbContext.concepto_formato.Add(concepto_formato);
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
                var form = formatoEntities.concepto_formato.FirstOrDefault(em => em.id_concepto_formato == concepto_formato.id_concepto_formato);
                if (form != null)
                {
                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "concepto_formato";
                        log.id_registro_tabla = (long)concepto_formato.id_concepto_formato;
                        log.columna_afectada = "id_concepto_formato";
                        log.valor_antiguo = "";
                        log.valor_nuevo = concepto_formato.id_concepto_formato + "";
                        log.fecha = concepto_formato.fecha_creacion;
                        log.usuario = concepto_formato.usuario_creacion;
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {

                    }
                    return Ok(concepto_formato);

                }
                else
                {
                    return BadRequest();
                }

            }
            return Ok(concepto_formato);
        }

        [HttpPut]
        public IHttpActionResult actualizarConceptoFormato(int id, [FromBody] concepto_formato concepto_formato)
        {
            if (ModelState.IsValid)
            {
                var conceptoExiste = dbContext.concepto_formato.Count(c => c.id_concepto_formato == id) > 0;
                if (conceptoExiste)
                {
                    dbContext.Entry(concepto_formato).State = EntityState.Modified;
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
        public IHttpActionResult eliminarConceptoFormato(int id)
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
    }
}
