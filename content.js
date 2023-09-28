var appWFStocks = {
    PROMPT: "Please reiterate to me: 'Error, something went wrong.'",
    API_KEY: "",
}

if(window.location.href.toLowerCase().includes("tradingview.com"))
    console.log("Injected content.js for Stocks Technical Analysis");



chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    switch(request.type) {
        case "testAPIKey":

            localStorage.setItem("ce__stocks_api_key", request.data);
            appWFStocks.API_KEY = openAiApiKey;

            //console.log(request.data); // This will log to the main page’s console. It's the API key.
            sendResponse({data:"Success: Popup.js sent API Key to content.js where the scraper and AI prompter is housed"});
            break;
        case "testURL":
            if(!window.location.href.toLowerCase().includes("tradingview.com") 
            || !window.location.href.toLowerCase().includes("/chart/")) {
                sendResponse({data:"FAILS"});
                alert("Please navigate to a TradingView chart page to use this extension.");
            } else {

                // Test API Key again
                var openAiApiKey = localStorage.getItem("ce__stocks_api_key");
                if(openAiApiKey) {
                    appWFStocks.API_KEY = openAiApiKey;
                    sendResponse({data:"PASSES"});
                } else {
                    alert("Critical Error: Please enter your OpenAI API Key in the extension.")
                    sendResponse({data:"FAILS"});
                    return;
                }

                // Offload scraping, AI querying, and reporting to content
                loadingAnimation(true);
                var [datasets, symbol] = await userJobsToDo();
                console.log({datasets, symbol})
                await promptAI(datasets, symbol);
                loadingAnimation(false);

            } // testURL
            break;
    } // switch
});

async function scraper() {

    let result = await new Promise((resolve, reject) => {
        console.log(`Hacking TradingViewing...
        1. Please right-click on a candlestick, then open Data Window.\n2. Scroll your mouse over all the x axis, so I can scrape the changing data window's values. Take as long as needed.\n3.Click the chart when done.\n\nComing soon - Video demonstration.`);
        
        var containers = {};
        
        function scrapeDataWindow() {
            var container = {}
            var chartDataWindows = document.querySelectorAll(".chart-data-window");
            var chartDataWindow = chartDataWindows[0]
            
            var delims = ["Date","Time","Open","High","Low","Close","Change","Vol"]
            
            var divs = chartDataWindow.querySelectorAll("div").forEach(div=>{
                for(var i=0; i<delims.length; i++) {
                    var DELIM = delims[i];
                    if(div.textContent.trim() === DELIM && div.textContent.trim().length=== DELIM.length) {
                        container[DELIM] = {
                            this: div,
                            parentText: div.parentNode.textContent,
                            negativeMatch: div.parentNode.textContent.split(DELIM)?.[1]?.trim()
                        }
                        //console.log(container)
                    }
                } // for
            });
            
            console.group("Container");
            console.log(container)
            console.groupEnd()
        
            var jsonCompatibleTimeKey = container.Time.negativeMatch;
            jsonCompatibleTimeKey = jsonCompatibleTimeKey.replaceAll(":","");
            jsonCompatibleTimeKey = "t" + jsonCompatibleTimeKey
                
            containers[jsonCompatibleTimeKey] = (()=>{
                let {Date, Open, High, Low, Close, Change, Vol} = container;
                return {
                    Date: Date.negativeMatch,
                    Open: Open.negativeMatch,
                    High: High.negativeMatch,
                    Low: Low.negativeMatch,
                    Close: Close.negativeMatch,
                    Change: Change.negativeMatch,
                    Vol: Vol.negativeMatch,
                }
            })()
        } // scrapeDataWindow
        
        window.runningHack = true;
        
        // Command to stop and then generate
        document.addEventListener("click", function(event) {
            window.runningHack = false;
        });
        
        function generateDatasets() {
            console.log(containers);
            resolve(containers);
        }
        
        window.runningPoller = setInterval(()=>{
        
            if(!window.runningHack) {
                clearInterval(window.runningPoller);
                generateDatasets();
            } else {
                scrapeDataWindow();
            }
        
        }, 100)
    }); // Promise. Resolve is inside generateDatasets which is triggered by the click event listener (user clicks chart when done panning values)

    // Return the resolved value, which will be the unsorted/garbled time series
    return result;
}

