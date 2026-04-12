using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MesaApi.Migrations.Pedido
{
    [DbContext(typeof(MesaApi.Data.PedidoContext))]
    [Migration("20260402021000_PedidoObservacoes")]
    public partial class PedidoObservacoes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Observacoes",
                table: "Pedidos",
                type: "longtext",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Observacoes",
                table: "Pedidos");
        }
    }
}
