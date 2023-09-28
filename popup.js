/**
 * App is singleton object that contains the important peices to communicat to ChatGPT
 */
var app = {
    ui: {
        APIKeyInput: document.querySelector("#openai-api-key"),
    },
    API_KEY: ""
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
            // Test URL is at tradingview.com
            chrome.tabs.sendMessage(tabs[0].id, {type:"testURL", data: {}}, function(response) {
                if(chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else {
                    console.log(response.data);
                    if(response.data.toUpperCase().includes("PASSES")) {
                        console.log("Successfully found tradingview.com, now scraping, querying AI, and reporting trade insights to user");
                    } else {
                        console.log("Failed")
                    }
                }
            });
        }); // chrome tabs
    }); // event listener
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

