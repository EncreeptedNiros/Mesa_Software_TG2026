using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using MesaApi.Models;

namespace MesaApi.Data
{
    [Table("Produto")]
    public class ProdutoContext : DbContext
    {
        public ProdutoContext(DbContextOptions<ProdutoContext> opts) : base(opts)
        {
        }
        public DbSet<Produto> Produtos { get; set; }
    }
}
