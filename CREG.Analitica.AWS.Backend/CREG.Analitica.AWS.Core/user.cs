//------------------------------------------------------------------------------
// <auto-generated>
//     Este código se generó a partir de una plantilla.
//
//     Los cambios manuales en este archivo pueden causar un comportamiento inesperado de la aplicación.
//     Los cambios manuales en este archivo se sobrescribirán si se regenera el código.
// </auto-generated>
//------------------------------------------------------------------------------

namespace CREG.Analitica.AWS.Core
{
    using System;
    using System.Collections.Generic;
    
    public partial class user
    {
        public long id_user { get; set; }
        public string usuario { get; set; }
        public string contrasena { get; set; }
        public string correo_electronico { get; set; }
        public Nullable<decimal> id_empresa { get; set; }
        public long id_rol { get; set; }
        public string nombre_persona { get; set; }
        public string identificacion_persona { get; set; }
        public bool activo { get; set; }
    
        public virtual empresa empresa { get; set; }
        public virtual role role { get; set; }
    }
}
