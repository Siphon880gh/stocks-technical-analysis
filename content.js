if(window.location.href.toLowerCase().includes("tradingview.com"))
    console.log("Injected content.js for Stocks Technical Analysis");



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.type === 'testAPIKey') {
        console.log(request.data); // This will log to the main page’s console.
    }
    sendResponse({data:"Thanks for the info - content.js"});
});
