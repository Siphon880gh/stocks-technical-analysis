if(window.location.href.toLowerCase().includes("tradingview.com"))
    console.log("Injected content.js for Stocks Technical Analysis");



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "testAPIKey":
            console.log(request.data); // This will log to the main page’s console.
            sendResponse({data:"Thanks for the info - content.js"});
            break;
        case "testURL":
            if(!window.location.href.toLowerCase().includes("tradingview.com")) {
                sendResponse({data:"Thanks for the info - content.js"});
                alert("Please navigate to a TradingView chart page to use this extension.");
            } else {
                sendResponse({data:"PASSES"});
            }
            break;
    } // switch
});
