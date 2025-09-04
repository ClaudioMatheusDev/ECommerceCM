using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CMShop.PaymentAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialPaymentAPICreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "payment",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    card_number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    card_expiry_month = table.Column<int>(type: "int", nullable: false),
                    card_expiry_year = table.Column<int>(type: "int", nullable: false),
                    card_security_code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    card_holder_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    payment_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    transaction_id = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "payment");
        }
    }
}
