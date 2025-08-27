using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;
using Microsoft.AspNetCore.Identity;
using CMShop.IdentityServer.Model;
using System.Security.Claims;
using IdentityModel;

namespace CMShop.IdentityServer.Services
{
    public class ProfileService : IProfileService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public ProfileService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            Console.WriteLine($"ProfileService.GetProfileDataAsync called for caller: {context.Caller}");
            Console.WriteLine($"Requested claim types: {string.Join(", ", context.RequestedClaimTypes)}");
            
            var user = await _userManager.GetUserAsync(context.Subject);
            if (user != null)
            {
                Console.WriteLine($"User found: {user.UserName}");
                
                var claims = new List<Claim>
                {
                    new Claim(JwtClaimTypes.Subject, user.Id),
                    new Claim(JwtClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                    new Claim(JwtClaimTypes.GivenName, user.FirstName ?? ""),
                    new Claim(JwtClaimTypes.FamilyName, user.LastName ?? ""),
                    new Claim(JwtClaimTypes.Email, user.Email ?? ""),
                    new Claim(JwtClaimTypes.EmailVerified, user.EmailConfirmed.ToString().ToLower()),
                    new Claim(JwtClaimTypes.PreferredUserName, user.UserName ?? "")
                };

                // Adicionar roles do usuário
                var roles = await _userManager.GetRolesAsync(user);
                Console.WriteLine($"User roles: {string.Join(", ", roles)}");
                foreach (var role in roles)
                {
                    claims.Add(new Claim(JwtClaimTypes.Role, role));
                }

                // Adicionar claims customizadas do usuário
                var userClaims = await _userManager.GetClaimsAsync(user);
                claims.AddRange(userClaims);

                Console.WriteLine($"Total claims created: {claims.Count}");
                foreach (var claim in claims)
                {
                    Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                }

                // Para ID Tokens, incluir TODAS as claims importantes
                // Para Access Tokens, filtrar apenas as solicitadas
                if (context.Caller == "ClaimsProviderIdentityToken" || context.RequestedClaimTypes.Any())
                {
                    // Para ID tokens ou quando há claims específicas solicitadas
                    var requestedClaims = claims.Where(c => 
                        context.RequestedClaimTypes.Contains(c.Type) || 
                        context.Caller == "ClaimsProviderIdentityToken").ToList();
                    
                    // Se for ID token, garantir que sempre inclua as claims básicas
                    if (context.Caller == "ClaimsProviderIdentityToken")
                    {
                        context.IssuedClaims = claims; // Incluir todas as claims no ID token
                    }
                    else
                    {
                        context.IssuedClaims = requestedClaims;
                    }
                }
                else
                {
                    // Para outros casos, incluir todas as claims
                    context.IssuedClaims = claims;
                }

                Console.WriteLine($"Claims issued: {context.IssuedClaims.Count} (Caller: {context.Caller})");
            }
            else
            {
                Console.WriteLine("User not found!");
            }
        }

        public async Task IsActiveAsync(IsActiveContext context)
        {
            var user = await _userManager.GetUserAsync(context.Subject);
            context.IsActive = user != null;
        }
    }
}
