using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using System.Data.Common;

namespace CMShop.ProductAPI.Model.Context
{
    public class SqlContext : DbContext
    {
        public SqlContext(){}

        public SqlContext(DbContextOptions<SqlContext> options) : base(options) { }
    }
}
