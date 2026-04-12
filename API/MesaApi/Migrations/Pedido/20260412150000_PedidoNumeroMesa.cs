using MesaApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MesaApi.Migrations.Pedido
{
    [DbContext(typeof(PedidoContext))]
    [Migration("20260412150000_PedidoNumeroMesa")]
    public partial class PedidoNumeroMesa : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NumeroMesa",
                table: "Pedidos",
                type: "longtext",
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE `Pedidos` SET `NumeroMesa` = '' WHERE `NumeroMesa` IS NULL;"
            );

            migrationBuilder.AlterColumn<string>(
                name: "NumeroMesa",
                table: "Pedidos",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumeroMesa",
                table: "Pedidos");
        }
    }
}
