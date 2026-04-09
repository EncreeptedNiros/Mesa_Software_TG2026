using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MesaApi.Migrations.Promocao
{
    [DbContext(typeof(MesaApi.Data.PromocaoContext))]
    [Migration("20260409173000_PromocaoProdutosIdsJson")]
    public partial class PromocaoProdutosIdsJson : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProdutosIds",
                table: "Promocaos",
                type: "longtext",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProdutosIds",
                table: "Promocaos");
        }
    }
}
