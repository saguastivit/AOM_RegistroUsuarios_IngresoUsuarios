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
    public class TipoConceptoController : ApiController
    {

        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<tipo_concepto> Get()
        {

            using (CREG_Analitica_AWSEntities tipo_conceptoEntities = new CREG_Analitica_AWSEntities())
            {
                //tipo_conceptoEntities.Configuration.LazyLoadingEnabled = false;
                return tipo_conceptoEntities.tipo_concepto.ToList();
            }
        }

        [HttpGet]
        public tipo_concepto Get(int id)
        {
            using (CREG_Analitica_AWSEntities tipo_conceptoEntities = new CREG_Analitica_AWSEntities())
            {
                tipo_conceptoEntities.Configuration.LazyLoadingEnabled = false;
                return tipo_conceptoEntities.tipo_concepto.FirstOrDefault(e => e.id_tipo_concepto == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarTipoConcepto([FromBody] tipo_concepto tipo_concepto)
        {
            if (ModelState.IsValid)
            {
                dbContext.tipo_concepto.Add(tipo_concepto);
                dbContext.SaveChanges();

                return Ok(tipo_concepto);
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPut]
        public IHttpActionResult actualizartipoConcepto(int id, [FromBody] tipo_concepto tipo_concepto)
        {
            if (ModelState.IsValid)
            {
                var tipo_conceptoExiste = dbContext.tipo_concepto.Count(c => c.id_tipo_concepto == id) > 0;
                if (tipo_conceptoExiste)
                {
                    dbContext.Entry(tipo_concepto).State = EntityState.Modified;
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
        public IHttpActionResult eliminarTipoConcepto(int id)
        {

            var tcon = dbContext.tipo_concepto.Find(id);
            if (tcon != null)
            {
                dbContext.tipo_concepto.Remove(tcon);
                dbContext.SaveChanges();
                return Ok(tcon);
            }
            else
            {
                return NotFound();
            }

        }

    }
}
