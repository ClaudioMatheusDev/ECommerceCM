using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using System.Data.Common;

namespace CMShop.ProductAPI.Model.Context
{
    public class SqlContext : DbContext
    {
        public SqlContext() { }

        public SqlContext(DbContextOptions<SqlContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>().HasData(
    new Product
    {
        Id = 6,
        Name = "Carregador Portátil Power Bank Inova 20000mAh",
        Price = new decimal(69.60),
        Description = "Power Bank com 2 saídas USB, ideal para carregar dispositivos em qualquer lugar. Alta capacidade e carregamento rápido.",
        ImageURL = "https://images.pexels.com/photos/518530/pexels-photo-518530.jpeg",
        CategoryName = "Acessórios para Celulares"
    },
    new Product
    {
        Id = 7,
        Name = "Fone de Ouvido Bluetooth JBL Tune 510BT",
        Price = new decimal(219.90),
        Description = "Fone de ouvido com conexão Bluetooth, som JBL Pure Bass, até 40h de bateria e design dobrável para maior praticidade.",
        ImageURL = "https://images.pexels.com/photos/20285555/pexels-photo-20285555.jpeg",
        CategoryName = "Eletrônicos"
    },
    new Product
    {
        Id = 8,
        Name = "Smartwatch Amazfit Bip U Pro GPS",
        Price = new decimal(349.99),
        Description = "Relógio inteligente com monitoramento de saúde, GPS integrado, resistência à água 5ATM e até 9 dias de bateria.",
        ImageURL = "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg",
        CategoryName = "Smartwatches"
    },
    new Product
    {
        Id = 9,
        Name = "Cabo USB-C Turbo 3A 1m Nylon Reforçado",
        Price = new decimal(24.90),
        Description = "Cabo USB-C resistente com carregamento turbo de 3A. Compatível com celulares Android, ideal para uso diário.",
        ImageURL = "https://images.pexels.com/photos/4219863/pexels-photo-4219863.jpeg",
        CategoryName = "Acessórios para Celulares"
    }
);
        }
    }
}
