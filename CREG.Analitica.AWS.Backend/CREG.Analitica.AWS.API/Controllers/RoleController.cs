using CREG.Analitica.AWS.API.Models;
using CREG.Analitica.AWS.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace CREG.Analitica.AWS.API.Controllers
{
    public class RoleController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();
        private String key = "CREG2020";

        [HttpGet]
        public List<RolePermiso> Get(int id)
        {
            using (CREG_Analitica_AWSEntities roleEntities = new CREG_Analitica_AWSEntities())
            {
   

                var consulta = (from datos in roleEntities.role
                               join pr in roleEntities.role_permiso on datos.id_role equals pr.id_role
                               where datos.id_role.Equals(id)
                               select new RolePermiso
                               {
                                   id_role = datos.id_role,
                                   nombre_rol = datos.nombre_rol,
                                   activo = datos.activo,
                                   id_role_permiso = pr.id_role_permiso,
                                   id_permiso = pr.id_permiso,
                                   nombre_permiso = pr.permiso.desc_permiso
                               }).ToList();

                if (consulta.Count() == 0)
                {
                    return null;
                }
                else
                {
                    return consulta;
                }

            }
        }


        [HttpGet]
        public IEnumerable<role> getAll()
        {
            using (CREG_Analitica_AWSEntities userEntities = new CREG_Analitica_AWSEntities())
            {
                //actividadEntities.Configuration.LazyLoadingEnabled = false;
                return userEntities.role.ToList();
            }
        }
    }
}