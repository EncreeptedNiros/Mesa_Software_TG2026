using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using MesaApi.Models;

namespace MesaApi.Data
{
    [Table("Pedido")]
    public class PedidoContext : DbContext
    {
        public PedidoContext(DbContextOptions<PedidoContext> opts) : base(opts)
        {
        }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<Produto> Produtos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Pedido>().ToTable("Pedidos");
            modelBuilder.Entity<Produto>().ToTable("Produtos");
        }
    }
}
