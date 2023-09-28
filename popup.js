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
        app.API_KEY = openAiApiKey;
    }

    // Add event listener to input that updates API Key
    app.ui.APIKeyInput.addEventListener("keyup", (e) => {
        onKeyUp(e.target.value);
        app.API_KEY = e.target.value;
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

                var author = document.createElement(`p`);
                author.innerHTML = `<div style="">
                By Weng:<br/>
                <div style="margin-top:5px;">
                    <a target="_blank" href="https://www.github.com/Siphon880gh/" rel="nofollow">
                        <img src="https://camo.githubusercontent.com/fbc3df79ffe1a99e482b154b29262ecbb10d6ee4ed22faa82683aa653d72c4e1/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4769744875622d3130303030303f7374796c653d666f722d7468652d6261646765266c6f676f3d676974687562266c6f676f436f6c6f723d7768697465"
                            data-canonical-src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&amp;logo=github&amp;logoColor=white" style="max-width: 100%; height:20px;">
                    </a>
                    <a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow">
                        <img src="https://camo.githubusercontent.com/0f56393c2fe76a2cd803ead7e5508f916eb5f1e62358226112e98f7e933301d7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c696e6b6564496e2d626c75653f7374796c653d666c6174266c6f676f3d6c696e6b6564696e266c6162656c436f6c6f723d626c7565" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:100%;">
                    </a>
                    <a target="_blank" href="https://www.youtube.com/user/Siphon880yt/" rel="nofollow">
                        <img src="https://camo.githubusercontent.com/0bf5ba8ac9f286f95b2a2e86aee46371e0ac03d38b64ee2b78b9b1490df38458/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f596f75747562652d7265643f7374796c653d666c6174266c6f676f3d796f7574756265266c6162656c436f6c6f723d726564" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:100%;">
                    </a>
                </div>
            </div>`;

                var content = document.createElement("div")
                content.innerHTML = response;

                container.append(heading);
                container.append(author);
                container.append(content);
                return container;

            })())

        })
        .catch(error => console.error(error));
}