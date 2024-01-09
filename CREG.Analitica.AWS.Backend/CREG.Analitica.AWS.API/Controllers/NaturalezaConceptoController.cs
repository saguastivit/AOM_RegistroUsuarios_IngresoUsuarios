using CREG.Analitica.AWS.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CREG.Analitica.AWS.API.Controllers
{
    public class NaturalezaConceptoController : ApiController
    {
        [HttpGet]
        public IEnumerable<naturaleza_concepto> Get()
        {

            using (CREG_Analitica_AWSEntities naturaleza_conceptoEntities = new CREG_Analitica_AWSEntities())
            {
                //tipo_conceptoEntities.Configuration.LazyLoadingEnabled = false;
                return naturaleza_conceptoEntities.naturaleza_concepto.ToList();
            }
        }
    }
}