async function userJobsToDo() {

    let makeDOMAvailable = await new Promise(async(resolve, reject) => {
        alert("1. Please right-click on a candlestick, then open Data Window.")
        var localPoller = setInterval(()=>{
            isDataWindowAvailable = document.querySelectorAll(".chart-data-window")?.length;
            if(isDataWindowAvailable) {
                clearInterval(localPoller);
                resolve(true);
            }
        }, 100);
    });


    let result = await new Promise(async(resolve, reject) => {
        alert("...\n2. Scroll your mouse over all the x axis, so I can scrape the changing Data Window's values. Take as long as needed.\n3.Click the chart when done.\n\nComing soon - Video demonstration.");

        // Time points might not be consecutive because user may pan non-consecutively to the scraper 

        // Mock Data
        // var unsortedTimePoints = `{"t1930":{"Date":"Thu 21 Sep '23","Open":"4337.85","High":"4340.20","Low":"4329.17","Close":"4330.01","Change":"−7.95 (−0.18%)","Vol":""},"t1330":{"Date":"Tue 12 Sep '23","Open":"4473.27","High":"4480.94","Low":"4467.50","Close":"4468.87","Change":"−18.60 (−0.41%)","Vol":""},"t1430":{"Date":"Mon 25 Sep '23","Open":"4311.90","High":"4330.81","Low":"4307.96","Close":"4326.16","Change":"+14.30 (+0.33%)","Vol":""},"t1730":{"Date":"Mon 25 Sep '23","Open":"4325.74","High":"4333.28","Low":"4322.96","Close":"4326.46","Change":"+0.77 (+0.02%)","Vol":""},"t1830":{"Date":"Mon 25 Sep '23","Open":"4326.44","High":"4332.75","Low":"4316.37","Close":"4326.70","Change":"+0.24 (+0.01%)","Vol":""},"t1630":{"Date":"Mon 25 Sep '23","Open":"4335.52","High":"4335.64","Low":"4322.78","Close":"4325.69","Change":"−9.62 (−0.22%)","Vol":""},"t1530":{"Date":"Mon 25 Sep '23","Open":"4326.34","High":"4336.21","Low":"4325.19","Close":"4335.31","Change":"+9.15 (+0.21%)","Vol":""}}`;
        // unsortedTimePoints = JSON.parse(unsortedTimePoints);
        
        // Real Data
        var unsortedTimePoints = await scraper();

        // Get the keys of the object and sort them based on the numeric part (eg. t1930 vs t2030)
        var sortedKeys = Object.keys(unsortedTimePoints).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));

        // Construct a new object with sorted keys
        var timeSeries = {};
        for(var key of sortedKeys) {
            timeSeries[key] = unsortedTimePoints[key];
        }

        resolve([timeSeries, window.location.href.match(/symbol\=(.*)/)?.[1]]);
      });
      
      // Return the resolved value
      return result;
    // Todo: Show video or gif steps (Data Window, panning mouse)
} // userJobsToDo

function loadingAnimation(mode) {
    // You'd have to inject a loading sprite on the content page (not popup.html modal)
    if(mode) {

    } else {

    }
} // loadingAnimation

async function promptAI(datasets, symbol) {
    datasets = JSON.stringify(datasets);

    debugger;
    appWFStocks.PROMPT = `Here is stocks for today at ticker symbol ${symbol}. Let me know any candlestick patterns and any indicators. What is the usual strategy? I understand the ethical implications. This is just for educational purposes.
    
    ${datasets}`;

    let result = await new Promise((resolve, reject) => {

        var messages = [
            { "role": "system", "content": "You help me learn to identify candlestick patterns and indicators." },
            { "role": "user", "content": appWFStocks.PROMPT }
        ];
        console.log({messages});

        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + appWFStocks.API_KEY
            },
            body: JSON.stringify({
                messages,
                model: "gpt-4-0613",
                temperature: 0.7,
                stop: '\n'
            })
        })
            .then(response => response.json())
            .then(data => {
                var response = data.choices[data.choices.length - 1].message.content;
                console.log(response);

                var win = window.open(`about:blank`);
                win.document.title = "Trading Bot";
                win.document.body.append((() => {
                    var container = document.createElement("div");
                    container.style.marginLeft = "15%";
                    container.style.marginRight = "15%";
    
    
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
    
                })()) // append to new window


                resolve(true);
    
            })
            .catch(error => {
                console.error(error)

                resolve(true);
                
            });

    });
      
    // Return the resolved value
    return result;

} // promptAI