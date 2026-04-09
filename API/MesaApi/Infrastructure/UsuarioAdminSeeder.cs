using MesaApi.Data;
using MesaApi.Models;
using MesaApi.Security;
using Microsoft.EntityFrameworkCore;

namespace MesaApi.Infrastructure
{
    public static class UsuarioAdminSeeder
    {
        public static async Task SeedAdminAsync(this IServiceProvider services, IConfiguration configuration)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<UsuarioContext>();

            var adminLogin = (configuration["DefaultAdmin:Login"] ?? "admin").Trim();
            var adminSenha = configuration["DefaultAdmin:Senha"] ?? "admin";
            var adminNome = (configuration["DefaultAdmin:Nome"] ?? "Administrador").Trim();
            var adminPerfil = (configuration["DefaultAdmin:Perfil"] ?? "Admin").Trim();
            var atualizarAdminPadrao = bool.TryParse(
                configuration["DefaultAdmin:AtualizarNoStartup"],
                out var atualizarNoStartup
            ) && atualizarNoStartup;

            var adminExistente = await context.Usuarios.FirstOrDefaultAsync(usuario => usuario.Login == adminLogin);

            if (adminExistente is not null)
            {
                if (!atualizarAdminPadrao)
                {
                    return;
                }

                adminExistente.Nome = string.IsNullOrWhiteSpace(adminNome) ? "Administrador" : adminNome;
                adminExistente.Senha = PasswordHasher.HashPassword(adminSenha.Trim());
                adminExistente.Perfil = string.IsNullOrWhiteSpace(adminPerfil) ? "Admin" : adminPerfil;
                adminExistente.Ativo = true;

                await context.SaveChangesAsync();
                return;
            }

            var admin = new Usuario
            {
                Nome = string.IsNullOrWhiteSpace(adminNome) ? "Administrador" : adminNome,
                Login = string.IsNullOrWhiteSpace(adminLogin) ? "admin" : adminLogin,
                Senha = PasswordHasher.HashPassword(adminSenha.Trim()),
                Perfil = string.IsNullOrWhiteSpace(adminPerfil) ? "Admin" : adminPerfil,
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };

            context.Usuarios.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}
