using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CMShop.ProductAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedProductDataTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "product",
                columns: new[] { "id", "category_name", "description", "image_url", "name", "Price" },
                values: new object[,]
                {
                    { 6L, "Acessórios para Celulares", "Power Bank com 2 saídas USB, ideal para carregar dispositivos em qualquer lugar. Alta capacidade e carregamento rápido.", "https://images.pexels.com/photos/518530/pexels-photo-518530.jpeg", "Carregador Portátil Power Bank Inova 20000mAh", 69.6m },
                    { 7L, "Eletrônicos", "Fone de ouvido com conexão Bluetooth, som JBL Pure Bass, até 40h de bateria e design dobrável para maior praticidade.", "https://images.pexels.com/photos/20285555/pexels-photo-20285555.jpeg", "Fone de Ouvido Bluetooth JBL Tune 510BT", 219.9m },
                    { 8L, "Smartwatches", "Relógio inteligente com monitoramento de saúde, GPS integrado, resistência à água 5ATM e até 9 dias de bateria.", "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg", "Smartwatch Amazfit Bip U Pro GPS", 349.99m },
                    { 9L, "Acessórios para Celulares", "Cabo USB-C resistente com carregamento turbo de 3A. Compatível com celulares Android, ideal para uso diário.", "https://images.pexels.com/photos/4219863/pexels-photo-4219863.jpeg", "Cabo USB-C Turbo 3A 1m Nylon Reforçado", 24.9m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "product",
                keyColumn: "id",
                keyValue: 6L);

            migrationBuilder.DeleteData(
                table: "product",
                keyColumn: "id",
                keyValue: 7L);

            migrationBuilder.DeleteData(
                table: "product",
                keyColumn: "id",
                keyValue: 8L);

            migrationBuilder.DeleteData(
                table: "product",
                keyColumn: "id",
                keyValue: 9L);
        }
    }
}
