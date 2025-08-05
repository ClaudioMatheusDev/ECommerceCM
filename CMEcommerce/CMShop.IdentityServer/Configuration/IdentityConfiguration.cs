using Duende.IdentityServer;
using Duende.IdentityServer.Models;

namespace CMShop.IdentityServer.Configuration
{
    /// <summary>
    /// Fornece configuração para o IdentityServer, incluindo recursos de identidade, escopos de API e configurações de clientes.
    /// </summary>
    public static class IdentityConfiguration
    {
        /// <summary>
        /// Nome do papel para administradores.
        /// </summary>
        public const string Admin = "Admin";

        /// <summary>
        /// Nome do papel para clientes.
        /// </summary>
        public const string Client = "Client";

        /// <summary>
        /// Define os recursos de identidade disponíveis para o IdentityServer.
        /// </summary>
        public static IEnumerable<IdentityResource> IdentityResource =>
            new List<IdentityResource>
            {
                   new IdentityResources.OpenId(), // Recurso de identidade OpenID Connect.
                   new IdentityResources.Email(), // Recurso de identidade de email.
                   new IdentityResources.Profile(), // Recurso de identidade de perfil.
                   new IdentityResource(
                       name: "roles",
                       displayName: "User roles",
                       userClaims: new[] { "role" }
                   ) // Recurso de identidade para papéis/roles.
            };

        /// <summary>
        /// Define os escopos de API disponíveis para o IdentityServer.
        /// </summary>
        public static IEnumerable<ApiScope> ApiScopes => new List<ApiScope>
           {
               new ApiScope("cmshop", "Servidor CMShop"), // Escopo para o servidor CMShop.
               new ApiScope("product", "API de Produtos"), // Escopo para a API de Produtos.
               new ApiScope(name: "read", "Ler dados."), // Escopo para leitura de dados.
               new ApiScope(name: "write", "Escrever dados."), // Escopo para escrita de dados.
               new ApiScope(name: "delete", "Excluir dados.") // Escopo para exclusão de dados.
           };

        /// <summary>
        /// Define os clientes que podem acessar o IdentityServer.
        /// </summary>
        public static IEnumerable<Client> Clients => new List<Client>
           {
               new Client
               {
                   ClientId = "client", // Identificador único para o cliente.
                   ClientSecrets = { new Secret("my_super_secret".Sha256()) }, // Segredo para autenticação do cliente.
                   AllowedGrantTypes = GrantTypes.ClientCredentials, // Tipo de concessão para credenciais do cliente.
                   AllowedScopes = { "cmshop", "product", "read", "write", "delete" } // Escopos que o cliente tem permissão para acessar.
               },
               new Client
               {
                  ClientId = "cmshopping", // Identificador único do cliente.  
                  ClientSecrets = { new Secret("my_super_secret".Sha256()) }, // Segredo utilizado para autenticação do cliente.  
                  AllowedGrantTypes = GrantTypes.Code, // Tipo de concessão utilizado para autenticação do cliente.  
                  RedirectUris = {
                      "http://localhost:3000/callback", 
                      "https://localhost:3000/callback",
                      "https://localhost:7101/callback"
                  }, // URI para onde o cliente será redirecionado após a autenticação.  
                  PostLogoutRedirectUris = {
                      "http://localhost:3000", 
                      "https://localhost:3000",
                      "https://localhost:7101"
                  }, // URI para onde o cliente será redirecionado após o logout.  
                  AllowedScopes = new List<string>{
                      IdentityServerConstants.StandardScopes.OpenId, // Escopo padrão do OpenID Connect, utilizado para autenticação.  
                      IdentityServerConstants.StandardScopes.Profile, // Escopo que permite acesso às informações de perfil do usuário.  
                      IdentityServerConstants.StandardScopes.Email, // Escopo que permite acesso ao endereço de email do usuário.  
                      "roles", // Escopo para incluir papéis/roles do usuário.
                      "cmshop", // Escopo personalizado para o cliente "cmshop".
                      "product" // Escopo para acesso à API de produtos.
                  }, // Lista de escopos que o cliente tem permissão para acessar.
                  
                  // Configurações adicionais para melhor compatibilidade
                  RequireConsent = false, // Não exigir tela de consentimento
                  RequirePkce = false, // Não exigir PKCE para simplificar
                  AllowOfflineAccess = true, // Permitir refresh tokens
                  AccessTokenLifetime = 3600, // Token válido por 1 hora
                  IdentityTokenLifetime = 300, // ID token válido por 5 minutos
                  
                  // Configurações críticas para incluir claims no ID token
                  AlwaysIncludeUserClaimsInIdToken = true, // IMPORTANTE: incluir claims de usuário no ID token
                  IncludeJwtId = true,
                  
                  // Permitir CORS para o frontend
                  AllowedCorsOrigins = {
                      "http://localhost:3000",
                      "https://localhost:3000",
                      "https://localhost:7101"
                  }
               }
           };
    }
}