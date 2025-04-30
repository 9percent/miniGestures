/*
 *  Copyright (C) 2013  AJ Ribeiro
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
chrome.tabs.onRemoved.addListener(
    function (tabId, removeInfo) {
        chrome.tabs.get(tabId, function (tab) {
            x = tabId.toString()
            optionStorage.get(x, function (items) {
                optionStorage.set({ "lasturl": items[x].slice(9, items[x].length) }, function () { });
                optionStorage.remove(x, function (Items) { });
            });
        });
    });


chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        chrome.tabs.get(tabId, function (tab) {
            var kk = tabId.toString()
            var x = {}
            x[kk] += tab.url
            optionStorage.set(x, function () { });
        });

    });

*/

var optionStorage = chrome.storage.local;
chrome.storage.local.get("sync", (data) => {
    if (data.sync) {
        optionStorage = chrome.storage.sync;
    } else {
        optionStorage = chrome.storage.local;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        console.log("onmessage", request);
        if (request.msg == "newtab") {
            chrome.tabs.create({});
            sendResponse({ resp: "tab open" });
        }

        if (request.msg == "closetab") {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                function (tab) {
                    chrome.tabs.query({ currentWindow: true }, (activeTabs) => {
                        if (activeTabs.length === 1) {
                            chrome.tabs.create({ active: false });
                        }
                    });
                    chrome.tabs.remove(tab[0].id);
                }
            );
            sendResponse({ resp: "tab closed" });
        }

        if (request.msg == "colorCode") {
            const data = await optionStorage.get("colorCode");
            sendResponse({ resp: data.colorCode });
        }

        if (request.msg == "width") {
            const data = await optionStorage.get("width");
            sendResponse({ resp: data.width });
        }

        if (request.msg == "gests") {
            gests = {};
            const data = await optionStorage.get(null);
            for (key in data) {
                if (key == "colorCode" || key == "width") continue;
                gests[key] = data[key];
            }
            sendResponse({ resp: gests });
        }

        if (request.msg == "rocker") {
            const data = await optionStorage.get("rocker");
            sendResponse({ resp: data.rocker });
        }

        if (request.msg == "trail") {
            const data = await optionStorage.get("trail");
            sendResponse({ resp: data.trail });
        }

        if (request.msg == "lasttab") {
            chrome.sessions.restore();
            sendResponse({ resp: "tab opened" });
        }

        if (request.msg == "reloadall") {
            chrome.tabs.query({ currentWindow: true }, function (tabs) {
                for (var i = 0; i < tabs.length; i++)
                    chrome.tabs.update(tabs[i].id, { url: tabs[i].url });
            });
            sendResponse({ resp: "tabs reloaded" });
        }

        if (request.msg == "nexttab") {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                function ([tab]) {
                    chrome.tabs.query({ currentWindow: true }, function (tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            if (tabs[i].id == tab.id) {
                                if (i == tabs.length - 1)
                                    chrome.tabs.update(tabs[0].id, {
                                        active: true,
                                    });
                                else
                                    chrome.tabs.update(tabs[i + 1].id, {
                                        active: true,
                                    });
                                break;
                            }
                        }
                    });
                }
            );
            sendResponse({ resp: "tab switched" });
        }

        if (request.msg == "prevtab") {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                function ([tab]) {
                    chrome.tabs.query({ currentWindow: true }, function (tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            if (tabs[i].id == tab.id) {
                                if (i == 0)
                                    chrome.tabs.update(
                                        tabs[tabs.length - 1].id,
                                        {
                                            active: true,
                                        }
                                    );
                                else
                                    chrome.tabs.update(tabs[i - 1].id, {
                                        active: true,
                                    });
                                break;
                            }
                        }
                    });
                }
            );
            sendResponse({ resp: "tab switched" });
        }

        if (request.msg == "closeback") {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                function ([tab]) {
                    chrome.tabs.query({ currentWindow: true }, function (tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            if (tabs[i].id != tab.id)
                                chrome.tabs.remove(tabs[i].id);
                        }
                    });
                }
            );
            sendResponse({ resp: "background closed" });
        }

        if (request.msg == "closeall") {
            chrome.tabs.query({ currentWindow: true }, function (tabs) {
                for (var i = 0; i < tabs.length; i++)
                    chrome.tabs.remove(tabs[i].id);
            });
            sendResponse({ resp: "tabs closed" });
        }

        if (request.msg == "togglemute") {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                async ([tab]) => {
                    let muted = !tab.mutedInfo.muted;
                    await chrome.tabs.update(tab.id, { muted });
                }
            );
        }

        sendResponse({ resp: "probs" });
    })();

    return true;
});
