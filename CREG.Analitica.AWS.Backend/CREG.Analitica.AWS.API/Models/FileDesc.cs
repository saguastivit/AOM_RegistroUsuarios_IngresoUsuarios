using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace CREG.Analitica.AWS.API.Models
{
    [DataContract]
    public class FileDesc
    {
        [DataMember]
        public string name { get; set; }
        [DataMember]
        public string path { get; set; }
        [DataMember]
        public long size { get; set; }
        [DataMember]
        public List<String> error { get; set; }
        [DataMember]
        public Boolean status { get; set; }
        public FileDesc(Boolean ok, string n, string p, long s, List<String> e)
        {
            status = ok;
            name = n;
            path = p;
            size = s;
            error = e;
        }
    }
}