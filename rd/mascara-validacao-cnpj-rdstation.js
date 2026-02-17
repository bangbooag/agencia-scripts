<script>
document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // VALIDAÇÃO DE CNPJ (algoritmo oficial com dígitos verificadores)
  // ============================================================
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14) return false;

    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Primeiro dígito verificador
    var soma = 0;
    var peso = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (var i = 0; i < 12; i++) {
      soma += parseInt(cnpj.charAt(i)) * peso[i];
    }
    var resto = soma % 11;
    var digito1 = resto < 2 ? 0 : 11 - resto;
    if (parseInt(cnpj.charAt(12)) !== digito1) return false;

    // Segundo dígito verificador
    soma = 0;
    peso = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (var j = 0; j < 13; j++) {
      soma += parseInt(cnpj.charAt(j)) * peso[j];
    }
    resto = soma % 11;
    var digito2 = resto < 2 ? 0 : 11 - resto;
    if (parseInt(cnpj.charAt(13)) !== digito2) return false;

    return true;
  }

  // ============================================================
  // MÁSCARA + VALIDAÇÃO
  // ============================================================
  function initCNPJMaskAndValidation() {
    var cnpjField =
      document.querySelector('input[name="cnpj"]') ||
      document.querySelector('input[name="CNPJ"]') ||
      document.querySelector('input[name="cf_cnpj"]') ||
      document.querySelector('input[name="custom_fields[cnpj]"]') ||
      document.querySelector('input[placeholder*="CNPJ"]') ||
      document.querySelector('input[placeholder*="cnpj"]');

    if (!cnpjField) {
      var labels = document.querySelectorAll('label');
      for (var i = 0; i < labels.length; i++) {
        if (labels[i].textContent.trim().toUpperCase().includes('CNPJ')) {
          var fieldId = labels[i].getAttribute('for');
          if (fieldId) {
            cnpjField = document.getElementById(fieldId);
          }
          if (!cnpjField) {
            cnpjField = labels[i].closest('.bricks-form__field, .rd-form-field, .form-group')?.querySelector('input');
          }
          break;
        }
      }
    }

    if (!cnpjField) {
      console.warn('⚠️ Campo CNPJ não encontrado na página.');
      return;
    }

    cnpjField.setAttribute('placeholder', '00.000.000/0000-00');
    cnpjField.setAttribute('maxlength', '18');

    // ---- FUNÇÕES DE ERRO ----
    function mostrarErro() {
      cnpjField.style.borderColor = '#e74c3c';
      cnpjField.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.25)';
      if (!document.getElementById('cnpj-erro-msg')) {
        var msgErro = document.createElement('span');
        msgErro.id = 'cnpj-erro-msg';
        msgErro.textContent = 'CNPJ inválido. Verifique o número digitado.';
        msgErro.style.cssText = 'color:#e74c3c;font-size:12px;margin-top:4px;display:block;font-weight:500;';
        cnpjField.parentNode.insertBefore(msgErro, cnpjField.nextSibling);
      }
    }

    function limparErro() {
      cnpjField.style.borderColor = '';
      cnpjField.style.boxShadow = '';
      var msg = document.getElementById('cnpj-erro-msg');
      if (msg) msg.remove();
    }

    // ---- MÁSCARA ----
    cnpjField.addEventListener('input', function (e) {
      var value = e.target.value.replace(/\D/g, '');
      if (value.length > 14) value = value.substring(0, 14);

      if (value.length > 12) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
      } else if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
      } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{1,3})/, '$1.$2');
      }

      e.target.value = value;
      limparErro();
    });

    // ---- VALIDAÇÃO NO BLUR ----
    cnpjField.addEventListener('blur', function () {
      var valor = cnpjField.value.replace(/\D/g, '');
      if (valor.length === 0) { limparErro(); return; }

      if (validarCNPJ(valor)) {
        limparErro();
        cnpjField.style.borderColor = '#27ae60';
        cnpjField.style.boxShadow = '0 0 0 2px rgba(39, 174, 96, 0.25)';
        setTimeout(function () {
          cnpjField.style.borderColor = '';
          cnpjField.style.boxShadow = '';
        }, 2000);
      } else {
        mostrarErro();
      }
    });

    // ============================================================
    // BLOQUEIO DO ENVIO - 3 ESTRATÉGIAS COMBINADAS
    // ============================================================
    var form = cnpjField.closest('form');

    function bloquearSeInvalido(e) {
      var valor = cnpjField.value.replace(/\D/g, '');
      if (valor.length > 0 && !validarCNPJ(valor)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        cnpjField.focus();
        mostrarErro();
        alert('O CNPJ informado é inválido. Por favor, verifique e corrija antes de enviar.');
        return false;
      }
      return true;
    }

    if (form) {
      // ESTRATÉGIA 1: Intercepta click no botão na fase de CAPTURA (antes da RD Station)
      var submitBtn = form.querySelector('input[type="submit"], button[type="submit"], .bricks-form__submit, .rd-button');
      if (submitBtn) {
        submitBtn.addEventListener('click', bloquearSeInvalido, true);
      }

      // ESTRATÉGIA 2: Intercepta submit do form na fase de CAPTURA
      form.addEventListener('submit', bloquearSeInvalido, true);

      // ESTRATÉGIA 3: Sobrescreve form.submit() nativo
      var nativeSubmit = HTMLFormElement.prototype.submit;
      form.submit = function () {
        var valor = cnpjField.value.replace(/\D/g, '');
        if (valor.length > 0 && !validarCNPJ(valor)) {
          cnpjField.focus();
          mostrarErro();
          alert('O CNPJ informado é inválido. Por favor, verifique e corrija antes de enviar.');
          return;
        }
        nativeSubmit.call(form);
      };
    }

    console.log('✅ Máscara e validação de CNPJ aplicadas com sucesso!');
  }

  // Executa imediatamente
  initCNPJMaskAndValidation();

  // MutationObserver para formulários carregados dinamicamente
  if (!document.querySelector('input[name*="cnpj"], input[name*="CNPJ"]')) {
    var observer = new MutationObserver(function (mutations, obs) {
      var found =
        document.querySelector('input[name*="cnpj"]') ||
        document.querySelector('input[name*="CNPJ"]');
      if (found) {
        initCNPJMaskAndValidation();
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 10000);
  }
});
</script>
