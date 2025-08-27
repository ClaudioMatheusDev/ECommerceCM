using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CMShop.IdentityServer.Model.Context
{
    public class SqlContext : IdentityDbContext<ApplicationUser>
    {
        public SqlContext(DbContextOptions<SqlContext> options) : base(options) { }
        
    }
}
