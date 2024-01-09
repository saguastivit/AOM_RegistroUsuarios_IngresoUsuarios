using CREG.Analitica.AWS.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace CREG.Analitica.AWS.API.Controllers
{
    public class EmpresaOracleController : ApiController
    {
        private EntitiesOracleCREG dbContext = new EntitiesOracleCREG();

        [Route("api/empresasOracle")]
        [HttpGet]
        public ResponseOracle Get()
        {
            List<V_EMPRE_APPAOM> listaEmpresas = new List<V_EMPRE_APPAOM>();
            List<empresa> listaEmpresasAgregadas = new List<empresa>();
            List<V_EMPRE_APPAOM> listaEmpresasNoAgregadas = new List<V_EMPRE_APPAOM>();
            using (EntitiesOracleCREG empresaEntities = new EntitiesOracleCREG())
            {
                //edcEntities.Configuration.LazyLoadingEnabled = false;
                try
                {
                    var empresas = empresaEntities.V_EMPRE_APPAOM.ToList();
                    DateTime fecha = DateTime.Now;
                    foreach (var empresa in empresas)
                    {
                        using (CREG_Analitica_AWSEntities empresaEntities2 = new CREG_Analitica_AWSEntities())
                        {
                            //empresaEntities.Configuration.LazyLoadingEnabled = false;
                            var emp = empresaEntities2.empresa.Any(e => e.cod_empresa == empresa.COD_EMPRESA || e.cod_sui_empresa == empresa.COD_SUI_EMPRESA.ToString() || e.nit_empresa.ToString() == empresa.NIT_EMPRESA.ToString());
                            if (!emp)
                            {
                                empresa objeto = new empresa();
                                objeto.cod_empresa = long.Parse(empresa.COD_EMPRESA.ToString());
                                objeto.nit_empresa = long.Parse(empresa.NIT_EMPRESA.ToString());
                                objeto.dv_nit_empresa = int.Parse(empresa.DIV_NIT_EMPRESA.ToString());
                                objeto.nombre_empresa = empresa.NOMBRE_EMPRESA;
                                objeto.sigla_empresa = empresa.SIGLA_EMPRESA;
                                objeto.cod_sui_empresa = empresa.COD_SUI_EMPRESA.ToString();
                                objeto.fecha_creacion = fecha;
                                objeto.usuario_creacion = "1";
                                objeto.activo = true;
                                try
                                {
                                    CREG_Analitica_AWSEntities empentities = new CREG_Analitica_AWSEntities();
                                    empentities.empresa.Add(objeto);
                                    empentities.SaveChanges();
                                }
                                catch (Exception e)
                                {
                                    var his = empresaEntities2.empresa.FirstOrDefault(h => h.nit_empresa == empresa.NIT_EMPRESA);
                                    if (his != null)
                                    {
                                        listaEmpresasAgregadas.Add(objeto);
                                    }
                                    else
                                    {
                                        listaEmpresasNoAgregadas.Add(empresa);
                                    }

                                }

                            }
                        }
                    }
                }
                catch (Exception e)
                {
                    return null;
                }
                
                ResponseOracle response = new ResponseOracle();
                response.listaEmpresasAgregadas = listaEmpresasAgregadas;
                response.listaEmpresasNoAgregadas = listaEmpresasNoAgregadas;
                return response;
            }
        }
    }

    public class ResponseOracle
    {
        //public List<V_EMPRE_APPAOM> listaEmpresas { get; set; }
        public List<empresa> listaEmpresasAgregadas { get; set; }
        public List<V_EMPRE_APPAOM> listaEmpresasNoAgregadas { get; set; }
    }
}