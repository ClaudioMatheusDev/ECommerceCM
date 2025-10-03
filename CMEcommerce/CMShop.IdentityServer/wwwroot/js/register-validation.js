document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const passwordField = document.querySelector('input[name="Input.Password"]');
    const confirmPasswordField = document.querySelector('input[name="Input.ConfirmPassword"]');
    const usernameField = document.querySelector('input[name="Input.Username"]');
    const emailField = document.querySelector('input[name="Input.Email"]');
    const phoneField = document.querySelector('input[name="Input.PhoneNumber"]');

    // Validação de força da senha em tempo real
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            showPasswordStrength(this, strength);
        });
    }

    // Confirmação de senha em tempo real
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            const password = passwordField.value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                this.classList.add('is-invalid');
                showFieldError(this, 'As senhas não coincidem');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    }

    if (phoneField) {
        phoneField.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 7) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            }
            this.value = value;
        });
    }

    if (emailField) {
        emailField.addEventListener('blur', function() {
            const email = this.value;
            if (email && !isValidEmail(email)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Email inválido');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    }

    if (usernameField) {
        usernameField.addEventListener('input', function() {
            const username = this.value;
            if (username.length > 0 && username.length < 3) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Nome de usuário deve ter pelo menos 3 caracteres');
            } else if (username && !/^[a-zA-Z0-9_.-]+$/.test(username)) {
                this.classList.add('is-invalid');
                showFieldError(this, 'Apenas letras, números, pontos, hífens e sublinhados');
            } else {
                this.classList.remove('is-invalid');
                hideFieldError(this);
            }
        });
    }

    function checkPasswordStrength(password) {
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[^a-zA-Z0-9]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) strength++;
        });

        return {
            score: strength,
            checks: checks,
            isValid: strength >= 4
        };
    }

    function showPasswordStrength(field, strength) {
        let strengthIndicator = field.parentNode.querySelector('.password-strength');
        
        if (!strengthIndicator) {
            strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength mt-2';
            field.parentNode.appendChild(strengthIndicator);
        }

        const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#198754'];
        const texts = ['Muito fraca', 'Fraca', 'Regular', 'Forte', 'Muito forte'];
        
        strengthIndicator.innerHTML = `
            <div class="progress" style="height: 5px;">
                <div class="progress-bar" style="width: ${(strength.score / 5) * 100}%; background-color: ${colors[strength.score - 1] || colors[0]}"></div>
            </div>
            <small class="text-muted">${texts[strength.score - 1] || texts[0]}</small>
        `;

        if (strength.isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else if (field.value.length > 0) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
        }
    }

    function isValidEmail(email) {
        const emailRegex = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
        return emailRegex.test(email);
    }

    function showFieldError(field, message) {
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error invalid-feedback';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function hideFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    // Mostrar loading no submit
    if (form) {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[value="create"]');
            if (submitButton) {
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Criando conta...';
                submitButton.disabled = true;
            }
        });
    }
});