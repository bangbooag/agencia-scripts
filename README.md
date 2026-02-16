# agencia-scripts

Repositório de scripts JavaScript da agência, servidos via [jsDelivr](https://www.jsdelivr.com/) como CDN.

## Estrutura

```
agencia-scripts/
├── rd/           → Scripts para RD Station (formulários, automações)
├── gtm/          → Templates e tags para Google Tag Manager
└── comercial/    → Scripts para cadências e automações comerciais
```

## Como usar

Cada script é acessível via CDN jsDelivr:

```
https://cdn.jsdelivr.net/gh/hmax27/agencia-scripts@main/{pasta}/{arquivo}.js
```

### Exemplo

```html
<script src="https://cdn.jsdelivr.net/gh/hmax27/agencia-scripts@main/rd/validador-cnpj.js"></script>
```

## Scripts disponíveis

| Script | Pasta | Descrição |
|--------|-------|-----------|
| `validador-cnpj.js` | `rd/` | Validação de CNPJ em formulários RD Station |
| `mascara-telefone.js` | `rd/` | Máscara automática para campo de telefone |
| `tracking-utms.js` | `gtm/` | Captura e persiste parâmetros UTM entre páginas |
