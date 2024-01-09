using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    public class ActividadActualizacion
    {
        public int empresa { get; set; }

        public string usuario { get; set; }

        public List<actividadA> actividades { get; set; }
    }

    public class actividadA
    {
        public int id_actividad { get; set; }

        public string des_actividad { get; set; }

    }
}