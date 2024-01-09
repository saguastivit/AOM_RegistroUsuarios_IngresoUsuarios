using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    public class RolePermiso
    {
        [DataMember]
        public long id_role { get; set; }
        [DataMember]
        public string nombre_rol { get; set; }
        [DataMember]
        public Boolean activo { get; set; }
        [DataMember]
        public long id_role_permiso { get; set; }
        [DataMember]
        public long id_permiso { get; set; }
        [DataMember]
        public string nombre_permiso { get; set; }

    }
}