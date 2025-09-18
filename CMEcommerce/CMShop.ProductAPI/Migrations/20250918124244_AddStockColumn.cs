using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMShop.ProductAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddStockColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "stock",
                table: "product",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "product",
                keyColumn: "id",
                keyValue: 6L,
                column: "stock",
                value: 0);

            migrationBuilder.UpdateData(
                table: "product",
                keyColumn: "id",
                keyValue: 7L,
                column: "stock",
                value: 0);

            migrationBuilder.UpdateData(
                table: "product",
                keyColumn: "id",
                keyValue: 8L,
                column: "stock",
                value: 0);

            migrationBuilder.UpdateData(
                table: "product",
                keyColumn: "id",
                keyValue: 9L,
                column: "stock",
                value: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "stock",
                table: "product");
        }
    }
}
