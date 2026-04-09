using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using MesaApi.Models;

namespace MesaApi.Data
{
    [Table("Venda")]
    public class VendaContext : DbContext
    {
        public VendaContext(DbContextOptions<VendaContext> opts) : base(opts)
        {
        }
        public DbSet<Venda> Vendas { get; set; }
        public DbSet<Produto> Produtos { get; set; }
    }
}
