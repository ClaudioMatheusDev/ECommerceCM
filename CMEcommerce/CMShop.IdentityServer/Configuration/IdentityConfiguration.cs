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
        public const string Customer = "Customer";

        /// <summary>
        /// Define os recursos de identidade disponíveis para o IdentityServer.
        /// </summary>
        public static IEnumerable<IdentityResource> IdentityResource =>
            new List<IdentityResource>
            {
                   new IdentityResources.OpenId(), // Recurso de identidade OpenID Connect.
                   new IdentityResources.Email(), // Recurso de identidade de email.
                   new IdentityResources.Profile() // Recurso de identidade de perfil.
            };

        /// <summary>
        /// Define os escopos de API disponíveis para o IdentityServer.
        /// </summary>
        public static IEnumerable<ApiScope> ApiScopes => new List<ApiScope>
           {
               new ApiScope("cmshop", "Servidor CMShop"), // Escopo para o servidor CMShop.
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
                   AllowedScopes = { "cmshop", "read", "write", "delete" } // Escopos que o cliente tem permissão para acessar.
               }
           };
    }
}