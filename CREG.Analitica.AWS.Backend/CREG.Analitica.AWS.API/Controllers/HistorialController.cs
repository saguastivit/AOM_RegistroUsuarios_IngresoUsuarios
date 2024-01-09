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
    public class HistorialController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();

        [HttpGet]
        public IEnumerable<historial_aom> get()
        {
            using (CREG_Analitica_AWSEntities historialentities = new CREG_Analitica_AWSEntities())
            {
                historialentities.Configuration.LazyLoadingEnabled = false;
                return historialentities.historial_aom.ToList();
            }
        }

        [HttpGet]
        public historial_aom Get(int id)
        {
            using (CREG_Analitica_AWSEntities historialentities = new CREG_Analitica_AWSEntities())
            {
                historialentities.Configuration.LazyLoadingEnabled = false;
                return historialentities.historial_aom.FirstOrDefault(e => e.id_historial_aom == id);
            }
        }

        [HttpPost]
        public IHttpActionResult agregarHistorialAOM([FromBody] historial_aom historial_aom)
        {
            if (ModelState.IsValid)
            {
                dbContext.historial_aom.Add(historial_aom);
                dbContext.SaveChanges();

                return Ok(historial_aom);
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPut]
        public IHttpActionResult actualizarHistorialAOM(int id, [FromBody] historial_aom historial_aom)
        {
            if (ModelState.IsValid)
            {
                var historial_aomExiste = dbContext.historial_aom.Count(c => c.id_historial_aom == id) > 0;
                if (historial_aomExiste)
                {
                    dbContext.Entry(historial_aom).State = EntityState.Modified;
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
        public IHttpActionResult eliminarHistorialAOM(int id)
        {

            var hAOM = dbContext.historial_aom.Find(id);
            if (hAOM != null)
            {
                dbContext.historial_aom.Remove(hAOM);
                dbContext.SaveChanges();
                return Ok(hAOM);
            }
            else
            {
                return NotFound();
            }

        }

    }
}
