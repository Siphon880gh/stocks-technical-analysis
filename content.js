var appWFStocks = {
    API_KEY: "",
}

if(window.location.href.toLowerCase().includes("tradingview.com"))
    console.log("Injected content.js for Stocks Technical Analysis");



chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    switch(request.type) {
        case "testAPIKey":

            // Test API Key
            if(request.data.length) {
                appWFStocks.API_KEY = request.data;
                sendResponse({data:"Success: Popup.js sent API Key to content.js where the scraper and AI prompter is housed"});
            } else {
                appWFStocks.API_KEY = "";
                sendResponse({data:"Failed: You didn't set an API Key"});
            }
            break;
        case "testURL":
            if(!window.location.href.toLowerCase().includes("tradingview.com") 
            || !window.location.href.toLowerCase().includes("/chart/")) {
                sendResponse({data:"FAILS"});
                alert("Please navigate to a TradingView chart page to use this extension.");
            } else {

                // Test API Key again
                var openAiApiKey = request.data;
                if(openAiApiKey.length) {
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
                await promptAI(datasets, symbol, appWFStocks.API_KEY);
                loadingAnimation(false);

            } // testURL
            break;
    } // switch
});

window.userJobsToDo = async function() {
    var instructionsPart1 = `1. Please right-click on a candlestick, then open Data Window.\n2. Then make sure that Price Volume Trend is on from Indicators.\n\nThe next instructions will appear.`,
    instructionsPart2 = `3. Scroll your mouse over all the x axis, so I can scrape the changing Data Window's values. Take as long as needed.\n4. Click the chart when done.\n\nComing soon - Video demonstration.`
    window.containers = {};

    console.log(`Enhancing TradingView...
${instructionsPart1}
${instructionsPart2}`);

    var result = (async function initScrapingWorkflow() {
        let makeDOMAvailable = await new Promise(async(resolve, reject) => {
            alert(instructionsPart1)
            var localPoller = setInterval(()=>{
                isDataWindowAvailable = document.querySelectorAll(".chart-data-window")?.length;
                isVolumeOn = document.querySelector(".widgetbar-widget-datawindow")?.textContent?.match(/(Vol)/)?.length>=2; // would have substring Vol twice in Data Window
                if(isDataWindowAvailable && isVolumeOn) {
                    clearInterval(localPoller);
                    resolve(true);
                }
            }, 100);
        }); // promise


        let result = await new Promise(async(resolve, reject) => {
            alert(`...\n${instructionsPart2}`);

            // Real Data
            var unsortedTimePoints = await scraper();

            (()=>{
                    // Get the keys of the object and sort them based on the numeric part (eg. t1930 vs t2030)
                    var sortedKeys = Object.keys(unsortedTimePoints).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));
                    //var sortedKeys = Object.keys(unsortedTimePoints).sort((a, b) => parseInt(b.substring(1)) - parseInt(a.substring(1)));
        
        
                    // Construct a new object with sorted keys
                    var timeSeries = {};
                    for(var key of sortedKeys) {
                        timeSeries[key] = unsortedTimePoints[key];
                    }
        
                    resolve([timeSeries, window.location.href.match(/symbol\=(.*)/)?.[1]]);
            })();

        }); // promise

        // result is [{…}, 'AAPL'] 
        // where in {…}, every x is a key-value pair like t1930: {stats}
        // where stats contain the high, low, close, open, vol
        console.log(result);
        console.log(JSON.stringify(result[0]))

        // Return the resolved value
        return result;
    })(); // initScrapingWorkflow

    return result;

    // Todo: Show video or gif steps (Data Window, panning mouse)

} // userJobsToDo

window.scraper = async function() {

    let result = await new Promise((resolve, reject) => {
        
        // Command to stop and then generate
        window.runningHack = true;
        window.runningPoller = setInterval(()=>{
        
            if(!window.runningHack) {
                clearInterval(window.runningPoller);
                generateDatasets();
            } else {
                scrapeDataWindow();
            }
        
        }, 100)

        document.addEventListener("click", function(event) {
            window.runningHack = false;
        });
        
        function generateDatasets() {
            console.log(containers);
            resolve(containers);
        }
        
    }); // Promise. Resolve is inside generateDatasets which is triggered by the click event listener (user clicks chart when done panning values)

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
            
        window.containers[jsonCompatibleTimeKey] = (()=>{
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

    // Return the resolved value, which will be the unsorted/garbled time series because we just scraped from Data Window and the user could've panned in any direction
    return result;
} // scraper


function loadingAnimation(mode) {
    // You'd have to inject a loading sprite on the content page (not popup.html modal)
    if(mode) {

    } else {

    }
} // loadingAnimation

async function promptAI(datasets, symbol, apiKey) {
    datasets = JSON.stringify(datasets);

    var PROMPT = `Here is stocks for today at ticker symbol ${symbol}. Let me know any candlestick patterns and any indicators. What is the usual strategy? I understand the ethical implications. This is just for educational purposes.
    
    ${datasets}`;

    let result = await new Promise((resolve, reject) => {

        var messages = [
            { "role": "system", "content": "You help me learn to identify candlestick patterns and indicators." },
            { "role": "user", "content": PROMPT }
        ];
        console.log({messages});

        // model: "gpt-4-0613",
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                messages,
                model: "gpt-4-32k",
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