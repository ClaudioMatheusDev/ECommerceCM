// Copyright (c) Duende Software. All rights reserved.
// See LICENSE in the project root for license information.

using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace CMShop.IdentityServer.Pages.Create;

public class InputModel : IValidatableObject
{
    [Required(ErrorMessage = "Nome de usuário é obrigatório")]
    [StringLength(50, ErrorMessage = "Nome de usuário deve ter entre {2} e {1} caracteres", MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9_.-]+$", ErrorMessage = "Nome de usuário pode conter apenas letras, números, pontos, hífens e sublinhados")]
    [Display(Name = "Nome de usuário")]
    public string? Username { get; set; }

    [Required(ErrorMessage = "Senha é obrigatória")]
    [StringLength(100, ErrorMessage = "A senha deve ter pelo menos {2} e no máximo {1} caracteres", MinimumLength = 8)]
    [DataType(DataType.Password)]
    [Display(Name = "Senha")]
    public string? Password { get; set; }

    [Required(ErrorMessage = "Confirmação de senha é obrigatória")]
    [DataType(DataType.Password)]
    [Display(Name = "Confirmar senha")]
    [Compare("Password", ErrorMessage = "A senha e a confirmação de senha não coincidem")]
    public string? ConfirmPassword { get; set; }

    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(50, ErrorMessage = "Nome deve ter no máximo {1} caracteres", MinimumLength = 2)]
    [RegularExpression(@"^[a-zA-ZÀ-ÿ\s]+$", ErrorMessage = "Nome deve conter apenas letras e espaços")]
    [Display(Name = "Nome")]
    public string? FirstName { get; set; }

    [Required(ErrorMessage = "Sobrenome é obrigatório")]
    [StringLength(50, ErrorMessage = "Sobrenome deve ter no máximo {1} caracteres", MinimumLength = 2)]
    [RegularExpression(@"^[a-zA-ZÀ-ÿ\s]+$", ErrorMessage = "Sobrenome deve conter apenas letras e espaços")]
    [Display(Name = "Sobrenome")]
    public string? LastName { get; set; }

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    [StringLength(100, ErrorMessage = "Email deve ter no máximo {1} caracteres")]
    [Display(Name = "Email")]
    public string? Email { get; set; }

    [Phone(ErrorMessage = "Formato de telefone inválido")]
    [RegularExpression(@"^\(\d{2}\)\s\d{4,5}-\d{4}$", ErrorMessage = "Telefone deve estar no formato (XX) XXXXX-XXXX")]
    [Display(Name = "Telefone")]
    public string? PhoneNumber { get; set; }

    public string? ReturnUrl { get; set; }

    public string? Button { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var results = new List<ValidationResult>();

        // Validação de força da senha
        if (!string.IsNullOrEmpty(Password))
        {
            if (!Regex.IsMatch(Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$"))
            {
                results.Add(new ValidationResult(
                    "A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial",
                    new[] { nameof(Password) }));
            }
        }

        // Validação de nome de usuário único (será validada no controller também)
        if (!string.IsNullOrEmpty(Username))
        {
            if (Username.Length < 3)
            {
                results.Add(new ValidationResult(
                    "Nome de usuário deve ter pelo menos 3 caracteres",
                    new[] { nameof(Username) }));
            }
        }

        // Validação de email
        if (!string.IsNullOrEmpty(Email))
        {
            if (!Email.Contains("@") || !Email.Contains("."))
            {
                results.Add(new ValidationResult(
                    "Email deve conter @ e pelo menos um ponto",
                    new[] { nameof(Email) }));
            }
        }

        return results;
    }
}