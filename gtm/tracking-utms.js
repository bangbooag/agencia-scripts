/**
 * Tracking de UTMs — Captura e persistência de parâmetros UTM
 *
 * Captura utm_source, utm_medium, utm_campaign, utm_term e utm_content
 * da URL e persiste em cookies/sessionStorage para uso em formulários,
 * analytics e atribuição de leads.
 *
 * Uso via GTM: adicione como tag "HTML Personalizado" disparada em All Pages.
 *
 * CDN: https://cdn.jsdelivr.net/gh/hmax27/agencia-scripts@main/gtm/tracking-utms.js
 */
(function () {
  "use strict";

  var UTM_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  var COOKIE_DAYS = 30;
  var COOKIE_PREFIX = "_agencia_";

  /**
   * Lê um parâmetro da query string.
   * @param {string} name
   * @returns {string|null}
   */
  function getParam(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  /**
   * Salva um cookie com expiração em dias.
   * @param {string} name
   * @param {string} value
   * @param {number} days
   */
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie =
      name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
  }

  /**
   * Lê um cookie pelo nome.
   * @param {string} name
   * @returns {string|null}
   */
  function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Retorna os UTMs atuais (da URL ou do cookie/storage).
   * @returns {Object}
   */
  function getUTMs() {
    var utms = {};
    UTM_PARAMS.forEach(function (param) {
      utms[param] =
        getParam(param) ||
        getCookie(COOKIE_PREFIX + param) ||
        sessionStorage.getItem(COOKIE_PREFIX + param) ||
        null;
    });
    return utms;
  }

  /**
   * Captura UTMs da URL e persiste em cookie + sessionStorage.
   */
  function captureUTMs() {
    var hasNew = false;

    UTM_PARAMS.forEach(function (param) {
      var value = getParam(param);
      if (value) {
        setCookie(COOKIE_PREFIX + param, value, COOKIE_DAYS);
        try {
          sessionStorage.setItem(COOKIE_PREFIX + param, value);
        } catch (e) {
          // sessionStorage indisponível (modo privado em alguns browsers)
        }
        hasNew = true;
      }
    });

    // Se chegou com UTMs, salva timestamp da primeira visita
    if (hasNew && !getCookie(COOKIE_PREFIX + "first_visit")) {
      setCookie(COOKIE_PREFIX + "first_visit", new Date().toISOString(), COOKIE_DAYS);
    }
  }

  /**
   * Preenche campos ocultos de formulários com os UTMs capturados.
   * Busca inputs com name correspondente aos parâmetros UTM.
   */
  function fillFormFields() {
    var utms = getUTMs();

    UTM_PARAMS.forEach(function (param) {
      if (!utms[param]) return;

      // Busca campos ocultos com nome do UTM
      var fields = document.querySelectorAll(
        'input[name="' + param + '"], ' +
        'input[name="cf_' + param + '"], ' +
        'input[data-field="' + param + '"]'
      );

      fields.forEach(function (field) {
        field.value = utms[param];
      });
    });
  }

  // Executa
  captureUTMs();

  // Preenche formulários quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fillFormFields);
  } else {
    fillFormFields();
  }

  // Retry para formulários carregados dinamicamente
  setTimeout(fillFormFields, 2000);

  // Expõe API global para uso em outros scripts
  window.__agenciaUTMs = {
    get: getUTMs,
    capture: captureUTMs,
    fill: fillFormFields,
  };
})();
