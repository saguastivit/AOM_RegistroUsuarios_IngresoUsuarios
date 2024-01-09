using CREG.Analitica.AWS.API.Models;
using CREG.Analitica.AWS.Core;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Http;

namespace CREG.Analitica.AWS.API.Controllers
{
    public class UserController : ApiController
    {
        private CREG_Analitica_AWSEntities dbContext = new CREG_Analitica_AWSEntities();
        private string genericPass = "creg2021generic";

        [HttpGet]
        public IEnumerable<user> getAll()
        {
            using (CREG_Analitica_AWSEntities userEntities = new CREG_Analitica_AWSEntities())
            {
                //actividadEntities.Configuration.LazyLoadingEnabled = false;
                return userEntities.user.ToList();
            }
        }

        [HttpPost]
        public IHttpActionResult Login([FromBody] UserLogin user)
        {
            try
            {
                using (CREG_Analitica_AWSEntities userEntities = new CREG_Analitica_AWSEntities())
                {
                    //empresaEntities.Configuration.LazyLoadingEnabled = false;
                    var usuario = user.user;
                    var pass = encode(user.pass);
                    var u = userEntities.user.FirstOrDefault(e => e.usuario == usuario && e.contrasena == pass);

                    if (u != null)
                    {
                        if (u.activo)
                        {
                            var role = userEntities.role.FirstOrDefault(i => i.id_role == u.id_rol);
                            if (role != null)
                            {
                                u.role = role;
                            }
                            return Ok(u);
                        }
                        else
                        {
                            return Ok("firstTime");
                        }


                    }
                    else
                    {
                        return NotFound();
                    }
                }
            }
            catch (Exception)
            {
                return BadRequest();
            }

          
        }

        public static string decode(string pass)
        {
            byte[] encodeDataAsBytes = System.Convert.FromBase64String(pass);
            string passAns = System.Text.ASCIIEncoding.ASCII.GetString(encodeDataAsBytes);
            return passAns;
        }

        public static string encode(string pass)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(pass);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        [HttpPost]
        public string updatePassword([FromBody] UserRecover user)
        {
            using (CREG_Analitica_AWSEntities userEntities = new CREG_Analitica_AWSEntities())
            {
                //empresaEntities.Configuration.LazyLoadingEnabled = false;
                var usuario = decode(user.user.Replace('&', '=') );
                var pass = encode(user.pass);
                var u = userEntities.user.FirstOrDefault(e => e.usuario == usuario);

                if (u != null)
                {
                    u.contrasena = pass;
                    u.activo = true;
                    dbContext.Entry(u).State = EntityState.Modified;
                    dbContext.SaveChangesAsync();                   
                    return "ok";
                }
                else
                {
                    return "Usuarios no existen";
                }

            }
        }


        [HttpPost]
        public string recoverPassword([FromBody] UserRecover nuser)
        {
            string codeuser = encode(nuser.user).Replace('=', '&');
            string url = "http://localhost:4200//CREG-UI/#/cambiarCredencial/" + codeuser;

            using (CREG_Analitica_AWSEntities userEntities = new CREG_Analitica_AWSEntities())
            {
                //empresaEntities.Configuration.LazyLoadingEnabled = false; 
                var u = userEntities.user.FirstOrDefault(e => e.usuario == nuser.user);

                if (u != null)
                {
                    var message = new MailMessage
                    {
                        Subject = "Recuperación de contraseña",
                        Body = "Para poder reestablecer su contraseña debe acceder al siguiente enlace " + url,
                        IsBodyHtml = true
                    };

                    message.From = new MailAddress("drodriguez@creg.gov.co", "APP CREG");
                    message.To.Add(u.correo_electronico);


                    var client = new SmtpClient
                    {
                        //EnableSsl = true,//Si es SSL
                        TargetName = "STARTTLS/smtp.office365.com",
                        DeliveryMethod = SmtpDeliveryMethod.Network
                    };
                    try{
                        client.Send(message);
                        message.Dispose();
                        client.Dispose();
                        return "ok";
                    }
                    catch(Exception e)
                    {
                        return "Error al enviar correo";
                    }
                    
                }
                else
                {
                    return "Usuario no existe";
                }

            }
        }

