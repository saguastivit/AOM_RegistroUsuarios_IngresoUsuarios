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
    
    public partial class actividad
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public actividad()
        {
            this.formato = new HashSet<formato>();
            this.empresa_actividad = new HashSet<empresa_actividad>();
        }
    
        public decimal id_actividad { get; set; }
        public string cod_actividad { get; set; }
        public string des_actividad { get; set; }
        public decimal id_servicio { get; set; }
        public System.DateTime fecha_creacion { get; set; }
        public string usuario_creacion { get; set; }
        public Nullable<System.DateTime> fecha_actualizacion { get; set; }
        public string usuario_actualizacion { get; set; }
        public bool activo { get; set; }
    
        public virtual servicio servicio { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<formato> formato { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<empresa_actividad> empresa_actividad { get; set; }
    }
}
