# Stocks Technical Analysis - Chrome Extension

![Last Commit](https://img.shields.io/github/last-commit/Siphon880gh/stocks-technical-analysis)
<a target="_blank" href="https://github.com/Siphon880gh/stocks-technical-analysis" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" style="max-width:10ch;"></a>
<a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://camo.githubusercontent.com/0f56393c2fe76a2cd803ead7e5508f916eb5f1e62358226112e98f7e933301d7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c696e6b6564496e2d626c75653f7374796c653d666c6174266c6f676f3d6c696e6b6564696e266c6162656c436f6c6f723d626c7565" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:10ch;"></a>
<a target="_blank" href="https://www.youtube.com/user/Siphon880yt/" rel="nofollow"><img src="https://camo.githubusercontent.com/0bf5ba8ac9f286f95b2a2e86aee46371e0ac03d38b64ee2b78b9b1490df38458/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f596f75747562652d7265643f7374796c653d666c6174266c6f676f3d796f7574756265266c6162656c436f6c6f723d726564" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:10ch;"></a>

:page_facing_up: Description:
---
By Weng Fei Fung. A concept occurred to me as I read about the prediction of stock trends through the interpretation of candlestick patterns and the integration of tools like moving averages. I wondered, could I develop a Chrome extension capable of translating chart information at TradingView.com into JSON format, subsequently utilizing AI to recognize candlestick configurations, indicators, and formulate potential strategies? There would be no need for computer vision. Motivated by this idea, I successfully created this tool in a single day. Another motivation is that since this is part of an AI pipeline, later I can have it generate more sophisticated insights.

:open_file_folder: Table of Contents:
---
- [Description](#description)
- [Preview](#camera-preview)
- [Installation and Usage](#minidisc-installation-and-usage)
- [Future Version](#crystal_ball-future-version)

:camera: Preview:
---
<img alt="chrome-popover" src="https://scontent-sjc3-1.xx.fbcdn.net/v/t39.30808-6/383219912_2959395600859757_6788235496248603569_n.jpg?stp=cp6_dst-jpg&_nc_cat=103&ccb=1-7&_nc_sid=49d041&_nc_ohc=xHuyr91CX10AX_s8lnC&_nc_ht=scontent-sjc3-1.xx&oh=00_AfCbrHZoc6FeqP7NugW0vfejDZ5zgQvI-_-LqwRzRblHZw&oe=651ACBF3" style="width:50%;">

![image](https://scontent-sjc3-1.xx.fbcdn.net/v/t39.30808-6/384473146_2959395370859780_5321081469742067896_n.jpg?stp=cp6_dst-jpg&_nc_cat=100&ccb=1-7&_nc_sid=49d041&_nc_ohc=s80oXm2Yu0gAX-jKmIn&_nc_ht=scontent-sjc3-1.xx&oh=00_AfCbooPrBieal9LixiTkXxdMj1rThoJAcc4awdWPmAqMhw&oe=65196489)

## :minidisc: Installation and Advance Use:
If I haven't uploaded to the Chrome Web Store yet, please kindly enable Developer Mode at the extensions page, then drop in the folder containing this code.

Because I have not came up with a pricing model to cover costs and this is essentially free, you need to enter your own OpenAI API Key. Clicking the extension icon on the Chrome browser will give you a space to enter your API Key. Clicking the question icon will take you to OpenAI API platform where you can get setup for an API key.

## :crystal_ball: Future version
In upcoming versions, the report will also incorporate macro analysis. This enhancement will be facilitated by a scraper, housed on my own server, designed to navigate the internet news at intervals using cron jobs. This advanced feature will present information inclusive of sentiment metrics and historical considerations and combine with metrics in different algorithms that make sense for different industries. This will seamlessly integrate with my Chrome extension via API under the hood for paid members at the Pro tier.