        [HttpGet]
        public IEnumerable<user> Get()
        {

            using (CREG_Analitica_AWSEntities userEntities = new CREG_Analitica_AWSEntities())
            {
                
                return userEntities.user.Include(e => e.id_rol).ToList();
            }
        }

        [HttpPost]
        public IHttpActionResult agregarUser([FromBody] user user )
        {
            CREG_Analitica_AWSEntities userEntities = new CREG_Analitica_AWSEntities();
            DateTime fecha = DateTime.Now;
            
            string passCode = encode(genericPass);
            user.contrasena = encode(passCode);
            user.activo = false;
            
            try
            {
                
                if (ModelState.IsValid)
                {                   
                    userEntities.user.Add(user);
                    userEntities.SaveChanges();
                    return Ok("ok");
                }
                else
                {
                    BadRequest();
                }
            }
            catch(Exception e)
            {
                var form = userEntities.user.FirstOrDefault(em => em.id_user == user.id_user);
                if (form != null)
                {

                    // correo de confirmacion de usuario nuevo
                    var message = new MailMessage
                    {
                        Subject = "Creación de usuario",
                        Body = "<div><h3>Usuario creado</h3><p> Su usuario fue creado, para ingresar por primera vez favor cambiar la contraseña,</p><br>" +
                               "<p>para su primer ingreso utilice las siguientes credenciales.</p><br><br><p>Usuario    : " + form.usuario + "</p><p>Contraseña : " + genericPass + " </p>" +
                                "</div>",
                        IsBodyHtml = true
                    };

                    message.From = new MailAddress("drodriguez@creg.gov.co", "APP CREG");
                    message.To.Add(form.correo_electronico);


                    var client = new SmtpClient
                    {
                        //EnableSsl = true,//Si es SSL
                        TargetName = "STARTTLS/smtp.office365.com",
                        DeliveryMethod = SmtpDeliveryMethod.Network
                    };
                    try
                    {
                        client.Send(message);
                        message.Dispose();
                        client.Dispose();
                    }
                    catch (Exception)
                    {
                        System.Console.WriteLine("correo electronico no  enviado");
                    }


                    try
                    {
                        CREG_Analitica_AWSEntities logentities = new CREG_Analitica_AWSEntities();
                        log_auditoria log = new log_auditoria();
                        log.tabla = "user";
                        log.id_registro_tabla = (long)user.id_user;
                        log.columna_afectada = "id_user";
                        log.valor_antiguo = "";
                        log.valor_nuevo = user.id_user + "";
                        log.fecha = fecha;
                        log.usuario = "1";
                        logentities.log_auditoria.Add(log);
                        logentities.SaveChanges();
                    }
                    catch
                    {
                        return Ok("ok");
                    }
                }
                else
                {
                    return BadRequest();
                }
            }

            return Ok("ok");
        }


        [HttpPost]
        public IHttpActionResult actualizarUser(user user)
        {
            if (ModelState.IsValid)
            {
                var userAnt = dbContext.user.FirstOrDefault(h => h.id_user == user.id_user);
                var userExiste = dbContext.user.Count(c => c.id_user == user.id_user) > 0;
                if (userExiste)
                { 
                    if (userAnt != null)
                        dbContext.Entry(userAnt).State = EntityState.Detached;
                    dbContext.Entry(user).State = EntityState.Modified;
                    dbContext.SaveChangesAsync();
                    return Ok("ok");
                }
                else
                {
                    return NotFound();
                }

            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost]
        public IHttpActionResult actualizarEstado(user user)
        {
            if (ModelState.IsValid)
            {
                var userExiste = dbContext.user.Count(a => a.id_user == user.id_user) > 0;
                if (userExiste)
                {
                    dbContext.Entry(user).State = EntityState.Modified;
                    dbContext.SaveChangesAsync();
                    return Ok("ok");
                }
                else
                {
                    return NotFound();
                }

            }
            else
            {
                return BadRequest();
            }
        }

    }

}