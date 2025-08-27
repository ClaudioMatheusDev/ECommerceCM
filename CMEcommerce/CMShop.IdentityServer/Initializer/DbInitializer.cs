using CMShop.IdentityServer.Configuration;
using CMShop.IdentityServer.Model;
using CMShop.IdentityServer.Model.Context;
using IdentityModel;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace CMShop.IdentityServer.Initializer
{
    /// <summary>  
    /// Classe responsável por inicializar o banco de dados com as configurações iniciais,  
    /// como a criação de papéis (roles) padrão.  
    /// </summary>  
    public class DbInitializer : IDbInitializer
    {
        private readonly SqlContext _context;
        private readonly UserManager<ApplicationUser> _user;
        private readonly RoleManager<IdentityRole> _role;

        /// <summary>  
        /// Construtor da classe DbInitializer.  
        /// </summary>  
        /// <param name="context">Contexto do banco de dados.</param>  
        /// <param name="user">Gerenciador de usuários do Identity.</param>  
        /// <param name="role">Gerenciador de papéis do Identity.</param>  
        public DbInitializer(SqlContext context,
            UserManager<ApplicationUser> user,
            RoleManager<IdentityRole> role)
        {
            _context = context;
            _user = user;
            _role = role;
        }

        /// <summary>  
        /// Método responsável por inicializar o banco de dados.  
        /// Verifica se os papéis padrão já existem e, caso contrário, os cria.  
        /// </summary>  
        public void Initialize()
        {
            // Verifica se o papel de administrador já existe.  
            if (_role.FindByNameAsync(IdentityConfiguration.Admin).Result != null) return;

            // Cria o papel de administrador.  
            _role.CreateAsync(new IdentityRole(IdentityConfiguration.Admin)).GetAwaiter().GetResult();

            // Cria o papel de cliente.  
            _role.CreateAsync(new IdentityRole(IdentityConfiguration.Client)).GetAwaiter().GetResult();

            ApplicationUser admin = new ApplicationUser()
            {
                UserName = "Matheus-admin",
                Email = "claudiomatheus55@hotmail.com",
                EmailConfirmed = true,
                PhoneNumber = "+55 (18) 12345-6789",
                FirstName = "Matheus",
                LastName = "Admin"
            };

            _user.CreateAsync(admin, "Matheus891*").GetAwaiter().GetResult();

            _user.AddToRoleAsync(admin, IdentityConfiguration.Admin).GetAwaiter().GetResult();
            
            var adminClaims = _user.AddClaimsAsync(admin, new Claim[]
            {
                new Claim(JwtClaimTypes.Name, $"{admin.FirstName} {admin.LastName}"),
                new Claim(JwtClaimTypes.GivenName, admin.FirstName),
                new Claim(JwtClaimTypes.FamilyName, admin.LastName),
                new Claim(JwtClaimTypes.Role, IdentityConfiguration.Admin)
            }).Result;

            ApplicationUser client = new ApplicationUser()
            {
                UserName = "Matheus-client",
                Email = "claudiomatheus55@hotmail.com",
                EmailConfirmed = true,
                PhoneNumber = "+55 (18) 12345-6789",
                FirstName = "Matheus",
                LastName = "client"
            };

            _user.CreateAsync(client, "Matheus891*").GetAwaiter().GetResult();

            _user.AddToRoleAsync(client, IdentityConfiguration.Client).GetAwaiter().GetResult();

            var clientClaims = _user.AddClaimsAsync(client, new Claim[]
            {
                new Claim(JwtClaimTypes.Name, $"{client.FirstName} {client.LastName}"),
                new Claim(JwtClaimTypes.GivenName, client.FirstName),
                new Claim(JwtClaimTypes.FamilyName, client.LastName),
                new Claim(JwtClaimTypes.Role, IdentityConfiguration.Client)
            }).Result;
        }
    }
}
