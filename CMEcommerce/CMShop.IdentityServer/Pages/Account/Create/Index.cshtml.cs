// Copyright (c) Duende Software. All rights reserved.
// See LICENSE in the project root for license information.

using Duende.IdentityServer;
using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using CMShop.IdentityServer.Pages;
using CMShop.IdentityServer.Model;
using Microsoft.AspNetCore.Identity;
using CMShop.IdentityServer.Configuration;
using System.Security.Claims;
using IdentityModel;
using Microsoft.Extensions.Logging;

namespace CMShop.IdentityServer.Pages.Create;

[SecurityHeaders]
[AllowAnonymous]
public class Index : PageModel
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IIdentityServerInteractionService _interaction;
    private readonly ILogger<Index> _logger;

    [BindProperty]
    public InputModel Input { get; set; } = default!;

    public Index(
        IIdentityServerInteractionService interaction,
        UserManager<ApplicationUser> userManager,
        ILogger<Index> logger)
    {
        _userManager = userManager;
        _interaction = interaction;
        _logger = logger;
    }

    public IActionResult OnGet(string? returnUrl)
    {
        Input = new InputModel { ReturnUrl = returnUrl };
        return Page();
    }
        
    public async Task<IActionResult> OnPost()
    {
        try
        {
            // check if we are in the context of an authorization request
            var context = await _interaction.GetAuthorizationContextAsync(Input.ReturnUrl);

            // the user clicked the "cancel" button
            if (Input.Button != "create")
            {
                if (context != null)
                {
                    // if the user cancels, send a result back into IdentityServer as if they 
                    // denied the consent (even if this client does not require consent).
                    // this will send back an access denied OIDC error response to the client.
                    await _interaction.DenyAuthorizationAsync(context, AuthorizationError.AccessDenied);

                    // we can trust model.ReturnUrl since GetAuthorizationContextAsync returned non-null
                    if (context.IsNativeClient())
                    {
                        // The client is native, so this change in how to
                        // return the response is for better UX for the end user.
                        return this.LoadingPage(Input.ReturnUrl);
                    }

                    return Redirect(Input.ReturnUrl ?? "~/");
                }
                else
                {
                    // since we don't have a valid context, then we just go back to the home page
                    return Redirect("~/");
                }
            }

            // Validações adicionais antes de criar o usuário
            await ValidateUserInputAsync();

            if (ModelState.IsValid)
            {
                _logger.LogInformation("Iniciando criação de usuário: {Username}", Input.Username);
                
                // Criar novo usuário
                var user = new ApplicationUser
                {
                    UserName = Input.Username,
                    Email = Input.Email,
                    EmailConfirmed = false, // Pode ser true se não quiser validação de email
                    FirstName = Input.FirstName?.Trim() ?? string.Empty,
                    LastName = Input.LastName?.Trim() ?? string.Empty,
                    PhoneNumber = Input.PhoneNumber?.Trim(),
                    SecurityStamp = Guid.NewGuid().ToString()
                };

                _logger.LogInformation("Tentando criar usuário no banco de dados...");
                var result = await _userManager.CreateAsync(user, Input.Password!);

                if (result.Succeeded)
                {
                    _logger.LogInformation("Usuário {Username} criado com sucesso. ID: {UserId}", user.UserName, user.Id);

                    // Adicionar o usuário à role de Client por padrão
                    await _userManager.AddToRoleAsync(user, IdentityConfiguration.Client);

                    // Adicionar claims básicas
                    var claims = new List<Claim>
                    {
                        new Claim(JwtClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
                        new Claim(JwtClaimTypes.GivenName, user.FirstName),
                        new Claim(JwtClaimTypes.FamilyName, user.LastName),
                        new Claim(JwtClaimTypes.Email, user.Email!),
                        new Claim(JwtClaimTypes.Role, IdentityConfiguration.Client),
                        new Claim("user_id", user.Id)
                    };

                    await _userManager.AddClaimsAsync(user, claims);

                    // Fazer login automático após criação
                    var isuser = new IdentityServerUser(user.Id)
                    {
                        DisplayName = user.UserName
                    };

                    await HttpContext.SignInAsync(isuser);

                    if (context != null)
                    {
                        if (context.IsNativeClient())
                        {
                            // The client is native, so this change in how to
                            // return the response is for better UX for the end user.
                            return this.LoadingPage(Input.ReturnUrl);
                        }

                        // we can trust Input.ReturnUrl since GetAuthorizationContextAsync returned non-null
                        return Redirect(Input.ReturnUrl ?? "~/");
                    }

                    // request for a local page
                    if (Url.IsLocalUrl(Input.ReturnUrl))
                    {
                        return Redirect(Input.ReturnUrl);
                    }
                    else if (string.IsNullOrEmpty(Input.ReturnUrl))
                    {
                        return Redirect("~/");
                    }
                    else
                    {
                        // user might have clicked on a malicious link - should be logged
                        throw new ArgumentException("invalid return URL");
                    }
                }
                else
                {
                    _logger.LogError("Falha ao criar usuário {Username}. Erros: {Errors}", 
                        Input.Username, string.Join(", ", result.Errors.Select(e => e.Description)));
                    
                    // Adicionar erros do Identity ao ModelState
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                        _logger.LogWarning("Erro específico: Código: {Code}, Descrição: {Description}", 
                            error.Code, error.Description);
                    }
                }
            }

            return Page();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao criar conta para usuário {Username}", Input.Username);
            ModelState.AddModelError(string.Empty, "Ocorreu um erro interno. Tente novamente mais tarde.");
            return Page();
        }
    }

    private async Task ValidateUserInputAsync()
    {
        // Verificar se o usuário já existe
        if (!string.IsNullOrEmpty(Input.Username))
        {
            var existingUser = await _userManager.FindByNameAsync(Input.Username);
            if (existingUser != null)
            {
                ModelState.AddModelError("Input.Username", "Este nome de usuário já está em uso");
            }

            // Validar caracteres permitidos no username
            if (!Input.Username.All(c => char.IsLetterOrDigit(c) || c == '.' || c == '-' || c == '_'))
            {
                ModelState.AddModelError("Input.Username", "Nome de usuário contém caracteres inválidos");
            }

            // Validar palavras proibidas (exemplo básico)
            var forbiddenWords = new[] { "admin", "administrator", "root", "system", "test" };
            if (forbiddenWords.Any(word => Input.Username.ToLower().Contains(word)))
            {
                ModelState.AddModelError("Input.Username", "Este nome de usuário não é permitido");
            }
        }

        // Verificar se o email já existe
        if (!string.IsNullOrEmpty(Input.Email))
        {
            var existingEmail = await _userManager.FindByEmailAsync(Input.Email);
            if (existingEmail != null)
            {
                ModelState.AddModelError("Input.Email", "Este email já está em uso");
            }

            // Validar domínios suspeitos (exemplo básico)
            var suspiciousDomains = new[] { "10minutemail.com", "tempmail.org", "guerrillamail.com" };
            var emailDomain = Input.Email.Split('@').LastOrDefault()?.ToLower();
            if (!string.IsNullOrEmpty(emailDomain) && suspiciousDomains.Contains(emailDomain))
            {
                ModelState.AddModelError("Input.Email", "Este provedor de email não é permitido");
            }
        }

        // Validações adicionais de negócio
        if (!string.IsNullOrEmpty(Input.FirstName))
        {
            if (Input.FirstName.Length < 2)
            {
                ModelState.AddModelError("Input.FirstName", "Nome deve ter pelo menos 2 caracteres");
            }
            if (Input.FirstName.Any(char.IsDigit))
            {
                ModelState.AddModelError("Input.FirstName", "Nome não pode conter números");
            }
        }

        if (!string.IsNullOrEmpty(Input.LastName))
        {
            if (Input.LastName.Length < 2)
            {
                ModelState.AddModelError("Input.LastName", "Sobrenome deve ter pelo menos 2 caracteres");
            }
            if (Input.LastName.Any(char.IsDigit))
            {
                ModelState.AddModelError("Input.LastName", "Sobrenome não pode conter números");
            }
        }

        // Validação adicional da senha
        if (!string.IsNullOrEmpty(Input.Password))
        {
            // Verificar se a senha contém partes do nome de usuário ou email
            if (!string.IsNullOrEmpty(Input.Username) && 
                Input.Password.ToLower().Contains(Input.Username.ToLower()))
            {
                ModelState.AddModelError("Input.Password", "A senha não pode conter o nome de usuário");
            }

            // Verificar senhas comuns
            var commonPasswords = new[] { "123456", "password", "123456789", "12345678", "12345", "1234567", "qwerty", "abc123" };
            if (commonPasswords.Any(pwd => Input.Password.ToLower().Contains(pwd)))
            {
                ModelState.AddModelError("Input.Password", "Esta senha é muito comum e não é segura");
            }
        }

        // Rate limiting básico (em produção, usar um sistema mais robusto como Redis)
        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        if (!string.IsNullOrEmpty(clientIp))
        {
            // Esta é uma implementação básica. Em produção, use um cache distribuído
            var attemptKey = $"register_attempts_{clientIp}";
            // Implementação do rate limiting seria aqui
        }
    }
}
