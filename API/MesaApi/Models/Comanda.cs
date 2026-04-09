using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MesaApi.Models
{
    public class Comanda

    {
        public int Id { get; set; }
        public string Cliente { get; set; } = string.Empty;
        public DateTime Datadeabertura { get; set; }
        public DateTime Datadefechamento { get; set; }
        public Boolean Status { get; set; }
        public string Lista_ids_vendas { get; set; } = "[]";


    }
}
