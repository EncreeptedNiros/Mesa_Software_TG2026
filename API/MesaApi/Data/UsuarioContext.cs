using MesaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Data
{
    public class UsuarioContext : DbContext
    {
        public UsuarioContext(DbContextOptions<UsuarioContext> opts) : base(opts)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Usuario>().ToTable("Usuarios");
            modelBuilder.Entity<Usuario>()
                .HasIndex(usuario => usuario.Login)
                .IsUnique();
        }
    }
}
