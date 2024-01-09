using CREG.Analitica.AWS.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    public class ListaFormatos
    {
       public List<string> formatos { get; set; }
       public string empresa { get; set; }
    }

    public class RtaFormatos
    {
        public string formato { get; set; }
        public string anio { get; set; }
        public string empresa { get; set; }
        public historial_aom historial { get; set; }
        public Boolean status { get; set; }

        public RtaFormatos(string a, string b, string c, historial_aom d, Boolean e)
        {
            formato = a;
            anio = b;
            empresa = c;
            historial = d;
            status = e;
        }
    }
}