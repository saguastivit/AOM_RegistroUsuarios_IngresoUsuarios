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
    
    public partial class accion
    {
        public decimal id_accion { get; set; }
        public decimal id_empresa { get; set; }
        public decimal id_tipo_accion { get; set; }
        public System.DateTime fecha_creacion { get; set; }
        public string usuario_creacion { get; set; }
        public Nullable<System.DateTime> fecha_actualizacion { get; set; }
        public string usuario_actualizacion { get; set; }
        public bool activo { get; set; }
    
        public virtual empresa empresa { get; set; }
        public virtual tipo_accion tipo_accion { get; set; }
    }
}
