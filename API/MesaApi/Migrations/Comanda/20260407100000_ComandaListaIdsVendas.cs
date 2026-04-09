using MesaApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MesaApi.Migrations.Comanda
{
    [DbContext(typeof(ComandaContext))]
    [Migration("20260407100000_ComandaListaIdsVendas")]
    public partial class ComandaListaIdsVendas : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Lista_ids_vendas",
                table: "Comandas",
                type: "longtext",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql(
                "UPDATE `Comandas` SET `Lista_ids_vendas` = '[]' WHERE `Lista_ids_vendas` = '' OR `Lista_ids_vendas` IS NULL;"
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Lista_ids_vendas",
                table: "Comandas");
        }
    }
}
