using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    public class FormatoActualizacion
    {
        public int concepto { get; set; }

        public string usuario { get; set; }

        public List<formatoA> formatos { get; set; }
    }

    public class formatoA
    {
        public int id_formato { get; set; }

        public int id_edc_padre { get; set; }

    }
}