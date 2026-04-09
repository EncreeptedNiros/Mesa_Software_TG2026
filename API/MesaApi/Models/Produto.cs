using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MesaApi.Models
{
   public class Produto
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public decimal Custo { get; set; }

    public decimal Valor { get; set; }

    public string Receita { get; set; } = string.Empty;

    public string ImagemUrl { get; set; } = string.Empty;
}
}