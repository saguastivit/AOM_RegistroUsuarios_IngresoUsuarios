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
    
    public partial class tipo_accion
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public tipo_accion()
        {
            this.accion = new HashSet<accion>();
        }
    
        public decimal id_tipo_accion { get; set; }
        public string descripcion_tipo_accion { get; set; }
        public System.DateTime fecha_creacion { get; set; }
        public string usuario_creacion { get; set; }
        public Nullable<System.DateTime> fecha_actualizacion { get; set; }
        public string usuario_actualizacion { get; set; }
        public bool activo { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<accion> accion { get; set; }
    }
}
