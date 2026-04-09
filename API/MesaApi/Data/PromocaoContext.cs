using Microsoft.EntityFrameworkCore;
using MesaApi.Models;

namespace MesaApi.Data
{
    public class PromocaoContext : DbContext
    {
        public PromocaoContext(DbContextOptions<PromocaoContext> opts) : base(opts)
        {
        }

        public DbSet<Promocao> Promocaos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Promocao>().ToTable("Promocaos");
            modelBuilder.Entity<Promocao>()
                .Property(promocao => promocao.ProdutosIdsJson)
                .HasColumnName("ProdutosIds")
                .HasColumnType("longtext");
        }
    }
}
