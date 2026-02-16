/**
 * Validador de CNPJ para formulários RD Station
 *
 * Valida o campo de CNPJ em tempo real, impedindo envios com dados inválidos.
 * Cole este script no campo "JavaScript customizado" do formulário no RD Station.
 *
 * CDN: https://cdn.jsdelivr.net/gh/hmax27/agencia-scripts@main/rd/validador-cnpj.js
 */
(function () {
  "use strict";

  /**
   * Valida um CNPJ completo (14 dígitos) com verificação dos dígitos verificadores.
   * @param {string} cnpj - CNPJ com ou sem formatação
   * @returns {boolean}
   */
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, "");

    if (cnpj.length !== 14) return false;

    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Validação do primeiro dígito verificador
    var tamanho = cnpj.length - 2;
    var numeros = cnpj.substring(0, tamanho);
    var digitos = cnpj.substring(tamanho);
    var soma = 0;
    var pos = tamanho - 7;

    for (var i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }

    var resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

    // Validação do segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (var j = tamanho; j >= 1; j--) {
      soma += parseInt(numeros.charAt(tamanho - j), 10) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1), 10);
  }

  /**
   * Aplica máscara de CNPJ: XX.XXX.XXX/XXXX-XX
   * @param {string} value
   * @returns {string}
   */
  function mascaraCNPJ(value) {
    return value
      .replace(/\D/g, "")
      .substring(0, 14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  // Aguarda o DOM e o formulário RD Station carregar
  function init() {
    var campoCnpj = document.querySelector(
      'input[name="cnpj"], input[name="cf_cnpj"], input[data-field="cnpj"]'
    );

    if (!campoCnpj) return;

    // Aplica máscara em tempo real
    campoCnpj.addEventListener("input", function () {
      this.value = mascaraCNPJ(this.value);
    });

    // Valida no blur
    campoCnpj.addEventListener("blur", function () {
      var valor = this.value;
      if (valor && !validarCNPJ(valor)) {
        this.style.borderColor = "#dc2626";
        this.setCustomValidity("CNPJ inválido");

        // Adiciona mensagem de erro se não existir
        var parent = this.parentElement;
        if (!parent.querySelector(".cnpj-error")) {
          var erro = document.createElement("span");
          erro.className = "cnpj-error";
          erro.style.cssText = "color:#dc2626;font-size:12px;margin-top:4px;display:block";
          erro.textContent = "CNPJ inválido. Verifique os dígitos.";
          parent.appendChild(erro);
        }
      } else {
        this.style.borderColor = "";
        this.setCustomValidity("");
        var erroExistente = this.parentElement.querySelector(".cnpj-error");
        if (erroExistente) erroExistente.remove();
      }
    });
  }

  // Tenta inicializar quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Retry para formulários carregados dinamicamente (RD Station)
  setTimeout(init, 1500);
  setTimeout(init, 3000);
})();
