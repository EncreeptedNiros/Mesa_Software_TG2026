using MesaApi.Data;
using MesaApi.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("MesaConnection");
var aspNetCoreUrls = builder.Configuration["ASPNETCORE_URLS"]
    ?? Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
    ?? string.Empty;
var possuiBindingHttps = aspNetCoreUrls.Contains("https://", StringComparison.OrdinalIgnoreCase);
var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));
builder.Services.AddDbContext<ProdutoContext>(options => options.UseMySql(connectionString, serverVersion));
builder.Services.AddDbContext<VendaContext>(options => options.UseMySql(connectionString, serverVersion));
builder.Services.AddDbContext<ComandaContext>(options => options.UseMySql(connectionString, serverVersion));
builder.Services.AddDbContext<PromocaoContext>(options => options.UseMySql(connectionString, serverVersion));
builder.Services.AddDbContext<PedidoContext>(options => options.UseMySql(connectionString, serverVersion));
builder.Services.AddDbContext<UsuarioContext>(options => options.UseMySql(connectionString, serverVersion));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Mesa API");
    options.RoutePrefix = "swagger";
});

if (possuiBindingHttps)
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => new { status = "Healthy", timestamp = DateTime.UtcNow });

await app.Services.ApplyDatabaseMigrationsAsync();
await app.Services.SeedAdminAsync(app.Configuration);

app.Run();
