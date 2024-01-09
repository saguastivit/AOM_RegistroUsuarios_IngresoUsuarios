using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    public class UserLogin
    {
        [DataMember]
        public string user { get; set; }
        [DataMember]
        public string pass { get; set; }

    }
    public class UserRecover
    {
        [DataMember]
        public string user { get; set; }
        [DataMember]
        public string pass { get; set; }
        [DataMember]
        public string confpass { get; set; }

    }
   

}


