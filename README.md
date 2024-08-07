# Stocks Technical Analysis - Chrome Extension

![Last Commit](https://img.shields.io/github/last-commit/Siphon880gh/stocks-technical-analysis)
<a target="_blank" href="https://github.com/Siphon880gh/stocks-technical-analysis" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" style="max-width:10ch;"></a>
<a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin&labelColor=blue" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:10ch;"></a>
<a target="_blank" href="https://www.youtube.com/@WayneTeachesCode/" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-red?style=flat&logo=youtube&labelColor=red" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:10ch;"></a>

:page_facing_up: Description:
---
By Weng Fei Fung. A concept occurred to me as I read about the prediction of stock trends through the interpretation of candlestick patterns and the integration of tools like moving averages. I wondered, could I develop a Chrome extension capable of translating chart information at TradingView.com into JSON format, subsequently utilizing AI to recognize candlestick configurations, indicators, and formulate potential strategies? There would be no need for computer vision. Motivated by this idea, I successfully created this tool in a single day. Another motivation is that since this is part of an AI pipeline, later I can have it generate more sophisticated insights.

:open_file_folder: Table of Contents:
---
- [Description](#description)
- [Preview](#camera-preview)
- [Installation and Usage](#minidisc-installation-and-usage)
- [Attribution](#handshake-attribution)
- [Future Version](#crystal_ball-future-version)

:camera: Preview:
---
<img alt="chrome-popover" src="screenshots/extension.jpg" style="width:50%;">

![Recommendations](screenshots/recommendations.jpg)

## :minidisc: Installation and Advance Use:
If I haven't uploaded to the Chrome Web Store yet, please kindly enable Developer Mode at the extensions page, then drop in the folder containing this code.

Because I have not came up with a pricing model to cover costs and this is essentially free, you need to enter your own OpenAI API Key. Clicking the extension icon on the Chrome browser will give you a space to enter your API Key. Clicking the question icon will take you to OpenAI API platform where you can get setup for an API key.

## :handshake: Attribution

Thanks to Zulkifly Suradin at Flaticon for the [icon](https://www.flaticon.com/free-icon/candlestick-chart_6353961?related_id=6353961).

## :crystal_ball: Future version
In upcoming versions, the report will also incorporate macro analysis. This enhancement will be facilitated by a scraper, housed on my own server, designed to navigate the internet news at intervals using cron jobs. This advanced feature will present information inclusive of sentiment metrics and historical considerations and combine with metrics in different algorithms that make sense for different industries. This will seamlessly integrate with my Chrome extension via API under the hood for paid members at the Pro tier.
