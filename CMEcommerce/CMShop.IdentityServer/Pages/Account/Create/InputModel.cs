// Copyright (c) Duende Software. All rights reserved.
// See LICENSE in the project root for license information.

using System.ComponentModel.DataAnnotations;

namespace CMShop.IdentityServer.Pages.Create;

public class InputModel
{
    [Required(ErrorMessage = "Username é obrigatório")]
    [Display(Name = "Nome de usuário")]
    public string? Username { get; set; }

    [Required(ErrorMessage = "Senha é obrigatória")]
    [StringLength(100, ErrorMessage = "A {0} deve ter pelo menos {2} e no máximo {1} caracteres.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "Senha")]
    public string? Password { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Confirmar senha")]
    [Compare("Password", ErrorMessage = "A senha e a confirmação de senha não coincidem.")]
    public string? ConfirmPassword { get; set; }

    [Required(ErrorMessage = "Nome é obrigatório")]
    [Display(Name = "Nome")]
    public string? FirstName { get; set; }

    [Required(ErrorMessage = "Sobrenome é obrigatório")]
    [Display(Name = "Sobrenome")]
    public string? LastName { get; set; }

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [Display(Name = "Email")]
    public string? Email { get; set; }

    [Phone(ErrorMessage = "Telefone inválido")]
    [Display(Name = "Telefone")]
    public string? PhoneNumber { get; set; }

    public string? ReturnUrl { get; set; }

    public string? Button { get; set; }
}