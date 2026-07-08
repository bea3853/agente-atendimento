// netlify/functions/chat.js
exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Método Não Permitido" }) };
    }

    try {
        const body = JSON.parse(event.body);
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("ERRO: A variável de ambiente OPENROUTER_API_KEY não foi configurada no painel do Netlify.");
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Chave de API ausente nas configurações do servidor." })
            };
        }

        // Alterado o fallback padrão explicitamente para a versão gratuita (:free)
        const selectedModel = body.model || "google/gemini-2.5-flash:free";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "X-Title": "Concessionaria Francisco IA"
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: body.messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erro retornado pelo OpenRouter (Status ${response.status}):`, errorText);
            return {
                statusCode: response.status,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: `Erro na API externa: ${errorText}` })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Erro interno capturado na função:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: error.message || "Erro interno no servidor proxy" })
        };
    }
};
