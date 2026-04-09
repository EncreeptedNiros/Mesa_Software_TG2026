using MesaApi.Data;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Infrastructure
{
    public static class DatabaseMigrationRunner
    {
        public static async Task ApplyDatabaseMigrationsAsync(this IServiceProvider services)
        {
            using var scope = services.CreateScope();

            await scope.ServiceProvider.GetRequiredService<ProdutoContext>().Database.MigrateAsync();
            await scope.ServiceProvider.GetRequiredService<VendaContext>().Database.MigrateAsync();
            await scope.ServiceProvider.GetRequiredService<ComandaContext>().Database.MigrateAsync();
            await scope.ServiceProvider.GetRequiredService<PromocaoContext>().Database.MigrateAsync();
            await scope.ServiceProvider.GetRequiredService<PedidoContext>().Database.MigrateAsync();
            await scope.ServiceProvider.GetRequiredService<UsuarioContext>().Database.MigrateAsync();
        }
    }
}
