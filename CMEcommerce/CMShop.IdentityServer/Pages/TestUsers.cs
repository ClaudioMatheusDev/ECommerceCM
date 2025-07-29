// Copyright (c) Duende Software. All rights reserved.
// See LICENSE in the project root for license information.

using IdentityModel;
using System.Security.Claims;
using System.Text.Json;
using Duende.IdentityServer;
using Duende.IdentityServer.Test;

namespace CMShop.IdentityServer.Pages;

public static class TestUsers
{
    public static List<TestUser> Users
    {
        get
        {
            var address = new
            {
                street_address = "Rua das Flores, 123",
                locality = "São Paulo",
                postal_code = "01234-567",
                country = "Brasil"
            };
                
            return new List<TestUser>
            {
                // Usuário Admin
                new TestUser
                {
                    SubjectId = "1",
                    Username = "admin",
                    Password = "admin123",
                    Claims =
                    {
                        new Claim(JwtClaimTypes.Name, "Administrador CM"),
                        new Claim(JwtClaimTypes.GivenName, "Admin"),
                        new Claim(JwtClaimTypes.FamilyName, "CM"),
                        new Claim(JwtClaimTypes.Email, "admin@cmshop.com"),
                        new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean),
                        new Claim(JwtClaimTypes.Role, "Admin"),
                        new Claim(JwtClaimTypes.WebSite, "https://cmshop.com"),
                        new Claim(JwtClaimTypes.Address, JsonSerializer.Serialize(address), IdentityServerConstants.ClaimValueTypes.Json)
                    }
                },
                // Usuário Cliente
                new TestUser
                {
                    SubjectId = "2",
                    Username = "cliente",
                    Password = "cliente123",
                    Claims =
                    {
                        new Claim(JwtClaimTypes.Name, "João Silva"),
                        new Claim(JwtClaimTypes.GivenName, "João"),
                        new Claim(JwtClaimTypes.FamilyName, "Silva"),
                        new Claim(JwtClaimTypes.Email, "joao@email.com"),
                        new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean),
                        new Claim(JwtClaimTypes.Role, "Client"),
                        new Claim(JwtClaimTypes.WebSite, "https://joao.com"),
                        new Claim(JwtClaimTypes.Address, JsonSerializer.Serialize(address), IdentityServerConstants.ClaimValueTypes.Json)
                    }
                },
                // Outro usuário Cliente
                new TestUser
                {
                    SubjectId = "3",
                    Username = "maria",
                    Password = "maria123",
                    Claims =
                    {
                        new Claim(JwtClaimTypes.Name, "Maria Santos"),
                        new Claim(JwtClaimTypes.GivenName, "Maria"),
                        new Claim(JwtClaimTypes.FamilyName, "Santos"),
                        new Claim(JwtClaimTypes.Email, "maria@email.com"),
                        new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean),
                        new Claim(JwtClaimTypes.Role, "Client"),
                        new Claim(JwtClaimTypes.WebSite, "https://maria.com"),
                        new Claim(JwtClaimTypes.Address, JsonSerializer.Serialize(address), IdentityServerConstants.ClaimValueTypes.Json)
                    }
                }
            };
        }
    }
}