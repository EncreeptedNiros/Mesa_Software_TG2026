using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MesaApi.Models
{
    public class Pedido

    {
        public int Id { get; set; }
        public DateTime Data_da_venda { get; set; }
        [Required]
        public Produto Produto { get; set; } = new();
        public string NumeroMesa { get; set; } = string.Empty;
        public string Observacoes { get; set; } = string.Empty;
        public bool Status { get; set; }
    }


}
