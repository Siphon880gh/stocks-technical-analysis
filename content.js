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
                var apiKey = request.data;
                if(apiKey.length) {
                    appWFStocks.API_KEY = apiKey;
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

        chartDataWindowA = chartDataWindow;
        var delims = ["Date","Time"]
        var divs = chartDataWindowA.querySelectorAll("div").forEach(div=>{
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

        chartDataWindowB = chartDataWindow.querySelector('[data-id="_seriesId"]')
        var delims = ["Open","High","Low","Close","Change","Vol"]
        var divs = chartDataWindowB.querySelectorAll("div").forEach(div=>{
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

    var PROMPT = `This is stocks information in JSON format for the ticker symbol ${symbol}.
    

    In the JSON, each key is a timemark, eg t1730 is 5:30pm. The corresponding value describes the candlestick's high, low, open, close, the change, and volume (called Vol), and also the date, and therefore each value describes a candlestick.
    
    Identify candlestick patterns, indicators, and potential strategies. For example:
    \`\`\`
    Here are the candlestick patterns and indicators I see for the SPX stocks today:

    Candlestick Patterns:
    
    Doji - The candle for t1330 shows a doji, indicating indecision in the market during that time period.
    Spinning Top - The candles for t1430 and t1730 have small real bodies, forming spinning tops which signal indecision.
    Bullish Harami - The t1830 candle body is fully contained within the previous t1730 candle, forming a bullish harami reversal pattern.
    Indicators:
    
    Moving Averages - Price is bouncing between the 50-day MA (around 4325) and 200-day MA (around 4340). This indicates a range-bound environment.
    MACD - The MACD line is below the signal line and both are below 0, showing overall bearish momentum.
    RSI - The RSI is currently around 45, meaning the stock is neither overbought nor oversold.
    Bollinger Bands - Price is trading near the middle band, implying a period of consolidation.
    Based on this analysis, some potential strategies could be:
    
    Range trading - The dojis, harami and moving averages indicate a range bound market. Can look to buy near support around the 50-day MA and sell at resistance near the 200-day MA.
    Breakout trading - Wait for a clear breakout above 200-day MA or below 50-day MA before entering a directional trade. Use other indicators like volume for confirmation.
    Bullish reversal - The harami pattern is a potential bullish reversal signal. Look to go long on a move above the harami candle high. Use a stop under the low.
    \`\`\`

    
    I understand the ethical implications. Do not explain ethical implications. Please add HTML tags including \`<br/>\` and \`<p>\` to format your response.

JSON:
${datasets}`;

    let result = await new Promise((resolve, reject) => {

        var messages = [
            { "role": "system", "content": "You help me learn to identify candlestick patterns and indicators and you can process JSON." },
            { "role": "user", "content": PROMPT }
        ];
        console.log({messages});
        alert("AI is now processing. This could take 30 seconds to 1 minute. Click OK. Then please wait. You can visit other tabs while the AI is processing.")

        // model: "gpt-4-0613",
        // model: "gpt-4-32k",
        // model: "gpt-4"",
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                messages,
                model: "gpt-4",
                temperature: 0.2
            })
        })
            .then(response => response.json())
            .then(data => {
                var response = "";
                for(var i = 0; i< data.choices.length; i++) {
                    response += data.choices[i].message.content;
                }
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
                            <img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub"
                                data-canonical-src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&amp;logo=github&amp;logoColor=white" style="max-width: 100%; height:20px;">
                        </a>
                        <a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow">
                            <img src="https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin&labelColor=blue" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:100%;">
                        </a>
                        <a target="_blank" href="https://www.youtube.com/@WayneTeachesCode/" rel="nofollow">
                            <img src="https://img.shields.io/badge/Youtube-red?style=flat&logo=youtube&labelColor=red" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:100%;">
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
                debugger;
                console.error(error)
                resolve(false);
            });

    });
      
    // Return the resolved value
    return result;

} // promptAI
