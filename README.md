# CorrigirFácil

Protótipo web, em português, para corrigir gabaritos fotografados pelo celular. Sem dependências ou envio de fotos a servidores.

## Executar

Na pasta do repositório:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Abra a página em um navegador. Para disponibilizar no celular, hospede os três arquivos `index.html`, `style.css` e `app.js` em um serviço estático com HTTPS. O seletor de arquivos solicita a câmera traseira nos navegadores compatíveis; também permite escolher uma foto. Não há captura contínua de vídeo.

## Fluxo

1. Informe a quantidade de alternativas, a nota máxima e as respostas corretas, separadas por espaços, vírgulas ou quebras de linha.
2. Fotografe um bloco de respostas, com uma questão por linha e alternativas igualmente espaçadas em colunas.
3. Marque o centro da primeira alternativa da primeira questão e o centro da última alternativa da última questão.
4. Analise e confira **todas** as respostas. Leituras pouco claras ficam em branco para revisão. Ajuste as seleções usando a foto como referência.
5. Calcule a nota e confira o resultado por questão. Questões têm pesos iguais; respostas em branco não pontuam.

Para gabaritos irregulares ou com vários blocos, use o preenchimento manual. O protótipo **não reconhece automaticamente qualquer modelo de gabarito**: não há OCR, correção de perspectiva nem detecção de linhas. Sombras, letras impressas, rasuras e desalinhamento podem gerar leituras incorretas, inclusive com aparente confiança. A revisão do professor é obrigatória para uso real.

Fotos e respostas permanecem apenas na memória da página e são descartadas ao recarregar. Não há cadastro, banco de dados ou histórico.

## Validação

```sh
node --check app.js
```

A leitura real da câmera e a precisão em provas impressas precisam ser avaliadas em aparelhos e fotos representativos antes de uso em sala de aula.
