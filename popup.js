/**
 * App is singleton object that contains the important peices to communicat to ChatGPT
 */
var app = {
    ui: {
        APIKeyInput: document.querySelector("#openai-api-key"),
    },
    API_KEY: "",
    PROMPT: "Explain to me the moving average indicator? Keep it short"
}

function onLoad() {

    // Load API Key into input
    var openAiApiKey = localStorage.getItem("ce__stocks_api_key");
    if(openAiApiKey) {
        app.ui.APIKeyInput.value = openAiApiKey;
    }

    // Add event listener to input that updates API Key
    app.ui.APIKeyInput.addEventListener("keyup", (e) => {
        onKeyUp(e.target.value);
    });

    // Add event listener to button that prompts AI and gets insights to user
    document.querySelector("#stock-insights-go").addEventListener("click", (e) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type:"testURL", data: {}}, function(response) {
                if(chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else {
                    console.log(response.data);
                    if(response.data.toUpperCase().includes("PASSES")) {
                        promptAI();
                    }
                }
            });
        });
    });
}
onLoad();

function onKeyUp(newOpenAiApiKey) {
    localStorage.setItem("ce__stocks_api_key", newOpenAiApiKey);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"testAPIKey", data: newOpenAiApiKey}, function(response) {
            if(chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                console.log(response.data);
            }
        });
    });
}


function promptAI() {
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + app.API_KEY
        },
        body: JSON.stringify({
            messages: [
                { "role": "system", "content": "You are a helpful stocks trading bot and stocks trading mentor." },
                { "role": "user", "content": app.PROMPT }
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