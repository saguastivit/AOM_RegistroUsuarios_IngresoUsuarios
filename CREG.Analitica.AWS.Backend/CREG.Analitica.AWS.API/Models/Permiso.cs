using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    public class Permiso
    {
        [DataMember]
        public int id_role_permiso { get; set; }
        [DataMember]
        public int id_permiso { get; set; }
        [DataMember]
        public string nombre_permiso { get; set; }

    }
}