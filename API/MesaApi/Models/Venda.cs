using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MesaApi.Models
{
    public class Venda

    {
        public int Id { get; set; }
        public DateTime data_da_venda { get; set; }
        public float Valor { get; set; }
        public string Metodo_de_pagamento { get; set; } = string.Empty;
        public string Lista_de_produtos_texto { get; set; } = string.Empty;
        [Required]
        public List<Produto> Lista_de_produtos { get; set; } = new();
    }


}
