function promptAI() {
    var API_KEY = "";
    var PROMPT = "Explain to me the moving average indicator? Keep it short"

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY
        },
        body: JSON.stringify({
            messages: [
                { "role": "system", "content": "You are a helpful stocks trading bot and stocks trading mentor." },
                { "role": "user", "content": PROMPT }
            ],
            model: "gpt-4-0613",
            temperature: 0.7,
            stop: '\n'
        })
    })
        .then(response => response.json())
        .then(data => {
            var response = data.choices[data.choices.length - 1].message.content;

            var win = window.open(`about:blank`);
            win.document.title = "Trading Bot";
            win.document.body.append((() => {
                var container = document.createElement("div");
                container.style.paddingLeft = "15%";
                container.style.paddingRight = "15%";


                var heading = document.createElement(`h2`);
                heading.innerHTML = "Recommendations from micro analysis";
                heading.style.textAlign = `center`;
                heading.style.marginTop = `55px`;

                var content = document.createElement("div")
                content.innerHTML = response;

                container.append(heading);
                container.append(content);
                return container;

            })())

        })
        .catch(error => console.error(error));
}