
document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // VALIDAÇÃO DE CPF (algoritmo oficial)
  // ============================================================
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Primeiro dígito verificador
    var soma = 0;
    for (var i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    var resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // Segundo dígito verificador
    soma = 0;
    for (var j = 0; j < 10; j++) {
      soma += parseInt(cpf.charAt(j)) * (11 - j);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  // ============================================================
  // VALIDAÇÃO DE CNPJ (algoritmo oficial)
  // ============================================================
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    var soma = 0;
    var peso = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (var i = 0; i < 12; i++) {
      soma += parseInt(cnpj.charAt(i)) * peso[i];
    }
    var resto = soma % 11;
    var digito1 = resto < 2 ? 0 : 11 - resto;
    if (parseInt(cnpj.charAt(12)) !== digito1) return false;

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
  // IDENTIFICA E VALIDA (CPF OU CNPJ)
  // ============================================================
  function validarDocumento(valor) {
    var doc = valor.replace(/\D/g, '');
    if (doc.length === 11) return { tipo: 'CPF', valido: validarCPF(doc) };
    if (doc.length === 14) return { tipo: 'CNPJ', valido: validarCNPJ(doc) };
    return { tipo: null, valido: false };
  }

  // ============================================================
  // APLICA MÁSCARA DINÂMICA (CPF até 11 dígitos, CNPJ depois)
  // ============================================================
  function aplicarMascara(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 14) value = value.substring(0, 14);

    if (value.length <= 11) {
      // Máscara de CPF: 000.000.000-00
      if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
      }
    } else {
      // Máscara de CNPJ: 00.000.000/0000-00
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  }

  // ============================================================
  // MÁSCARA + VALIDAÇÃO
  // ============================================================
  function initMaskAndValidation() {
    // Procura campos comuns usados no RD Station para CPF/CNPJ
    var campo =
      document.querySelector('input[name="cpf_cnpj"]') ||
      document.querySelector('input[name="cnpj_cpf"]') ||
      document.querySelector('input[name="documento"]') ||
      document.querySelector('input[name="cpf"]') ||
      document.querySelector('input[name="cnpj"]') ||
      document.querySelector('input[name="CPF"]') ||
      document.querySelector('input[name="CNPJ"]') ||
      document.querySelector('input[name="cf_cpf_cnpj"]') ||
      document.querySelector('input[name="cf_documento"]') ||
      document.querySelector('input[name="custom_fields[cpf_cnpj]"]') ||
      document.querySelector('input[name="custom_fields[documento]"]') ||
      document.querySelector('input[placeholder*="CPF"]') ||
      document.querySelector('input[placeholder*="CNPJ"]') ||
      document.querySelector('input[placeholder*="cpf"]') ||
      document.querySelector('input[placeholder*="cnpj"]');

    if (!campo) {
      var labels = document.querySelectorAll('label');
      for (var i = 0; i < labels.length; i++) {
        var texto = labels[i].textContent.trim().toUpperCase();
        if (texto.includes('CPF') || texto.includes('CNPJ') || texto.includes('DOCUMENTO')) {
          var fieldId = labels[i].getAttribute('for');
          if (fieldId) campo = document.getElementById(fieldId);
          if (!campo) {
            campo = labels[i].closest('.bricks-form__field, .rd-form-field, .form-group')?.querySelector('input');
          }
          if (campo) break;
        }
      }
    }

    if (!campo) {
      console.warn('⚠️ Campo CPF/CNPJ não encontrado na página.');
      return;
    }

    campo.setAttribute('placeholder', 'CPF ou CNPJ');
    campo.setAttribute('maxlength', '18');

    // ---- FUNÇÕES DE ERRO ----
    function mostrarErro(mensagem) {
      campo.style.borderColor = '#e74c3c';
      campo.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.25)';
      var msg = document.getElementById('doc-erro-msg');
      if (!msg) {
        msg = document.createElement('span');
        msg.id = 'doc-erro-msg';
        msg.style.cssText = 'color:#e74c3c;font-size:12px;margin-top:4px;display:block;font-weight:500;';
        campo.parentNode.insertBefore(msg, campo.nextSibling);
      }
      msg.textContent = mensagem;
    }

    function limparErro() {
      campo.style.borderColor = '';
      campo.style.boxShadow = '';
      var msg = document.getElementById('doc-erro-msg');
      if (msg) msg.remove();
    }

    // ---- MÁSCARA ----
    campo.addEventListener('input', function (e) {
      e.target.value = aplicarMascara(e.target.value);
      limparErro();
    });

    // ---- VALIDAÇÃO NO BLUR ----
    campo.addEventListener('blur', function () {
      var valor = campo.value.replace(/\D/g, '');
      if (valor.length === 0) { limparErro(); return; }

      var resultado = validarDocumento(valor);

      if (resultado.valido) {
        limparErro();
        campo.style.borderColor = '#27ae60';
        campo.style.boxShadow = '0 0 0 2px rgba(39, 174, 96, 0.25)';
        setTimeout(function () {
          campo.style.borderColor = '';
          campo.style.boxShadow = '';
        }, 2000);
      } else if (resultado.tipo) {
        mostrarErro(resultado.tipo + ' inválido. Verifique o número digitado.');
      } else {
        mostrarErro('Documento incompleto. Digite um CPF (11 dígitos) ou CNPJ (14 dígitos).');
      }
    });

    // ============================================================
    // BLOQUEIO DO ENVIO - 3 ESTRATÉGIAS COMBINADAS
    // ============================================================
    var form = campo.closest('form');

    function bloquearSeInvalido(e) {
      var valor = campo.value.replace(/\D/g, '');
      if (valor.length === 0) return true;

      var resultado = validarDocumento(valor);
      if (!resultado.valido) {
        if (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        campo.focus();
        var mensagem = resultado.tipo
          ? 'O ' + resultado.tipo + ' informado é inválido.'
          : 'Documento incompleto. Digite um CPF (11 dígitos) ou CNPJ (14 dígitos).';
        mostrarErro(mensagem + ' Verifique e corrija antes de enviar.');
        alert(mensagem + ' Por favor, verifique e corrija antes de enviar.');
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
        if (bloquearSeInvalido(null) === false) return;
        nativeSubmit.call(form);
      };
    }

    console.log('✅ Máscara e validação de CPF/CNPJ aplicadas com sucesso!');
  }

  // Executa imediatamente
  initMaskAndValidation();

  // MutationObserver para formulários carregados dinamicamente
  if (!document.querySelector('input[name*="cpf"], input[name*="cnpj"], input[name*="CPF"], input[name*="CNPJ"], input[name*="documento"]')) {
    var observer = new MutationObserver(function (mutations, obs) {
      var found =
        document.querySelector('input[name*="cpf"]') ||
        document.querySelector('input[name*="cnpj"]') ||
        document.querySelector('input[name*="CPF"]') ||
        document.querySelector('input[name*="CNPJ"]') ||
        document.querySelector('input[name*="documento"]');
      if (found) {
        initMaskAndValidation();
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { observer.disconnect(); }, 10000);
  }
});
