/**
 * Máscara de Telefone para formulários RD Station
 *
 * Aplica máscara automática no campo de telefone:
 *   - Celular: (XX) XXXXX-XXXX
 *   - Fixo:    (XX) XXXX-XXXX
 *
 * Cole este script no campo "JavaScript customizado" do formulário no RD Station.
 *
 * CDN: https://cdn.jsdelivr.net/gh/hmax27/agencia-scripts@main/rd/mascara-telefone.js
 */
(function () {
  "use strict";

  /**
   * Aplica máscara de telefone brasileiro.
   * @param {string} value - Valor do campo (pode conter formatação)
   * @returns {string} Valor formatado
   */
  function mascaraTelefone(value) {
    var numeros = value.replace(/\D/g, "").substring(0, 11);

    if (numeros.length <= 2) {
      return numeros.replace(/^(\d{0,2})/, "($1");
    }

    if (numeros.length <= 6) {
      return numeros.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    }

    if (numeros.length <= 10) {
      // Fixo: (XX) XXXX-XXXX
      return numeros.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }

    // Celular: (XX) XXXXX-XXXX
    return numeros.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  /**
   * Valida se o telefone tem quantidade correta de dígitos.
   * @param {string} value
   * @returns {boolean}
   */
  function validarTelefone(value) {
    var numeros = value.replace(/\D/g, "");
    return numeros.length === 10 || numeros.length === 11;
  }

  function init() {
    var camposTelefone = document.querySelectorAll(
      'input[name="personal_phone"], input[name="mobile_phone"], ' +
      'input[name="cf_telefone"], input[name="phone"], ' +
      'input[type="tel"], input[data-field="phone"]'
    );

    camposTelefone.forEach(function (campo) {
      // Aplica máscara em tempo real
      campo.addEventListener("input", function () {
        var cursorPos = this.selectionStart;
        var valorAntes = this.value;
        this.value = mascaraTelefone(this.value);

        // Ajusta posição do cursor
        var diff = this.value.length - valorAntes.length;
        this.setSelectionRange(cursorPos + diff, cursorPos + diff);
      });

      // Valida no blur
      campo.addEventListener("blur", function () {
        var valor = this.value;
        if (valor && !validarTelefone(valor)) {
          this.style.borderColor = "#dc2626";
          this.setCustomValidity("Telefone inválido");

          var parent = this.parentElement;
          if (!parent.querySelector(".phone-error")) {
            var erro = document.createElement("span");
            erro.className = "phone-error";
            erro.style.cssText = "color:#dc2626;font-size:12px;margin-top:4px;display:block";
            erro.textContent = "Telefone inválido. Use (XX) XXXXX-XXXX.";
            parent.appendChild(erro);
          }
        } else {
          this.style.borderColor = "";
          this.setCustomValidity("");
          var erroExistente = this.parentElement.querySelector(".phone-error");
          if (erroExistente) erroExistente.remove();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  setTimeout(init, 1500);
  setTimeout(init, 3000);
})();
