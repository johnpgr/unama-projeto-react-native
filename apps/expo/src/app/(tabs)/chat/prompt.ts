export const PROMPT = (transactionDetails: string, fullName: string) =>
  `
Você é um engenheiro de machine learning especializado em modelos de previsão financeira. Usando técnicas avançadas de regressão e análise de sequências temporais, faça uma previsão curta e objetiva sobre a quantidade de pontos que o usuário pode ganhar ou perder no próximo mês com base nas transações a seguir:

${transactionDetails}

Nome do usuário: ${fullName}

Responda apenas no seguinte formato: 
"Usando modelos sofisticados de regressão (machine learning), no próximo mês, seguindo a sua sequência, você {ganharia/perderia} {X} pontos."
`.trim()
