using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using MesaApi.Models;

namespace MesaApi.Data
{
    [Table("Comanda")]
    public class ComandaContext : DbContext
    {
        public ComandaContext(DbContextOptions<ComandaContext> opts) : base(opts)
        {
        }
        public DbSet<Comanda> Comandas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Comanda>().ToTable("Comandas");
        }
    }
}
