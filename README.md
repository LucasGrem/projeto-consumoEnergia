## ⚡ Simulador de Consumo de Energia Residencial - Projeto de Extensão

Este repositório contém o **Simulador de Consumo de Energia Residencial**, desenvolvido como projeto acadêmico de extensão para conscientizar os usuários sobre o desperdício elétrico e ajudá-los a entender o que mais pesa na conta de luz.

## 📊 Sobre o Projeto

A aplicação é uma ferramenta web responsiva que calcula o consumo em quilowatt-hora (kWh) e fornece uma estimativa em Reais (R$) por mês. O usuário escolhe os aparelhos da casa, informa a quantidade e o tempo de uso diário, e acompanha o resultado em tempo real, incluindo o ranking dos **"Maiores Vilões do seu Orçamento"**.

A tarifa padrão utilizada é de **R$ 0,75 por kWh** (referência para a região de São Paulo, com impostos e bandeira verde) e pode ser ajustada pelo usuário conforme a sua fatura.

### 🧮 Fórmula utilizada

```
kWh/mês = (Potência em Watts × Horas por dia × Dias no mês) / 1000
Custo   = kWh/mês × Tarifa (R$/kWh)
```

### ✨ Funcionalidades

- Cartões para 8 aparelhos de maior consumo (chuveiro, geladeira, ar-condicionado, ventilador, lâmpada LED, TV, máquina de lavar e ferro de passar)
- Ajuste de quantidade, tempo de uso (horas ou minutos) e potência de cada aparelho
- Dashboard em tempo real com consumo (kWh/mês) e custo (R$/mês)
- Ranking dos aparelhos que mais pesam na conta
- Dicas de eficiência energética alinhadas ao **ODS 12** (Consumo e Produção Responsáveis)
- Guia de como ler o relógio medidor de luz

## 🛠️ Tecnologias Utilizadas

### 🎨 Frontend
- **HTML5** – Estrutura semântica da aplicação
- **CSS3** – Estilização moderna, responsiva e mobile-first com variáveis CSS
- **Grid Layout** – Estrutura principal do layout
- **Flexbox** – Alinhamento interno dos elementos
- **JavaScript Vanilla** – Lógica da aplicação e interatividade, sem frameworks ou bibliotecas externas

## 🚀 Como publicar no GitHub Pages

1. Envie os arquivos `index.html`, `style.css` e `script.js` para a raiz do repositório
2. Acesse **Settings → Pages**
3. Em *Build and deployment*, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`
4. Aguarde a publicação e use o link gerado (ex.: `https://seu-usuario.github.io/nome-do-repositorio/`) para criar o **QR Code** de acesso pelo celular

## 📁 Estrutura de Arquivos

```
├── index.html   # Estrutura da página
├── style.css    # Estilos e responsividade
├── script.js    # Cálculos e interatividade
└── README.md
```

## 👨‍💻 Desenvolvido por

**Lucas Grem Silva**  
Estudante de Engenharia de Software – Cruzeiro do Sul Virtual
